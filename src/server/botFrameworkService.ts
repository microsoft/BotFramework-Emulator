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
import { ConversationsController } from './framework/conversationsController';
import { AttachmentsController } from './framework/attachmentsController';
import { BotStateController } from './framework/botStateController';
import { ConversationsControllerV3 as DirectLineConversationsController } from './directLine/conversationsControllerV3';
import { RestServer } from './restServer';
import { getStore, getSettings, addSettingsListener } from './settings';
import { Settings } from '../types/serverSettingsTypes';
import * as log from './log';
import * as Fs from 'fs';
import * as path from 'path';
import * as ngrok from './ngrok';
import { makeLinkMessage } from './log';


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
            ? this.ngrokServiceUrl
            : this._serviceUrl
    }

    authentication = new BotFrameworkAuthentication();

    constructor() {
        super("emulator");
        ConversationsController.registerRoutes(this, this.authentication);
        AttachmentsController.registerRoutes(this);
        BotStateController.registerRoutes(this, this.authentication);
        DirectLineConversationsController.registerRoutes(this);
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
            console.log(`restarting ${this.router.name} because ${this.port} !== ${settings.framework.port}`);
            this.restart(settings.framework.port);
            // Respawn ngrok when the port changes
            relaunchNgrok = true;
        }

        // Did ngrok path change?
        if (relaunchNgrok || this.ngrokPath !== settings.framework.ngrokPath) {
            const prevNgrokPath = this.ngrokPath;
            this.ngrokPath = settings.framework.ngrokPath;
            const prevServiceUrl = this.serviceUrl;
            this._serviceUrl = `http://localhost:${this.port}`;
            this.inspectUrl = null;
            this.ngrokServiceUrl = null;
            const startNgrok = () => {
                // if we have an ngrok path
                if (this.ngrokPath) {
                    // then make it so
                    ngrok.connect({
                        port: this.port,
                        path: this.ngrokPath
                    }, (err, url: string, inspectPort: string) => {
                        if (err) {
                            log.warn(`failed to start ngrok: ${err.message || err.msg}`);
                            log.debug(log.makeLinkMessage('click here', 'emulator://appsettings?tab=NgrokConfig'), 'to configure ngrok');
                        } else {
                            this.inspectUrl = `http://localhost:${inspectPort}`;
                            this.ngrokServiceUrl = url;
                            log.debug(`ngrok listening on: ${url}`);
                            log.debug('ngrok inspector:', log.makeLinkMessage(this.inspectUrl, this.inspectUrl));
                        }
                        // Sync settings to client
                        getStore().dispatch({
                            type: 'Framework_Set2',
                            state: {
                                port: this.port,
                                ngrokPath: this.ngrokPath,
                                serviceUrl: this._serviceUrl,
                                ngrokServiceUrl: this.ngrokServiceUrl,
                                ngrokRunning: ngrok.running()
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
    }
}
