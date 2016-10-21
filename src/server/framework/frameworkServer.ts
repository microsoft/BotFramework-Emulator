import * as Restify from 'restify';
import { BotFrameworkAuthentication } from '../botFrameworkAuthentication';
import { ConversationsController } from './conversationsController';
import { AttachmentsController } from './attachmentsController';
import { BotStateController } from './botStateController';
import { RestServer } from '../restServer';
import { store, getSettings } from '../settings';


/**
 * Communicates with the bot.
 */
export class FrameworkServer extends RestServer {

    serviceUrl = (): string => `http://localhost:${this.port}/`;
    //serviceUrl = (): string => `https://5d458fad.ngrok.io/`;


    authentication = new BotFrameworkAuthentication();
    conversationsController = new ConversationsController();
    attachmentsController = new AttachmentsController();
    botStateController = new BotStateController();

    constructor() {
        super("framework");
        this.authentication.registerAuth(this.server);
        this.conversationsController.registerRoutes(this.server);
        this.attachmentsController.registerRoutes(this.server);
        this.botStateController.registerRoutes(this.server);
        store.subscribe(() => {
            this.configure();
        });
        this.configure();
    }

    /**
     * Applies configuration changes.
     */
    private configure = () => {
        const settings = getSettings();
        if (this.port !== settings.framework.port) {
            console.log(`restarting ${this.server.name} because ${this.port} !== ${settings.framework.port}`);
            this.restart(settings.framework.port);
        }
    }
}
