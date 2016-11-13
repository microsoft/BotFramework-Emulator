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
import * as BotChat from 'msbotchat';
import * as log from './log';
import { getSettings, settingsDefault, Settings, addSettingsListener, selectedActivity$ } from './settings';
import { LayoutActions, InspectorActions, LogActions } from './reducers';
import { Settings as ServerSettings } from '../types/serverSettingsTypes';
import { AddressBar } from './addressBar/addressBar';
import { InspectorView } from './inspectorView'
import { LogView } from './logView';
import { uniqueId } from '../utils';
import { IUser } from '../types/userTypes';
import * as Constants from './constants';


export class MainView extends React.Component<{}, {}> {
    settingsUnsubscribe: any;
    reuseKey: number = 0;
    directline: BotChat.DirectLine3;
    conversationId: string;
    userId: string;
    botId: string;

    componentWillMount() {
        this.settingsUnsubscribe = addSettingsListener((settings: Settings) => {
            let conversationChanged = false;
            if (this.conversationId !== settings.conversation.conversationId) {
                this.conversationId = settings.conversation.conversationId || '';
                conversationChanged = true;
            }

            let userChanged = false;
            if (this.userId !== settings.serverSettings.users.currentUserId) {
                this.userId = settings.serverSettings.users.currentUserId || '';
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
                    this.directline = new BotChat.DirectLine3(
                        { secret: settings.conversation.conversationId, token: settings.conversation.conversationId },
                        `http://localhost:${settings.serverSettings.framework.port}`,
                        'v3/directline'
                    );
                //    log.debug(`started new conversation`);
                }
                this.reuseKey++;
                this.forceUpdate();
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

    getCurrentUser(serverSettings: ServerSettings): IUser {
        if (serverSettings && serverSettings.users && serverSettings.users.currentUserId) {
            let user: IUser = serverSettings.users.usersById[serverSettings.users.currentUserId];
            if (user && user.id && user.id.length)
                return user;
        }
        return null;
    }

    botChatComponent() {
        if (this.directline) {
            const settings = getSettings();
            const props: BotChat.ChatProps = {
                botConnection: this.directline,
                locale: 'en-us',
                formatOptions: {
                    showHeader: false
                },
                selectedActivity: selectedActivity$(),
                user: this.getCurrentUser(settings.serverSettings)
            }
            InspectorActions.clear();
            let srvSettings = new ServerSettings(settings.serverSettings);
            return <BotChat.Chat key={this.reuseKey} {...props} />
        } else {
            return (
                <div className='emu-chatview-background'>
                    <div className='box-centered' dangerouslySetInnerHTML={{ __html: Constants.botFrameworkIconEmbossed('', 158) }} />
                </div>
            );
        }
    }

    render() {
        const settings = getSettings();
        let vertSplit = settings.layout.vertSplit;
        if (typeof settings.layout.vertSplit === typeof Number) {
            vertSplit = `${settings.layout.vertSplit}px`;
        }
        let horizSplit = settings.layout.horizSplit;
        if (typeof settings.layout.horizSplit === typeof Number) {
            horizSplit = `${settings.layout.horizSplit}px`;
        }
        return (
            <div className='mainview'>
                <div className='botchat-container'>
                    <Splitter split="vertical" minSize="200px" defaultSize={vertSplit} primary="second" onChange={(size) => LayoutActions.rememberVerticalSplitter(size)}>
                        <div className='fill-parent'>
                            <AddressBar />
                            {this.botChatComponent()}
                        </div>
                        <div className="wc-app-inspectorview-container">
                            <Splitter split="horizontal" primary="second" minSize="42px" defaultSize={horizSplit} onChange={(size) => LayoutActions.rememberHorizontalSplitter(size)}>
                                <div className="wc-chatview-panel">
                                    <div className="wc-inspectorview-header">
                                        <span>Details</span>
                                    </div>
                                    <InspectorView />
                                </div>
                                <div className="wc-app-logview-container">
                                    <div className="wc-logview-header">
                                        <span>Log</span>
                                    </div>
                                    <LogView />
                                </div>
                            </Splitter>
                        </div>
                    </Splitter>
                </div>
            </div>
        );
    }
}
