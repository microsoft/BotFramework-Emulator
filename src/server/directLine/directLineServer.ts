import * as Restify from 'restify';
import { ConversationsControllerV1 } from './conversationsControllerV1';
import { RestServer } from '../restServer';
import { store, getSettings } from '../settings';


/**
 * Communicates with the BotChat control.
 */
export class DirectLineServer extends RestServer {
    conversationsControllerV1 = new ConversationsControllerV1();

    constructor() {
        super("directLine");
        this.conversationsControllerV1.registerRoutes(this.server);
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
        if (this.port !== settings.directLine.port) {
            console.log(`restarting ${this.server.name} because ${this.port} !== ${settings.directLine.port}`);
            this.restart(settings.directLine.port);
        }
    }
}
