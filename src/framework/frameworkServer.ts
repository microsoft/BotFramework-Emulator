import * as Restify from 'restify';
import { ConversationsController } from './conversationsController';
import { AttachmentsController } from './attachmentsController';
import { BotStateController } from './botStateController';
import { ISettings } from '../settingsStore';

export interface IPersistentSettings {
    port: number;
}

export class FrameworkServer {

    port: number;
    server: Restify.Server;
    conversationsController = new ConversationsController();
    attachmentsController = new AttachmentsController();
    botStateController = new BotStateController();

    constructor() {
        this.server = Restify.createServer({
            name: "framework"
        });

        this.server.use(Restify.acceptParser(this.server.acceptable));
        this.server.use(Restify.authorizationParser());
        this.server.use(Restify.CORS());
        this.server.use(Restify.dateParser());
        this.server.use(Restify.queryParser());
        this.server.use(Restify.jsonp());
        this.server.use(Restify.gzipResponse());
        this.server.use(Restify.requestLogger());
        this.server.use(Restify.conditionalRequest());
        this.server.use(Restify.fullResponse());
        this.server.use(Restify.bodyParser());

        this.conversationsController.registerRoutes(this.server);
        this.attachmentsController.registerRoutes(this.server);
        this.botStateController.registerRoutes(this.server);
    }

    public configure = (settings: ISettings) => {
        if (this.port !== settings.framework.port) {
            this.port = settings.framework.port;
            console.log(`restarting ${this.server.name} because ${this.port} !== ${settings.framework.port}`);
            this.stop();
            return this.server.listen(settings.framework.port, () => {
                console.log(`${this.server.name} listening to ${this.server.url}`);
            });
        }
    }

    public stop = () => {
        return this.server.close();
    }
}
