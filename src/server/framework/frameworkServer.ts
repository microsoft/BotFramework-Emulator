import * as Restify from 'restify';
import { BotFrameworkAuthentication } from '../botFrameworkAuthentication';
import { ConversationsController } from './conversationsController';
import { AttachmentsController } from './attachmentsController';
import { BotStateController } from './botStateController';
import { RestServer } from '../restServer';
import { getStore, getSettings } from '../settings';
import * as Fs from 'fs';
import * as Os from 'os';
import * as path from 'path';
var ngrok = require('./ngrok');

/**
 * Communicates with the bot.
 */
export class FrameworkServer extends RestServer {

    serviceUrl: string;

    inspectUrl: string;

    authentication = new BotFrameworkAuthentication();

    constructor() {
        super("framework");
        this.authentication.registerAuth(this.server);
        ConversationsController.registerRoutes(this.server);
        AttachmentsController.registerRoutes(this.server);
        BotStateController.registerRoutes(this.server);
        getStore().subscribe(() => {
            this.configure();
        });
        this.configure();
    }

    /**
     * Applies configuration changes.
     */
    private configure() {
        const settings = getSettings();

        // TODO REMOVE THIS
        if (!settings.framework.ngrokPath)
            settings.framework.ngrokPath = `${process.env['USERPROFILE']}\\AppData\\Roaming\\npm\\node_modules\\ngrok\\bin\\ngrok` + (Os.platform() === 'win32' ? '.exe' : '');

        if (this.port !== settings.framework.port) {
            console.log(`restarting ${this.server.name} because ${this.port} !== ${settings.framework.port}`);
            this.restart(settings.framework.port);
            // if we have an ngrok path
            if (settings.framework.ngrokPath) {
                // then make it so
                ngrok.disconnect();
                ngrok.connect({
                    port: this.port,
                    path: settings.framework.ngrokPath
                }, (err, url: string, inspectPort: string) => {
                    this.serviceUrl = url;
                    this.inspectUrl = `http://127.0.0.1:${inspectPort}`;
                });
            }
            else {
                this.serviceUrl = `http://localhost:${this.port}`;
                this.inspectUrl = null;
            }
        }
    }
}
