import { Reducer } from 'redux';
import * as Restify from 'restify';
import { ConversationsControllerV1 } from './conversationsControllerV1';
import { IDirectLineState, directLineDefault } from './directLineTypes';


export type DirectLineAction = {
    type: 'Set_DirectLinePort',
    port: number
}
export const directLineSettings: Reducer<IDirectLineState> = (
    state = directLineDefault,
    action: DirectLineAction
) => {
    switch (action.type) {
        case 'Set_DirectLinePort':
            return Object.assign({}, state, { port: action.port });
        default:
            return state
    }
}

export class DirectLineServer {

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

    public configure = (settings: IDirectLineState) => {
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
