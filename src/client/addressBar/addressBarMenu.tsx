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
import { getSettings, Settings, addSettingsListener  } from '../settings';
import { AddressBarActions, ConversationActions, HotkeyActions } from '../reducers';
import { Emulator } from '../emulator';
import * as Constants from '../constants';
import { remote } from 'electron';

const { Menu } = remote;

export class AddressBarMenu extends React.Component<{}, {}> {
    addressBarMenu: any;
    settingsUnsubscribe: any;

    componentWillMount() {
        this.settingsUnsubscribe = addSettingsListener((settings: Settings) => {
            if (settings.hotkey.openMenu) {
                HotkeyActions.clearOpenMenu();
                this.showMenuAtCoordinates();
            }
        });
    }

    componentWillUnmount() {
        this.settingsUnsubscribe();
    }

    showMenu(options?: any) {
        const settings = getSettings();
        const inConversation = ((settings.serverSettings.activeBot || '').length > 0 && (settings.conversation.conversationId || '').length > 0);
        const haveActiveBot = (settings.serverSettings.activeBot || '').length > 0;
        const template: Electron.MenuItemConstructorOptions[] = [
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
                        label: 'Send System Activity',
                        type: 'submenu',
                        enabled: true,
                        submenu: [
                            {
                                label: 'conversationUpdate (user added)',
                                click: () => {
                                    Emulator.addUser();
                                }
                            },
                            {
                                label: 'conversationUpdate (user removed)',
                                click: () => {
                                    Emulator.removeRandomUser();
                                }
                            },
                            {
                                label: 'contactRelationUpdate (bot added)',
                                click: () => {
                                    Emulator.botContactAdded();
                                }
                            },
                            {
                                label: 'contactRelationUpdate (bot removed)',
                                click: () => {
                                    Emulator.botContactRemoved();
                                }
                            },
                            {
                                label: 'typing',
                                click: () => {
                                    Emulator.typing();
                                }
                            },
                            {
                                label: 'ping',
                                click: () => {
                                    Emulator.ping();
                                }
                            },
                            {
                                label: 'deleteUserData',
                                click: () => {
                                    Emulator.deleteUserData();
                                }
                            }
                        ]
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
            {
                type: 'separator'
            },
            {
                label: 'Settings',
                click: () => AddressBarActions.showAppSettings()
            },
            {
                type: 'separator'
            },
            {
                label: 'Zoom',
                type: 'submenu',
                enabled: true,
                submenu: [
                    {
                        label: 'Zoom In',
                        accelerator: 'CommandOrControl+=',
                        click: () => {
                            Emulator.zoomIn();
                        }
                    },
                    {
                        label: 'Zoom Out',
                        accelerator: 'CommandOrControl+-',
                        click: () => {
                            Emulator.zoomOut();
                        }
                    },
                    {
                        label: 'Reset Zoom',
                        accelerator: 'CommandOrControl+0',
                        click: () => {
                            Emulator.zoomReset();
                        }
                    },
                ]
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
                click: () => window.open('https://aka.ms/l7si1g')
            },
            {
                type: 'separator'
            },
            {
                label: 'Report issues',
                click: () => window.open('https://aka.ms/cy106f')
            },
        ];

        const menu = Menu.buildFromTemplate(template);
        menu.popup(undefined, options);
    }

    showMenuAtCoordinates() {
        this.showMenu(this.getOptionsWithCoordinates());
    }

    getOptionsWithCoordinates() {
        let zoomLevel = getSettings().serverSettings.windowState.zoomLevel;
        let zoomRatio = this.getZoomRatio(zoomLevel);

        return this.calculateCoordinatesAccordingToZoomLevel(zoomRatio);
    }

    calculateCoordinatesAccordingToZoomLevel(zoomLevelRatio: any) {
        let rect = this.addressBarMenu.getBoundingClientRect();
        let left = Math.ceil((rect.left + rect.width / 2) * zoomLevelRatio);
        let top = Math.ceil((rect.top + rect.height / 2) * zoomLevelRatio);
        return {x: left, y: top};
    }

    getZoomRatio(zoomLevel: number): number {
        // This is a curve fit to the set of aspect ratios at different zoom levels empirically determined by GitHub user @rinormaloku
        return 0.4819 * Math.exp(0.1824 * (zoomLevel + 4));
    }

    render() {
        return (
            <a className='undecorated-text' href='javascript:void(0)' title='Settings'>
                <div className="addressbar-menu"
                     ref={ref => this.addressBarMenu = ref}
                     dangerouslySetInnerHTML={{ __html: Constants.hamburgerIcon('toolbar-button', 24) }} onClick={() => this.showMenu()} />
            </a>
        );
    }
}

