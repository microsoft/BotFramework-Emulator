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

    checkboxLabel() {
        return ([
            <span key={0} className="addressbar-botcreds-savecreds-label-big">Remember these credentials:</span>,
            <span key={1} className="addressbar-botcreds-savecreds-label-small">&nbsp;We never pass these around.</span>
        ]);
    }

    saveCredentialsChanged(value: boolean) {
        const settings = getSettings();
        let bot = Object.assign({}, settings.addressBar.selectedBot) as IBot;
        bot.saveCreds = value;
        AddressBarOperators.addOrUpdateBot(bot);
    }

    appIdChanged(text: string) {
        const settings = getSettings();
        let bot = Object.assign({}, settings.addressBar.selectedBot) as IBot;
        bot.msaAppId = text;
        AddressBarOperators.addOrUpdateBot(bot);
    }

    appPasswordChanged(text: string) {
        const settings = getSettings();
        let bot = Object.assign({}, settings.addressBar.selectedBot) as IBot;
        bot.msaPassword = text;
        AddressBarOperators.addOrUpdateBot(bot);
    }

    serviceUrlChanged(text: string) {
        const settings = getSettings();
        let bot = Object.assign({}, settings.addressBar.selectedBot) as IBot;
        bot.serviceUrl = text;
        AddressBarOperators.addOrUpdateBot(bot);
    }

    connectToBot() {
        const settings = getSettings();
        const bot = settings.addressBar.selectedBot;
        AddressBarOperators.selectBot(null);
        AddressBarOperators.activateBot(bot);
    }

    getFormComponents() {
        const settings = getSettings();
        if (settings.addressBar.selectedBot) {
            return [
                <span key={0}
                    className="addressbar-botcreds-title">
                    Enter your app credentials to connect
                </span>,
                <input key={1}
                    type="text"
                    className="addressbar-botcreds-msaappid-input"
                    value={settings.addressBar.selectedBot.msaAppId}
                    onChange={e => this.appIdChanged((e.target as any).value)}
                    placeholder="Microsoft App ID" />,
                <input key={2}
                    type="text"
                    className="addressbar-botcreds-msapassword-input"
                    value={settings.addressBar.selectedBot.msaPassword}
                    onChange={e => this.appPasswordChanged((e.target as any).value)}
                    placeholder="Microsoft App Password" />,
                <input key={3}
                    type="text"
                    className="addressbar-botcreds-serviceurl-input"
                    value={settings.addressBar.selectedBot.serviceUrl}
                    onChange={e => this.serviceUrlChanged((e.target as any).value)}
                    placeholder="Service URL" />,
                <Checkbox key={4}
                    className="addressbar-botcreds-savecreds"
                    checked={settings.addressBar.selectedBot.saveCreds}
                    label={this.checkboxLabel()}
                    onChange={(value) => this.saveCredentialsChanged(value)} />,
                <button key={5}
                    className="addressbar-botcreds-connect-button"
                    onClick={() => this.connectToBot()}>
                    Connect
                </button>
            ];
        }
        return null;
    }

    render() {
        const settings = getSettings();
        let visible = false;
        if (settings.addressBar.selectedBot && settings.addressBar.selectedBot.botUrl.length > 0 && settings.addressBar.matchingBots.length === 0) {
            visible = true;
        }
        return (
            <div className={"addressbar-botcreds" + (visible ? "" : " closed")}>
                {this.getFormComponents()}
            </div>
        );
    }
}

interface ICheckboxProps {
    checked: boolean,
    label: JSX.Element | JSX.Element[],
    className: string,
    onChange: (boolean) => void;
}

interface ICheckboxState {
    checked: boolean,
}

class Checkbox extends React.Component<ICheckboxProps, ICheckboxState> {
    constructor(...args: any[]) {
        super(...args);
        this.state = {
            checked: this.props.checked
        };
    }

    toggleCheckbox() {
        const newVal = !this.state.checked;
        this.setState({
            checked: newVal
        });
        this.props.onChange(newVal);
    }

    render() {
        return (
            <div className={this.props.className} onClick={() => this.toggleCheckbox()}>
                <input type="checkbox" checked={this.state.checked} />
                {this.props.label}
            </div>
        );
    }
}

class DropdownMenu extends React.Component<{}, {}> {

}
