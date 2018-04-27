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

import { Bot } from '@bfemulator/emulator-core';
import { config } from 'dotenv';
import * as Restify from 'restify';
import * as CORS from 'restify-cors-middleware';
import getPort from 'get-port';

const packageJSON = require('../package.json');
const program = require('commander');

config();

program
  // .command('bfemulator')
  .version(packageJSON.version)
  .option('-p, --port <port>', 'port number for Direct Line service', 5000)
  .option('-I, --app-id <id>', 'Microsoft Application ID, will override environment "MICROSOFT_APP_ID"')
  .option('-P, --app-password <password>', 'Microsoft Application Password, will override environment "MICROSOFT_APP_PASSWORD"')
  .option('-s, --service-url <url>', 'URL for the bot to callback', 'http://localhost:5000')
  .option('-u, --bot-url <url>', 'URL to connect to bot', 'http://localhost:3978/api/messages/')
  .option('--bot-id <id>', 'bot ID', 'bot-1')
  .parse(process.argv);

program.appId = program.appId || process.env.MICROSOFT_APP_ID;
program.appPassword = program.appPassword || process.env.MICROSOFT_APP_PASSWORD;

async function main() {
  // Create a Restify server
  const server = Restify.createServer({ name: 'localmode' });

  // Setup CORS middleware for the whole server
  const cors = CORS({
    origins: ['*'],
    allowHeaders: ['authorization', 'x-requested-with'],
    exposeHeaders: []
  });

  server.pre(cors.preflight);
  server.use(cors.actual);

  // Get a port number, we need this to construct `serviceUrl`
  const port = program.port || await getPort(5000);

  // Create a bot entry
  const bot = new Bot(
    program.botId,
    program.botUrl,
    program.serviceUrl || `http://localhost:${ port }`,
    program.appId,
    program.appPassword,
    {
      loggerOrLogService: {
        logToChat: console.log.bind(console)
      }
    }
  );

  // Mount bot routes on the server
  bot.mount(server);

  // Start listening
  server.listen(port, () => {
    console.log(`${ server.name } listening on ${ server.url } with bot on ${ program.botUrl }`);
    console.log(`The bot will callback on ${ program.serviceUrl }`);
  });
}

main();
