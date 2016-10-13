import * as Restify from 'restify';
import { ConversationsControllerV1 } from './conversationsControllerV1';
import { ISettings } from '../settings/settingsStore';
import { RestServer } from '../restServer';


/**
 * Communicates with the BotChat control.
 */
export class DirectLineServer extends RestServer {
    conversationsControllerV1 = new ConversationsControllerV1();

    constructor() {
        super("directLine");
        this.conversationsControllerV1.registerRoutes(this.server);
    }

    /**
     * Applies configuration changes.
     */
    configure = (settings: ISettings) => {
        if (this.port !== settings.directLine.port) {
            console.log(`restarting ${this.server.name} because ${this.port} !== ${settings.directLine.port}`);
            this.restart(settings.directLine.port);
        }
    }
}
