import * as Restify from 'restify';
import { BotFrameworkAuthentication } from '../botFrameworkAuthentication';
import { ConversationsController } from './conversationsController';
import { AttachmentsController } from './attachmentsController';
import { BotStateController } from './botStateController';
import { RestServer } from '../restServer';
import { getStore, getSettings } from '../settings';
import * as Fs from 'fs';
import * as Os from 'os';
var ngrok = require('ngrok'); // import * as ngrok from 'ngrok';

/**
 * Communicates with the bot.
 */
export class FrameworkServer extends RestServer {

    serviceUrl: string;

    authentication = new BotFrameworkAuthentication();

    constructor() {
        super("framework");
        this.authentication.registerAuth(this.server);
        ConversationsController.registerRoutes(this.server);
        AttachmentsController.registerRoutes(this.server);
        BotStateController.registerRoutes(this.server);
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
        // copy ngrok to target path
        // var targetNgrokPath = __dirname + '/bin/ngrok' + (Os.platform()  === 'win32' ? '.exe' : '');
        // if (!Fs.existsSync(__dirname + "/bin"))
        //     Fs.mkdirSync(__dirname + "/bin");

        // if (!Fs.existsSync(targetNgrokPath) && settings.framework.ngrokPath)
        //     Fs.linkSync(settings.framework.ngrokPath, targetNgrokPath);

        if (this.port !== settings.framework.port) {
            console.log(`restarting ${this.server.name} because ${this.port} !== ${settings.framework.port}`);
            this.restart(settings.framework.port);
            ngrok.disconnect();
            ngrok.connect(this.port, (err, url: string) => {
                this.serviceUrl = url;
            });
        }
    }
}
