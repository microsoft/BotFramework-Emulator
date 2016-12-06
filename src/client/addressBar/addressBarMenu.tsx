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
import { getSettings, ISettings, addSettingsListener } from '../settings';
import { Settings as ServerSettings } from '../../types/serverSettingsTypes';
import { AddressBarActions, ConversationActions, ServerSettingsActions } from '../reducers';
import { Emulator } from '../emulator';
import { IBot, newBot } from '../../types/botTypes';
import * as log from '../log';
import { AddressBarOperators } from './addressBarOperators';
import * as Constants from '../constants';
import { remote, app, shell } from 'electron';
import { uniqueId } from '../../utils';

const { Menu, MenuItem } = remote;

export class AddressBarMenu extends React.Component<{}, {}> {

    showMenu() {
        const settings = getSettings();
        const inConversation = ((settings.serverSettings.activeBot || '').length > 0 && (settings.conversation.conversationId || '').length > 0);
        const haveActiveBot = (settings.serverSettings.activeBot || '').length > 0;
        const template: Electron.MenuItemOptions[] = [
            {
                label: 'New Conversation',
                click: () => ConversationActions.newConversation(),
                enabled: haveActiveBot
            },
            /*
            {
                label: 'Load Conversation',
                type: 'submenu',
                enabled: settings.serverSettings.activeBot.length > 0,
                submenu: [
                    {
                        label: 'TODO: Populate'
                    }
                ]
            },
            */
            {
                label: 'Conversation',
                type: 'submenu',
                enabled: inConversation,
                submenu: [
                    {
                        label: 'Add User',
                        click: () => {
                            Emulator.addUser();
                        }
                    },
                    {
                        label: 'Remove User',
                        click: () => {
                            Emulator.removeRandomUser();
                        }
                    },
                    {
                        label: 'Bot contact added',
                        click: () => {
                            Emulator.botContactAdded();
                        }
                    },
                    {
                        label: 'Bot contact removed',
                        click: () => {
                            Emulator.botContactRemoved();
                        }
                    },
                    {
                        label: 'Typing',
                        click: () => {
                            Emulator.typing();
                        }
                    },
                    {
                        label: 'Ping',
                        click: () => {
                            Emulator.ping();
                        }
                    },
                    {
                        label: 'Delete User Data',
                        click: () => {
                            Emulator.deleteUserData();
                        }
                    },
                    {
                        type: 'separator'
                    },
                    {
                        label: 'End Conversation',
                        click: () => {
                            ConversationActions.endConversation();
                        }
                    }
                ]
            },
            /*
            {
                label: 'Manage Users...',
                click: () => AddressBarActions.showConversationSettings()
            },
            */
            /*
            {
                label: 'Send System Activity',
                type: 'submenu',
                submenu: [
                    {
                        label: 'Ping',
                        click: () => this.sendPingActivity(),
                        enabled: false
                    },
                    {
                        label: 'Typing',
                        click: () => this.sendTypingActivity(),
                        enabled: false
                    }
                ]
            },
            */
            {
                type: 'separator'
            },
            {
                label: 'App Settings',
                click: () => AddressBarActions.showAppSettings()
            },
            {
                type: 'separator'
            },
            /*
            {
                label: 'Help',
                //click: () => AddressBarActions.showHelp()
            },
            */
            {
                label: 'About',
                click: () => AddressBarActions.showAbout()
            },
            {
                type: 'separator'
            },
            {
                label: 'Legal',
                click: () => window.open('https://g.microsoftonline.com/0BX20en/721')
            },
            {
                label: 'Privacy',
                click: () => window.open('https://go.microsoft.com/fwlink/?LinkId=512132')
            },
            {
                label: 'Credits',
                click: () => window.open('https://github.com/Microsoft/BotFramework-Emulator/blob/master/ThirdPartyLicenses.txt')
            },
            {
                type: 'separator'
            },
            {
                label: 'Report issues',
                click: () => window.open('https://github.com/Microsoft/BotFramework-Emulator/issues/new')
            },
        ];

        const menu = Menu.buildFromTemplate(template);
        menu.popup();
    }

    render() {
        return (
            <a className='undecorated-text' href='javascript:void(0)' title='Settings'>
                <div className="addressbar-menu" dangerouslySetInnerHTML={{ __html: Constants.hamburgerIcon('toolbar-button', 24) }} onClick={() => this.showMenu()} />
            </a>
        );
    }
}

