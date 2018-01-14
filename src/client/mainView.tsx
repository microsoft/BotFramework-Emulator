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

import * as React from 'react';
import * as Splitter from 'react-split-pane';
import * as BotChat from 'botframework-webchat';
import { getSettings, Settings, addSettingsListener, selectedActivity$, layoutDefault } from './settings';
import { LayoutActions, InspectorActions } from './reducers';
import { Settings as ServerSettings } from '../types/serverSettingsTypes';
import { AddressBar } from './addressBar/addressBar';
import { InspectorView } from './inspectorView'
import { LogView } from './logView';
import { IUser } from '../types/userTypes';
import { AppSettingsDialog } from './dialogs/appSettingsDialog';
import * as Constants from './constants';
import { Emulator } from './emulator';
import { BotEmulatorContext } from './botEmulatorContext';
import { AddressBarOperators } from './addressBar/addressBarOperators';
import * as log from './log';
import { ISpeechTokenInfo } from '../types/speechTypes';

const CognitiveServices = require('../../node_modules/botframework-webchat/CognitiveServices');
const remote = require('electron').remote;
const ipcRenderer = require('electron').ipcRenderer;

export class MainView extends React.Component<{}, {}> {
    settingsUnsubscribe: any;
    settingsLoadUnsubscribe: any;
    reuseKey: number = 0;
    directline: BotChat.DirectLine;
    conversationId: string;
    userId: string;
    botId: string;
    botChatContainer: HTMLElement;
    shouldWarnOfBotChange: boolean = false;

    componentWillMount() {
        this.settingsUnsubscribe = addSettingsListener((settings: Settings) => {
            try {
                let conversationChanged = false;
                if (this.conversationId !== settings.conversation.conversationId) {
                    this.conversationId = settings.conversation.conversationId || '';
                    conversationChanged = true;
                }

                let userChanged = false;
                let currentUserId = settings.serverSettings.users ? settings.serverSettings.users.currentUserId : 'default-user';
                if (this.userId !== currentUserId) {
                    this.userId = currentUserId || '';
                    userChanged = true;
                }

                let botChanged = false;
                if (this.botId !== settings.serverSettings.activeBot) {
                    this.botId = settings.serverSettings.activeBot || '';
                    botChanged = true;
                }

                if (conversationChanged || userChanged || botChanged) {
                    if (this.directline) {
                        this.directline.end();
                        this.directline = undefined;
                    //    log.debug(`ended conversation`);
                    }
                    if (this.conversationId.length && this.userId.length && this.botId.length) {
                        this.directline = new BotChat.DirectLine({
                            secret: settings.conversation.conversationId,
                            token: settings.conversation.conversationId,
                            domain: `${Emulator.serviceUrl}/v3/directline`,
                            webSocket: false
                        });
                    //    log.debug(`started new conversation`);
                    }
                    this.reuseKey++;
                    this.forceUpdate();
                }
            } catch(e) {
                //log.error(e.message);
            }
        });
    }

    componentWillUnmount() {
        if (this.settingsUnsubscribe) {
            this.settingsUnsubscribe();
            this.settingsUnsubscribe = undefined;
        }
        if (this.directline) {
            this.directline.end();
            this.directline = undefined;
        }
        this.conversationId = undefined;
        this.userId = undefined;
        this.botId = undefined;
    }

    componentDidMount() {
        // listen to future protocol handler invocations and update the emulator's active bot when this happens
        ipcRenderer.on('botemulator', (event: any, message: any) => {
            console.log('received url: ' + message);
            this.shouldWarnOfBotChange = true;
            this.setBot(message);
        });

        console.log("location.search: " + location.search);

        // on application start, a query string may have some parameters that provide initial context about
        // the bot to connect to
        if (location.search) {
            this.setBot(location.search);
        }

        // request any urls that may have queued while the app was starting
        ipcRenderer.send('getUrls');
    }

    // set the current bot based on an encoded bot emulator URI
    // based on the setting avialability, this will either immediately or in a deferred way set
    // the address information to the encoded bot and connect to this bot
    private setBot(encodedBot: string): void {
        let botContext = new BotEmulatorContext(encodedBot);
        if (botContext.isValid()) {
            // settings may or may not be loaded at this point
            // if they are, use them directly, if not, wait for them to be loaded
            if(this.settingsAreLoaded()) {
                this.verifyAndAssignBot(botContext);
            } else {
                this.settingsLoadUnsubscribe = addSettingsListener((settings: Settings) => {
                    if(botContext && this.settingsAreLoaded()) {
                        this.verifyAndAssignBot(botContext);
                        botContext = undefined;
                        if (this.settingsLoadUnsubscribe) {
                            this.settingsLoadUnsubscribe();
                            this.settingsLoadUnsubscribe = undefined;
                        }
                    }
                });
            }
        }
    }

    // determines if we need to warn the user that the bot connection will change due to an event
    // such as a protocol handler invocation, and in this case let the user choose whether to continue or not
    private verifyAndAssignBot(botContext: BotEmulatorContext): void {
        let assignBot: boolean = true;
        if (this.shouldWarnOfBotChange) {
            const serverSettings = new ServerSettings(getSettings().serverSettings);
            const activeBot = serverSettings.getActiveBot();
            if(activeBot && !botContext.matchesBot(activeBot)) {
                if (remote.dialog.showMessageBox({
                                type: 'question',
                                title: 'Connect to Bot',
                                message: 'Are you sure you want to update and connect to the bot at \'' + botContext.endpoint + '\'?',
                                buttons: ['Yes', 'No'],
                                defaultId: 0,
                                cancelId: 1}) === 1) {
                    assignBot = false;
                }
            }
            this.shouldWarnOfBotChange = false;
        }

        if (assignBot) {
            AddressBarOperators.assignBot(botContext);
        }
    }

