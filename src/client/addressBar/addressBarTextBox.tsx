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

    onFocus() {
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

    onBlur() {
        const settings = getSettings();
        const activeBot = (new ServerSettings(settings.serverSettings)).getActiveBot();
        if (activeBot) {
            AddressBarActions.setText(activeBot.botUrl);
        }
    }

    componentWillMount() {
        this.settingsUnsubscribe = addSettingsListener((settings) => {
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
                    onFocus={() => this.onFocus()}
                    onBlur={() => this.onBlur()}
                    placeholder="Enter your endpoint URL" />
            </div>
        );
    }
}
