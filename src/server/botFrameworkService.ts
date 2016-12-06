//
// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license.
//
// Microsoft Bot Framework: http://botframework.com
//
// Bot Framework Emulator Github:
// https://github.com/Microsoft/BotFramwork-Emulator
//
// Copyright (c) Microsoft Corporation
// All rights reserved.
//
// MIT License:
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//

import * as Restify from 'restify';
import { BotFrameworkAuthentication } from './botFrameworkAuthentication';
import { ConversationsController } from './controllers/connector/conversationsController';
import { AttachmentsController } from './controllers/connector/attachmentsController';
import { BotStateController } from './controllers/connector/botStateController';
import { ConversationsControllerV3 as DirectLineConversationsController } from './controllers/directLine/conversationsControllerV3';
import { EmulatorController } from './controllers/emulator/emulatorController';
import { RestServer } from './restServer';
import { getStore, getSettings, addSettingsListener } from './settings';
import { Settings } from '../types/serverSettingsTypes';
import * as log from './log';
import * as Fs from 'fs';
import * as path from 'path';
import * as ngrok from './ngrok';
import { makeLinkMessage } from './log';
import { Emulator } from './emulator';


/**
 * Communicates with the bot.
 */
export class BotFrameworkService extends RestServer {

    private _serviceUrl: string;
    inspectUrl: string;
    ngrokPath: string;
    ngrokServiceUrl: string;

    public get serviceUrl() {
        return ngrok.running()
            ? this.ngrokServiceUrl || this._serviceUrl
            : this._serviceUrl
    }

    authentication = new BotFrameworkAuthentication();

    constructor() {
        super("Emulator");
        ConversationsController.registerRoutes(this, this.authentication);
        AttachmentsController.registerRoutes(this);
        BotStateController.registerRoutes(this, this.authentication);
        DirectLineConversationsController.registerRoutes(this);
        EmulatorController.registerRoutes(this);
        addSettingsListener((settings: Settings) => {
            this.configure(settings);
        });
        this.router.on('listening', () => {
            this.relaunchNgrok();
            Emulator.send('listening', { serviceUrl: this.serviceUrl });
        });
    }

    startup() {
        this.restart();
    }

    relaunchNgrok() {
        let router = this.router;
        if (!router) return;
        let address = router.address();
        if (!address) return;
        let port = address.port;
        if (!port) return;
        const settings = getSettings();
        const prevNgrokPath = this.ngrokPath;
        this.ngrokPath = settings.framework.ngrokPath;
        const prevServiceUrl = this.serviceUrl;
        this._serviceUrl = `http://localhost:${port}`;
        this.inspectUrl = null;
        this.ngrokServiceUrl = null;
        const startNgrok = () => {
            // if we have an ngrok path
            if (this.ngrokPath) {
                // then make it so
                ngrok.connect({
                    port,
                    path: this.ngrokPath
                }, (err, url: string, inspectPort: string) => {
                    if (err) {
                        log.warn(`Failed to start ngrok: ${err.message || err.msg}`);
                        log.error("Fix it:", log.ngrokConfigurationLink('Configure ngrok'));
                        log.error("Learn more:", log.makeLinkMessage('Network tunneling (ngrok)', 'https://github.com/Microsoft/BotFramework-Emulator/wiki/Tunneling-(ngrok)'));
                    } else {
                        this.inspectUrl = `http://localhost:${inspectPort}`;
                        this.ngrokServiceUrl = url;
                        log.debug(`ngrok listening on ${url}`);
                        log.debug('ngrok traffic inspector:', log.makeLinkMessage(this.inspectUrl, this.inspectUrl));
                    }
                    // Sync settings to client
                    getStore().dispatch({
                        type: 'Framework_Set',
                        state: {
                            ngrokPath: this.ngrokPath
                        }
                    });
                });
            }
        }
        if (this.ngrokPath !== prevNgrokPath) {
            ngrok.kill((wasRunning) => {
                if (wasRunning)
                    log.debug('ngrok stopped');
                startNgrok();
                return true;
            });
        } else {
            ngrok.disconnect(prevServiceUrl, () => {
                startNgrok();
            });
        }
    }

    /**
     * Applies configuration changes.
     */
    private configure(settings: Settings) {
        // Did ngrok path change?
        if (this.ngrokPath !== settings.framework.ngrokPath) {
            this.relaunchNgrok();
        }
    }
}
