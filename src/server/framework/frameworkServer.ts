import * as Restify from 'restify';
import { BotFrameworkAuthentication } from '../botFrameworkAuthentication';
import { ConversationsController } from './conversationsController';
import { AttachmentsController } from './attachmentsController';
import { BotStateController } from './botStateController';
import { RestServer } from '../restServer';
import { getStore, getSettings } from '../settings';
var platform = require('os').platform();
var ngrok = require('ngrok'); // import * as ngrok from 'ngrok';
import * as Fs from 'fs';


/**
 * Communicates with the bot.
 */
export class FrameworkServer extends RestServer {

    serviceUrl: string;

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
        if (this.port !== settings.framework.port) {
            console.log(`restarting ${this.server.name} because ${this.port} !== ${settings.framework.port}`);
            this.restart(settings.framework.port);
            ngrok.disconnect();
            ngrok.connect(this.port, (err, url: string) => {
                this.serviceUrl = url;
            });
        }
    }
}
