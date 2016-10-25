import * as React from 'react';
import { getStore, getSettings, ISettings } from './settings';
import { Settings as ServerSettings } from '../server/settings';
import { AddressBarActions, ConversationActions, ServerSettingsActions } from './reducers';
import { IBot, newBot } from '../types/botTypes';


class AddressBarOperators {
    static getMatchingBots(text: string, bots: IBot[]): IBot[] {
        const settings = getSettings();
        text = text || settings.addressBar.text;
        bots = bots || settings.serverSettings.bots;
        if (text.length === 0)
            return bots;
        const lower = text.toLowerCase();
        return bots.filter(bot => bot.botUrl.toLowerCase().includes(lower));
    }

    static findMatchingBotForUrl(text: string, bots: IBot[]): IBot {
        const settings = getSettings();
        text = text || settings.addressBar.text;
        bots = bots || settings.serverSettings.bots;
        console.log('selectBotForUrl', text);
        let bot: IBot = null;
        if (bots && text && text.length) {
            const lower = text.toLowerCase();
            bot = bots.find(bot => lower === bot.botUrl.toLowerCase());
        }
        return bot;
    }

    static selectBotForUrl(text: string, bots: IBot[]): IBot {
        const bot = AddressBarOperators.findMatchingBotForUrl(text, bots);
        AddressBarActions.selectBot(bot);
        return bot;
    }

    static selectBot(bot: IBot) {
        console.log('selectBot', bot);
        AddressBarActions.selectBot(bot);
    }

    static clearMatchingBots() {
        console.log('clearMatchingBots');
        AddressBarActions.setMatchingBots([]);
    }

    static addOrUpdateBot(bot: IBot) {
        console.log('updateBot', bot);
        const settings = getSettings();
        if (settings.addressBar.selectedBot && settings.addressBar.selectedBot.botId === bot.botId) {
            AddressBarActions.selectBot(bot);
        }
        ServerSettingsActions.remote_addOrUpdateBot(bot);
    }

    static setMatchingBots(bots: IBot[]) {
        console.log('setMatchingBots', bots);
        AddressBarActions.setMatchingBots(bots);
    }

    static updateMatchingBots(text: string, bots: IBot[]): IBot[] {
        const settings = getSettings();
        text = text || settings.addressBar.text;
        bots = bots || settings.serverSettings.bots;
        console.log('updateMatchingBots', text, bots);
        const matchingBots = AddressBarOperators.getMatchingBots(text, bots);
        AddressBarActions.setMatchingBots(matchingBots);
        return matchingBots;
    }

    static setText(text: string) {
        console.log('setText', text);
        AddressBarActions.setText(text);
    }

    static deleteBot(botId: string) {
        const settings = getSettings();
        console.log('async_deleteBot', botId);
        if (botId === settings.serverSettings.activeBot) {
            ServerSettingsActions.remote_setActiveBot('');
        }
        ServerSettingsActions.remote_deleteBot(botId);
    }

    static activateBot(bot: IBot) {
        console.log('async_activateBot', bot.botId);
        ServerSettingsActions.remote_setActiveBot(bot.botId);
    }
}

export class AddressBar extends React.Component<{}, {}> {

    pageClicked(ev: Event) {
        let target = ev.srcElement;
        while (target) {
            if (target.className === "addressbar") {
                // Click was inside the address bar.
                return;
            }
            target = target.parentElement;
        }

        // Click was outside the address bar. Close any open subpanels.
        AddressBarOperators.clearMatchingBots();
        AddressBarOperators.selectBot(null);
    }

    componentWillMount() {
        window.addEventListener('click', (e) => this.pageClicked(e));
    }

    componentWillUnmount() {
        window.removeEventListener('click', (e) => this.pageClicked(e));
    }

    render() {
        return (
            <div className="addressbar">
                <AddressBarStatus />
                <AddressBarTextBox />
                <AddressBarControl />
                <AddressBarMenu />
                <AddressBarSearch />
                <AddressBarBotCreds />
            </div>
        );
    }
}

class AddressBarStatus extends React.Component<{}, {}> {
    render() {
        return (
            <div className="addressbar-status">
                (s)
            </div>
        );
    }
}

class AddressBarTextBox extends React.Component<{}, {}> {
    storeUnsubscribe: any;

    onChange(text: string) {
        AddressBarActions.setText(text);
        const bots = AddressBarOperators.updateMatchingBots(text, null);
        const bot = AddressBarOperators.findMatchingBotForUrl(text, bots) || newBot({ botUrl: text });
        AddressBarOperators.selectBot(bot);
    }

