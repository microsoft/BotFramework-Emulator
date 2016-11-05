import * as React from 'react';
import { getSettings, ISettings, addSettingsListener } from '../settings';
import { Settings as ServerSettings } from '../../types/serverSettingsTypes';
import { AddressBarActions, ConversationActions, ServerSettingsActions } from '../reducers';
import { IBot, newBot } from '../../types/botTypes';
import * as log from '../log';
import { AddressBarOperators } from './addressBarOperators';


export class AddressBarTextBox extends React.Component<{}, {}> {
    settingsUnsubscribe: any;

    onChange(text: string) {
        text = text || '';
        AddressBarActions.setText(text);
        const bots = AddressBarOperators.updateMatchingBots(text, null) || [];
        if (text.length) {
            if (!bots.length) {
                AddressBarOperators.selectBot(newBot({ botUrl: text }));
                AddressBarActions.showBotCreds();
            } else if (bots.length === 1) {
                if (bots[0].botUrl.toLowerCase() === text.toLowerCase()) {
                    AddressBarOperators.selectBot(bots[0]);
                    AddressBarActions.showBotCreds();
                } else {
                    AddressBarActions.showSearchResults();
                }
            } else if (bots.length) {
                AddressBarOperators.selectBot(null);
                AddressBarActions.showSearchResults();
            }
        } else {
            AddressBarActions.showSearchResults();
        }
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
                AddressBarActions.showBotCreds();
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

    onFocus(e: React.FocusEvent<HTMLInputElement>) {
        const settings = getSettings();
        const bots = AddressBarOperators.getMatchingBots(settings.addressBar.text, null);
        if (settings.addressBar.text.length) {
            const bot = AddressBarOperators.findMatchingBotForUrl(settings.addressBar.text, bots) || newBot({ botUrl: settings.addressBar.text });
            if (bot) {
                AddressBarOperators.selectBot(bot);
                AddressBarActions.showBotCreds();
            } else {
                AddressBarOperators.updateMatchingBots(settings.addressBar.text, bots);
                AddressBarActions.showSearchResults();
            }
        } else {
            AddressBarOperators.updateMatchingBots(settings.addressBar.text, bots);
            AddressBarActions.showSearchResults();
        }
    }

    componentWillMount() {
        this.settingsUnsubscribe = addSettingsListener(() => {
            this.forceUpdate();
        });
    }

    componentWillUnmount() {
        this.settingsUnsubscribe();
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
                    onFocus={(e) => this.onFocus(e)}
                    placeholder="Enter your endpoint URL" />
            </div>
        );
    }
}
