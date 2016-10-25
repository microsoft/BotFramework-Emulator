import * as Restify from 'restify';
import { ConversationsControllerV1 } from './conversationsControllerV1';
import { RestServer } from '../restServer';
import { getStore, getSettings } from '../settings';


/**
 * Communicates with the BotChat control.
 */
export class DirectLineServer extends RestServer {

    constructor() {
        super("directLine");
        ConversationsControllerV1.registerRoutes(this.server);
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
        if (this.port !== settings.directLine.port) {
            console.log(`restarting ${this.server.name} because ${this.port} !== ${settings.directLine.port}`);
            this.restart(settings.directLine.port);
        }
    }
}
