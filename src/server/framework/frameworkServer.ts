import * as Restify from 'restify';
import { BotFrameworkAuthentication } from '../botFrameworkAuthentication';
import { ConversationsController } from './conversationsController';
import { AttachmentsController } from './attachmentsController';
import { BotStateController } from './botStateController';
import { RestServer } from '../restServer';
import { getSettings, addSettingsListener } from '../settings';
import { Settings } from '../../types/serverSettingsTypes';
import * as log from '../log';
import * as Fs from 'fs';
import * as path from 'path';
import * as ngrok from './ngrok';


/**
 * Communicates with the bot.
 */
export class FrameworkServer extends RestServer {

    serviceUrl: string;
    inspectUrl: string;
    ngrokPath: string;

    authentication = new BotFrameworkAuthentication();

    constructor() {
        super("framework");
        this.authentication.registerAuth(this.server);
        ConversationsController.registerRoutes(this.server);
        AttachmentsController.registerRoutes(this.server);
        BotStateController.registerRoutes(this.server);
        addSettingsListener((settings: Settings) => {
            this.configure(settings);
        });
        this.configure(getSettings());
    }

    /**
     * Applies configuration changes.
     */
    private configure(settings: Settings) {
        let relaunchNgrok = false;

        // Did port change?
        if (this.port !== settings.framework.port) {
            console.log(`restarting ${this.server.name} because ${this.port} !== ${settings.framework.port}`);
            this.restart(settings.framework.port);
            // Respawn ngrok when the port changes
            relaunchNgrok = true;
        }

        // Did ngrok path change?
        if (relaunchNgrok || this.ngrokPath !== settings.framework.ngrokPath) {
            this.serviceUrl = `http://localhost:${this.port}`;
            this.inspectUrl = null;
            const prevNgrokPath = this.ngrokPath;
            this.ngrokPath = settings.framework.ngrokPath;
            const startNgrok = () => {
                // if we have an ngrok path
                if (this.ngrokPath) {
                    // then make it so
                    log.info(`starting ngrok: "${this.ngrokPath}"`);
                    ngrok.connect({
                        port: this.port,
                        path: this.ngrokPath
                    }, (err, url: string, inspectPort: string) => {
                        if (err) {
                            log.warn(`failed to start ngrok: ${err.message || err.msg}`);
                        } else {
                            log.info('ngrok started');
                            this.serviceUrl = url;
                            this.inspectUrl = `http://127.0.0.1:${inspectPort}`;
                        }
                    });
                }
            }
            // Try to kill then respawn ngrok. If that fails, then try to spawn ngrok now (maybe it wasn't running).
            if (ngrok.running()) {
                ngrok.kill(() => {
                    log.info('ngrok stopped');
                    startNgrok();
                    return true;
                }) || startNgrok();
            } else {
                startNgrok();
            }
        }
    }
}
