import * as React from 'react';
import { getStore, getSettings, ISettings } from '../settings';
import { Settings as ServerSettings } from '../../types/serverSettingsTypes';
import { AddressBarActions, ConversationActions, ServerSettingsActions } from '../reducers';
import { IBot, newBot } from '../../types/botTypes';
import * as log from '../log';
import { AddressBarOperators } from './addressBarOperators';


export class AddressBarTextBox extends React.Component<{}, {}> {
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
