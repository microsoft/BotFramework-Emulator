#!/usr/bin/env node

//
// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license.
//
// Microsoft Bot Framework: http://botframework.com
//
// Bot Framework Emulator Github:
// https://github.com/Microsoft/BotFramwork-Emulator
//
// Copyright (c) Microsoft Corporation
// All rights reserved.
//
// MIT License:
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//

import { BotEmulator } from "@bfemulator/emulator-core";
import { config } from "dotenv";
import { readFile } from "fs";
import getPort from "get-port";
import * as Restify from "restify";
import CORS from "restify-cors-middleware";

import NpmLogger from "./npmLogger";

const packageJSON = require("../package.json");
const program = require("commander");

config();

program
  // .command('bfemulator')
  .version(packageJSON.version)
  .option("-p, --port <port>", "port number for Direct Line service", 5000)
  .option(
    "-I, --app-id <id>",
    'Microsoft Application ID, will override environment "MICROSOFT_APP_ID"'
  )
  .option(
    "-P, --app-password <password>",
    "Microsoft Application Password, will override environment " +
      '"MICROSOFT_APP_PASSWORD"'
  )
  .option(
    "-s, --service-url <url>",
    "URL for the bot to callback",
    "http://localhost:5000"
  )
  .option(
    "-u, --bot-url <url>",
    "URL to connect to bot",
    "http://localhost:3978/api/messages/"
  )
  .option("--bot-id <id>", "bot ID", "bot-1")
  .option("--use-10-tokens", "use version 1.0 authentication tokens", false)
  .option("-f, --file <bots.json>", "read endpoints from file")
  .on("--help", () => {
    console.log();
    console.log("  Notes:");
    console.log();
    console.log(
      "    Use bots.json file to host multiple bots. Put MSA App ID as Direct Line secret to" +
        " point to different bots."
    );
    console.log();
    console.log(
      "    Using bots.json file will override endpoint defined thru --port and --bot-url."
    );
    console.log();
  })
  .parse(process.argv);

// TODO: Support multi bot from file

program.appId = program.appId || process.env.MICROSOFT_APP_ID;
program.appPassword = program.appPassword || process.env.MICROSOFT_APP_PASSWORD;

async function main() {
  // Create a Restify server
  const server = Restify.createServer({
    name: "localmode",
    handleUncaughtExceptions: true
  });

  // Setup CORS middleware for the whole server
  const cors = CORS({
    origins: ["*"],
    allowHeaders: ["authorization", "x-requested-with"],
    exposeHeaders: []
  });

  server.pre(cors.preflight);
  server.use(cors.actual);

  // Get a port number, we need this to construct `serviceUrl`
  const port = program.port || (await getPort(5000));

  // Create a bot entry
  const bot = new BotEmulator(
    async () => program.serviceUrl || `http://localhost:${port}`,
    {
      loggerOrLogService: new NpmLogger()
    }
  );

  if (program.file) {
    const botsJSON = await new Promise<string>((resolve, reject) => {
      readFile(program.file, { encoding: "utf8" }, (err, result) =>
        err ? reject(err) : resolve(result)
      );
    });

    const botEndpoints = JSON.parse(botsJSON);

    botEndpoints.forEach(endpoint =>
      bot.facilities.endpoints.push(endpoint.botUrl, endpoint)
    );
  } else {
    bot.facilities.endpoints.push(program.botUrl, {
      botId: program.botId,
      botUrl: program.botUrl,
      msaAppId: program.appId,
      msaPassword: program.appPassword,
      use10Tokens: program.use10Tokens
    });
  }

  // Mount bot routes on the server
  bot.mount(server);

  const endpoints = bot.facilities.endpoints.getAll();
  const urls = Object.keys(endpoints)
    .reduce((endpoint, key) => [...endpoint, endpoints[key].botUrl], [])
    .sort();

  // Start listening
  server.listen(port, () => {
    console.log(
      `${server.name} listening on ${server.url} with bot on ${urls.join(", ")}`
    );
    console.log(`The bot will callback on ${program.serviceUrl}`);
  });
}

main();
