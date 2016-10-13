import * as Restify from 'restify';
import { ConversationsController } from './conversationsController';
import { AttachmentsController } from './attachmentsController';
import { BotStateController } from './botStateController';
import { ISettings } from '../settings/settingsStore';
import { RestServer } from '../restServer';


export interface IPersistentSettings {
    port: number;
}

/**
 * Communicates with the bot.
 */
export class FrameworkServer extends RestServer {

    serviceUrl = (): string =>
        `http://localhost:${this.port}/`;

    conversationsController = new ConversationsController();
    attachmentsController = new AttachmentsController();
    botStateController = new BotStateController();

    constructor() {
        super("framework");
        this.conversationsController.registerRoutes(this.server);
        this.attachmentsController.registerRoutes(this.server);
        this.botStateController.registerRoutes(this.server);
    }

    /**
     * Applies configuration changes.
     */
    configure = (settings: ISettings) => {
        if (this.port !== settings.framework.port) {
            console.log(`restarting ${this.server.name} because ${this.port} !== ${settings.framework.port}`);
            this.restart(settings.framework.port);
        }
    }
}
