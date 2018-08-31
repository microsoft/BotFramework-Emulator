#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const emulator_core_1 = require("@bfemulator/emulator-core");
const dotenv_1 = require("dotenv");
const fs_1 = require("fs");
const Restify = require("restify");
const CORS = require("restify-cors-middleware");
const get_port_1 = require("get-port");
const npmLogger_1 = require("./npmLogger");
const packageJSON = require('../package.json');
const program = require('commander');
dotenv_1.config();
program
    .version(packageJSON.version)
    .option('-p, --port <port>', 'port number for Direct Line service', 5000)
    .option('-I, --app-id <id>', 'Microsoft Application ID, will override environment "MICROSOFT_APP_ID"')
    .option('-P, --app-password <password>', 'Microsoft Application Password, will override environment "MICROSOFT_APP_PASSWORD"')
    .option('-s, --service-url <url>', 'URL for the bot to callback', 'http://localhost:5000')
    .option('-u, --bot-url <url>', 'URL to connect to bot', 'http://localhost:3978/api/messages/')
    .option('--bot-id <id>', 'bot ID', 'bot-1')
    .option('--use-10-tokens', 'use version 1.0 authentication tokens', false)
    .option('-f, --file <bots.json>', 'read endpoints from file')
    .on('--help', () => {
    console.log();
    console.log('  Notes:');
    console.log();
    console.log('    Use bots.json file to host multiple bots. Put MSA App ID as Direct Line secret to point to different bots.');
    console.log();
    console.log('    Using bots.json file will override endpoint defined thru --port and --bot-url.');
    console.log();
})
    .parse(process.argv);
// TODO: Support multi bot from file
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
    const port = program.port || await get_port_1.default(5000);
    // Create a bot entry
    const bot = new emulator_core_1.BotEmulator(program.serviceUrl || `http://localhost:${port}`, {
        tunnelingServiceUrl: '',
        loggerOrLogService: new npmLogger_1.default()
    });
    if (program.file) {
        const botsJSON = await new Promise((resolve, reject) => {
            fs_1.readFile(program.file, { encoding: 'utf8' }, (err, result) => err ? reject(err) : resolve(result));
        });
        const botEndpoints = JSON.parse(botsJSON);
        botEndpoints.forEach(endpoint => bot.facilities.endpoints.push(endpoint.botUrl, endpoint));
    }
    else {
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
    const urls = Object.keys(endpoints).reduce((urls, key) => [
        ...urls,
        endpoints[key].botUrl
    ], []).sort();
    // Start listening
    server.listen(port, () => {
        console.log(`${server.name} listening on ${server.url} with bot on ${urls.join(', ')}`);
        console.log(`The bot will callback on ${program.serviceUrl}`);
    });
}
main();
