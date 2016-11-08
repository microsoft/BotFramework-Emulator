import * as Restify from 'restify';
import * as log from './log';


export class RestServer {
    // REVIEW: Can we get this from the Restify.server?
    port: number;
    serviceUrl: string;
    router: Restify.Server;

    constructor(name: string) {
        this.router = Restify.createServer({
            name: name
        });

        // REVIEW: Which of these do we need?
        this.router.use(Restify.acceptParser(this.router.acceptable));
        this.router.use(Restify.authorizationParser());
        this.router.use(Restify.CORS());
        this.router.use(Restify.dateParser());
        this.router.use(Restify.queryParser());
        this.router.use(Restify.jsonp());
        this.router.use(Restify.gzipResponse());
        this.router.use(Restify.requestLogger());
        this.router.use(Restify.conditionalRequest());
        this.router.use(Restify.fullResponse());
        this.router.use(Restify.bodyParser({ mapParams: true, mapFiles: true}));
    }

    public restart(port: number) {
        this.stop();
        this.port = port;
        return this.router.listen(this.port, () => {
            if (this.router.name !== 'restify')
                log.info(`${this.router.name} listening on ${this.router.url}`);
        });
    }

    public stop() {
        return this.router.close();
    }
}