    onKeyPress(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Enter') {
            const settings = getSettings();
            if (settings.addressBar.text.length === 0)
                return;
            if (!settings.addressBar.selectedBot)
                return;
            if (settings.addressBar.matchingBots.length > 0) {
                AddressBarOperators.clearMatchingBots();
            } else {
                //AddressBarOperators.activateBot(bot);
            }
        }
    }

    onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'ArrowDown') {

        }
        if (e.key === 'ArrowUp') {
            
        }
    }

    onFocus() {
        const settings = getSettings();
        const bots = AddressBarOperators.getMatchingBots(settings.addressBar.text, null);
        if (settings.addressBar.text.length) {
            const bot = AddressBarOperators.findMatchingBotForUrl(settings.addressBar.text, bots) || newBot({ botUrl: settings.addressBar.text });
            if (bot) {
                AddressBarOperators.selectBot(bot);
            } else {
                AddressBarOperators.updateMatchingBots(settings.addressBar.text, bots);
            }
        } else {
            AddressBarOperators.updateMatchingBots(settings.addressBar.text, bots);
        }
    }

    componentWillMount() {
        this.storeUnsubscribe = getStore().subscribe(() => {
            this.forceUpdate();
        });
    }

    componentWillUnmount() {
        this.storeUnsubscribe();
    }

    render() {
        const settings = getSettings();
        return (
            <div className="addressbar-textbox">
                <input
                    type="text"
                    value={settings.addressBar.text}
                    onChange={e => this.onChange((e.target as any).value)}
                    onKeyPress={e => this.onKeyPress(e)}
                    onKeyDown={e => this.onKeyDown(e)}
                    onFocus={() => this.onFocus()}
                    placeholder="Enter your entpoint URL" />
            </div>
        );
    }
}

class AddressBarControl extends React.Component<{}, {}> {
    toggleConnected() {
        const settings = getSettings();
    }

    render() {
        return (
            <div className="addressbar-control" onClick={() => this.toggleConnected()}>
                (c)
            </div>
        );
    }
}

class AddressBarMenu extends React.Component<{}, {}> {
    render() {
        return (
            <div className="addressbar-menu">
                (m)
            </div>
        );
    }
}

class AddressBarSearch extends React.Component<{}, {}> {
    storeUnsubscribe: any;

    componentWillMount() {
        this.storeUnsubscribe = getStore().subscribe(() => {
            this.forceUpdate();
        });
    }

    componentWillUnmount() {
        this.storeUnsubscribe();
    }

    searchResultComponents() {
        const settings = getSettings();
        return settings.addressBar.matchingBots.map((bot, index) => <AddressBarSearchResult index={index} bot={bot} key={bot.botId} />);
    }

    render() {
        const settings = getSettings();
        let visible = false;
        if (settings.addressBar.matchingBots.length > 0) {
            visible = true;
        }
        return (
            <div className={"addressbar-search" + (visible ? "" : " closed")}>
                {this.searchResultComponents()}
            </div>
        );
    }
}

interface AddressBarSearchResultProps {
    index: number,
    bot: IBot
}

class AddressBarSearchResult extends React.Component<AddressBarSearchResultProps, {}> {
    selectBot(e: React.MouseEvent<HTMLDivElement>) {
        AddressBarOperators.setText(this.props.bot.botUrl);
        AddressBarOperators.selectBot(this.props.bot);
        AddressBarOperators.clearMatchingBots();
        e.preventDefault();
        e.stopPropagation();
    }

    deleteBot(e: React.MouseEvent<HTMLDivElement>) {
        const settings = getSettings();
        if (settings.addressBar.selectedBot && settings.addressBar.selectedBot.botId === this.props.bot.botId) {
            AddressBarOperators.setText('');
            AddressBarOperators.selectBot(null);
        }
        const matchingBots = settings.addressBar.matchingBots.filter(bot => bot.botId !== this.props.bot.botId);
        AddressBarOperators.setMatchingBots(matchingBots);
        AddressBarOperators.deleteBot(this.props.bot.botId);
        e.preventDefault();
        e.stopPropagation();
    }

    render() {
        return (
            <div className='addressbar-searchresult' onClick={(e) => this.selectBot(e)} >
                <div className='addressbar-searchresult-title'>
                    {this.props.bot.botUrl}
                </div>
                <div className='addressbar-searchresult-delete' onClick={(e) => this.deleteBot(e)} >
                    [x]
                </div>
            </div>
        );
    }
}

class AddressBarBotCreds extends React.Component<{}, {}> {
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
            <span key={1} className="addressbar-botcreds-savecreds-label-small">&nbsp;We never pass these around. They are encrypted and stored locally.</span>
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
                <span
                    className="addressbar-botcreds-title"
                    key={0}>Enter your app credentials to connect
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
                <Checkbox
                    key={4}
                    className="addressbar-botcreds-savecreds"
                    checked={settings.addressBar.selectedBot.saveCreds}
                    label={this.checkboxLabel()}
                    onChange={(value) => this.saveCredentialsChanged(value)} />,
                <button
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
