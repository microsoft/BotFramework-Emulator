import * as Restify from 'restify';
import { ConversationsControllerV1 } from './conversationsControllerV1';
import { ISettings } from '../settingsStore';

export interface IPersistentSettings {
    port: number;
}

export class DirectLineServer {

    port: number;
    server: Restify.Server;
    conversationsControllerV1 = new ConversationsControllerV1();

    constructor() {
        this.server = Restify.createServer({
            name: "directline"
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

        this.conversationsControllerV1.registerRoutes(this.server);
    }

    public configure = (settings: ISettings) => {
        if (this.port !== settings.directLine.port) {
            this.port = settings.directLine.port;
            console.log(`restarting ${this.server.name} because ${this.port} !== ${settings.directLine.port}`);
            this.stop();
            return this.server.listen(settings.directLine.port, () => {
                console.log(`${this.server.name} listening to ${this.server.url}`);
            });
        }
    }

    public stop = () => {
        return this.server.close();
    }
}