    // Determine if the settings are currently loaded and available to use
    private settingsAreLoaded(): boolean {
        const settings = getSettings();
        return (settings && settings.serverSettings && settings.serverSettings.bots) as any as boolean;
    }

    getCurrentUser(serverSettings: ServerSettings): IUser {
        if (serverSettings && serverSettings.users && serverSettings.users.currentUserId) {
            let user: IUser = serverSettings.users.usersById[serverSettings.users.currentUserId];
            if (user && user.id && user.id.length)
                return user;
        }
        return null;
    }

    verticalSplitChange(size: number) {
        this.updateBotChatContainerCSS(size);
        LayoutActions.rememberVerticalSplitter(size);
    }

    updateBotChatContainerCSS(size: number) {
        if (this.botChatContainer) {
            let bounds = remote.getCurrentWindow().getBounds();
            if (bounds.width - size <= 450) {
                this.botChatContainer.classList.remove('wc-wide');
                this.botChatContainer.classList.add('wc-narrow');
            } else if (bounds.width - size >= 768) {
                this.botChatContainer.classList.remove('wc-narrow');
                this.botChatContainer.classList.add('wc-wide');
            } else {
                this.botChatContainer.classList.remove('wc-wide', 'wc-narrow');
            }
        }
    }

    initBotChatContainerRef(ref, initialWidth: number) {
        this.botChatContainer = ref;
        this.updateBotChatContainerCSS(initialWidth);
    }

    botChatComponent(initialWidth: number) {
        if (this.directline) {
            const settings = getSettings();
            const srvSettings = new ServerSettings(settings.serverSettings);
            const activeBot = srvSettings.getActiveBot();
            const props: BotChat.ChatProps = {
                botConnection: this.directline,
                locale: activeBot.locale || remote.app.getLocale(),
                formatOptions: {
                    showHeader: false
                },
                selectedActivity: selectedActivity$() as any,
                user: this.getCurrentUser(settings.serverSettings),
                bot: { name: "Bot", id: activeBot.botId },
                resize: 'detect',
                speechOptions: {
                    speechRecognizer: new CognitiveServices.SpeechRecognizer({
                        fetchCallback: this.fetchSpeechToken.bind(this),
                        fetchOnExpiryCallback: this.fetchSpeechTokenOnExpiry.bind(this)
                    }),
                    speechSynthesizer: new BotChat.Speech.BrowserSpeechSynthesizer()
                }
            }
            InspectorActions.clear();
            return <div className="wc-app" ref={ref => this.initBotChatContainerRef(ref, initialWidth)}><BotChat.Chat key={this.reuseKey} {...props} /></div>
        } else {
            return (
                <div className='emu-chatview-background'>
                    <div className='box-centered' dangerouslySetInnerHTML={{ __html: Constants.botFrameworkIconEmbossed('', 158) }} />
                </div>
            );
        }
    }

    private fetchSpeechToken(authIdEvent: string): Promise<string> {
        return this.getSpeechToken(authIdEvent, false);
    }

    private fetchSpeechTokenOnExpiry(authIdEvent: string): Promise<string> {
        return this.getSpeechToken(authIdEvent, true);
    }

    private getSpeechToken(authIdEvent: string, refresh: boolean = false): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            let message = refresh ? 'refreshSpeechToken' : 'getSpeechToken';
            // Electron 1.7.2 @types incorrectly specifies sendSync having a void return type, so cast result to `any`.
            let speechToken = ipcRenderer.sendSync(message, this.conversationId) as any as ISpeechTokenInfo;
            if (speechToken) {
                if (speechToken.access_Token) {
                    resolve(speechToken.access_Token);
                    return;
                } else {
                    log.warn('Could not retrieve Cognitive Services speech token');
                    if (typeof speechToken.error === 'string')
                        log.warn('Error: ' + speechToken.error);
                    if (typeof speechToken.error_Description === 'string')
                        log.warn('Details: ' + speechToken.error_Description);
                }
            } else {
                log.error('Could not retrieve Cognitive Services speech token.');
            }
            resolve();
        });
    }

    render() {
        const settings = getSettings();

        const minVertSplit = 0;
        const minHorizSplit = 42;

        let vertSplit;
        if (typeof settings.layout.vertSplit === "number")
            vertSplit = settings.layout.vertSplit;
        else
            vertSplit = Number(settings.layout.vertSplit) || layoutDefault.vertSplit;

        let horizSplit;
        if (typeof settings.layout.horizSplit === "number")
            horizSplit = settings.layout.horizSplit;
        else
            horizSplit = Number(settings.layout.horizSplit) || layoutDefault.horizSplit;

        vertSplit = vertSplit > minVertSplit ? vertSplit : minVertSplit;
        horizSplit = horizSplit > minHorizSplit ? horizSplit : minHorizSplit;

        return (
            <div className='mainview'>
                <div className='botchat-container'>
                    <Splitter split="vertical" minSize={minVertSplit} maxSize={-200} defaultSize={vertSplit} primary="second" onChange={(size) => this.verticalSplitChange(size)}>
                        <div className='fill-parent'>
                            <AddressBar />
                            {this.botChatComponent(vertSplit)}
                        </div>
                        <div className="fill-parent">
                            <Splitter split="horizontal" primary="second" minSize={minHorizSplit} maxSize={-44} defaultSize={horizSplit} onChange={(size) => LayoutActions.rememberHorizontalSplitter(size)}>
                                <div className="wc-chatview-panel">
                                    <InspectorView />
                                </div>
                                <div className="fill-parent">
                                    <LogView />
                                </div>
                            </Splitter>
                        </div>
                    </Splitter>
                </div>
                <AppSettingsDialog />
            </div>
        );
    }
}
