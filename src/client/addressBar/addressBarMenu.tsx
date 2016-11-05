import * as React from 'react';
import { getSettings, ISettings, addSettingsListener } from '../settings';
import { Settings as ServerSettings } from '../../types/serverSettingsTypes';
import { AddressBarActions, ConversationActions, ServerSettingsActions } from '../reducers';
import { IBot, newBot } from '../../types/botTypes';
import * as log from '../log';
import { AddressBarOperators } from './addressBarOperators';
import { AppSettingsDialog } from './appSettingsDialog';
import { ConversationSettingsDialog } from './conversationSettingsDialog';
import * as Constants from '../constants';


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
                <div dangerouslySetInnerHTML={{__html: Constants.hamburgerIcon('toolbar-button', 24)}} onClick={() => this.showMenu()} />
                <AppSettingsDialog />
                <ConversationSettingsDialog />
            </div>
        );
    }
}
