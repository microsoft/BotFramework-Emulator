import * as React from 'react';
import { getSettings, ISettings, addSettingsListener } from '../settings';
import { Settings as ServerSettings } from '../../types/serverSettingsTypes';
import { AddressBarActions, ConversationActions, ServerSettingsActions } from '../reducers';
import { IBot, newBot } from '../../types/botTypes';
import * as log from '../log';
import { AddressBarOperators } from './addressBarOperators';
import { AppSettingsDialog } from './appSettingsDialog';
import { ConversationSettingsDialog } from './conversationSettingsDialog';


const { remote } = require('electron');
const { Menu, MenuItem } = remote;

export class AddressBarMenu extends React.Component<{}, {}> {

    showMenu() {
        const settings = getSettings();
        const template: Electron.MenuItemOptions[] = [
            {
                label: 'New Conversation',
                click: () => ConversationActions.newConversation(),
                enabled: settings.conversation.conversationId.length > 0
            },
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
            {
                label: 'End Conversation',
                enabled: settings.conversation.conversationId.length > 0
            },
            {
                label: 'Manage Users...',
                click: () => AddressBarActions.showConversationSettings()
            },
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
            {
                label: 'About',
            }
        ];

        const menu = Menu.buildFromTemplate(template);
        menu.popup();
    }

    render() {
        return (
            <div className="addressbar-menu">
                <svg className="toolbar-button" width="24px" height="24px" viewBox="0 0 24 24" version="1.1" onClick={() => this.showMenu()}>
                    <g id="Page-1" stroke="none" strokeWidth="1" fill="none" >
                        <rect id="Rectangle-2" x="0" y="0" width="24" height="24"></rect>
                        <path d="M10,6 C10,7.1045695 10.8954305,8 12,8 C13.1045695,8 14,7.1045695 14,6 C14,4.8954305 13.1045695,4 12,4 C10.8954305,4 10,4.8954305 10,6 Z M10,12 C10,13.1045695 10.8954305,14 12,14 C13.1045695,14 14,13.1045695 14,12 C14,10.8954305 13.1045695,10 12,10 C10.8954305,10 10,10.8954305 10,12 Z M10,18 C10,19.1045695 10.8954305,20 12,20 C13.1045695,20 14,19.1045695 14,18 C14,16.8954305 13.1045695,16 12,16 C10.8954305,16 10,16.8954305 10,18 Z" id="Combined-Shape" fill="#FFFFFF"></path>
                    </g>
                </svg>
                <AppSettingsDialog />
                <ConversationSettingsDialog />
            </div>
        );
    }
}
