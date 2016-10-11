import { Reducer } from 'redux';
import * as Restify from 'restify';
import { ConversationsController } from './conversationsController';
import { AttachmentsController } from './attachmentsController';
import { BotStateController } from './botStateController';
import { IFrameworkState, frameworkDefault } from './frameworkTypes';


export type FrameworkAction = {
    type: 'Set_FrameworkPort',
    port: number
}
export const frameworkSettings: Reducer<IFrameworkState> = (
    state = frameworkDefault,
    action: FrameworkAction
) => {
    switch (action.type) {
        case 'Set_FrameworkPort':
            return Object.assign({}, state, { port: action.port });
        default:
            return state
    }
}

export class FrameworkServer {

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

    public configure = (settings: IFrameworkState) => {
        if (this.server.localPort !== settings.port) {
            this.stop();
            return this.server.listen(settings.port, () => {
                console.log(`${this.server.name} listening to ${this.server.url}`);
            });
        }
    }

    public stop = () => {
        return this.server.close();
    }
}
