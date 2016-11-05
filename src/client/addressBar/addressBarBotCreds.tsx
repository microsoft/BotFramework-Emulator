import * as React from 'react';
import { getSettings, ISettings, addSettingsListener } from '../settings';
import { Settings as ServerSettings } from '../../types/serverSettingsTypes';
import { AddressBarActions, ConversationActions, ServerSettingsActions } from '../reducers';
import { IBot, newBot } from '../../types/botTypes';
import * as log from '../log';
import { AddressBarOperators } from './addressBarOperators';


export class AddressBarBotCreds extends React.Component<{}, {}> {
    settingsUnsubscribe: any;

    componentWillMount() {
        this.settingsUnsubscribe = addSettingsListener(() => {
            this.forceUpdate();
        });
    }

    componentWillUnmount() {
        this.settingsUnsubscribe();
    }

    appIdChanged = (text: string) => {
        const settings = getSettings();
        let bot = Object.assign({}, settings.addressBar.selectedBot) as IBot;
        bot.msaAppId = text;
        AddressBarOperators.addOrUpdateBot(bot);
    }

    appPasswordChanged = (text: string) => {
        const settings = getSettings();
        let bot = Object.assign({}, settings.addressBar.selectedBot) as IBot;
        bot.msaPassword = text;
        AddressBarOperators.addOrUpdateBot(bot);
    }

    connectToBot = () => {
        const settings = getSettings();
        const bot = settings.addressBar.selectedBot;
        AddressBarOperators.selectBot(null);
        AddressBarOperators.addOrUpdateBot(bot);
        AddressBarOperators.activateBot(bot);
        ConversationActions.newConversation();
    }

    render() {
        const settings = getSettings();
        if (!settings.addressBar.showBotCreds) return null;
        if (!settings.addressBar.selectedBot) return null;
        if (!settings.addressBar.selectedBot.botUrl.length) return null;
        if (settings.addressBar.matchingBots.length > 0) return null;
        return (
            <div className={"addressbar-botcreds"}>
                <div className="input-group">
                    <label
                        className="form-label">
                        Microsoft App ID
                    </label>
                    <input
                        type="text"
                        className="form-input addressbar-botcreds-input"
                        value={settings.addressBar.selectedBot.msaAppId}
                        onChange={e => this.appIdChanged((e.target as any).value)} />
                </div>
                <div className="input-group">
                    <label
                        className="form-label">
                        Microsoft App Password
                    </label>
                    <input
                        type="password"
                        className="form-input addressbar-botcreds-input"
                        value={settings.addressBar.selectedBot.msaPassword}
                        onChange={e => this.appPasswordChanged((e.target as any).value)} />
                </div>
                <div className="input-group">
                    <button
                        className="addressbar-botcreds-connect-button"
                        onClick={() => this.connectToBot()}>
                        Connect
                    </button>
                </div>
                <div className="addressbar-botcreds-callout" />
            </div>
        );
    }
}
