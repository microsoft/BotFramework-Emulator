import * as React from 'react';
import { getStore, getSettings, ISettings } from '../settings';
import { Settings as ServerSettings } from '../../types/serverSettingsTypes';
import { AddressBarActions, ConversationActions, ServerSettingsActions } from '../reducers';
import { IBot, newBot } from '../../types/botTypes';
import * as log from '../log';
import { AddressBarOperators } from './addressBarOperators';


export class AddressBarBotCreds extends React.Component<{}, {}> {
    storeUnsubscribe: any;

    componentWillMount() {
        this.storeUnsubscribe = getStore().subscribe(() => {
            this.forceUpdate();
        });
    }

    componentWillUnmount() {
        this.storeUnsubscribe();
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
        AddressBarOperators.activateBot(bot);
    }

    render() {
        const settings = getSettings();
        if (!settings.addressBar.selectedBot) return null;
        let visible = false;
        if (settings.addressBar.selectedBot.botUrl.length > 0 && settings.addressBar.matchingBots.length === 0) {
            visible = true;
        }
        let reuseKey: number = 0;
        return (
            <div className={"addressbar-botcreds" + (visible ? "" : " closed")}>
                <div key={reuseKey++} className="input-group">
                    <label key={reuseKey++}
                        className="form-label">
                        Microsoft App ID
                    </label>
                    <input key={reuseKey++}
                        type="text"
                        className="form-input addressbar-botcreds-input"
                        value={settings.addressBar.selectedBot.msaAppId}
                        onChange={e => this.appIdChanged((e.target as any).value)} />
                </div>
                <div key={reuseKey++} className="input-group">
                    <label key={reuseKey++}
                        className="form-label">
                        Microsoft App Password
                    </label>
                    <input key={reuseKey++}
                        type="text"
                        className="form-input addressbar-botcreds-input"
                        value={settings.addressBar.selectedBot.msaPassword}
                        onChange={e => this.appPasswordChanged((e.target as any).value)} />
                </div>
                <div key={reuseKey++} className="input-group">
                    <button key={reuseKey++}
                        className="addressbar-botcreds-connect-button"
                        onClick={() => this.connectToBot()}>
                        Connect
                    </button>
                </div>
            </div>
        );
    }
}
