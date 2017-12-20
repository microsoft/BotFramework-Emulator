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
import { getSettings, addSettingsListener } from '../settings';
import { IBot } from '../../types/botTypes';
import { AddressBarOperators } from './addressBarOperators';

export class AddressBarBotCreds extends React.Component<{}, {}> {
    settingsUnsubscribe: any;

    componentWillMount() {
        window.addEventListener('keypress', (e) => this.onKeyPress(e));
        this.settingsUnsubscribe = addSettingsListener(() => {
            this.forceUpdate();
        });
    }

    componentWillUnmount() {
        window.removeEventListener('keypress', (e) => this.onKeyPress(e));
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

    localeChanged = (text: string) => {
        const settings = getSettings();
        let bot = Object.assign({}, settings.addressBar.selectedBot) as IBot;
        bot.locale = text.trim();
        AddressBarOperators.addOrUpdateBot(bot);
    }

    connectToBot = () => {
        const settings = getSettings();
        const bot = settings.addressBar.selectedBot;
        if (bot) {
            AddressBarOperators.connectToBot(bot);
        }
    }

    onKeyPress = (e: any) => {
        if (!this.isVisible())
            return;
        if(e.key && e.key === 'Enter') {
            this.connectToBot();
        }
    }

    isVisible = (): boolean => {
        const settings = getSettings();
        if (!settings.addressBar.showBotCreds) return false;
        if (settings.addressBar.showSearchResults) return false;
        if (!settings.addressBar.selectedBot) return false;
        return true;
    }

    render() {
        if (!this.isVisible()) return null;
        const settings = getSettings();
        return (
            <div className={"addressbar-botcreds"}>
                <div className="input-group">
                    <label
                        className="form-label">
                        Microsoft App ID:
                    </label>
                    <input
                        type="text"
                        className="form-input addressbar-botcreds-input addressbar-botcreds-appid"
                        value={settings.addressBar.selectedBot.msaAppId}
                        onChange={e => this.appIdChanged((e.target as any).value)} />
                </div>
                <div className="input-group">
                    <label
                        className="form-label">
                        Microsoft App Password:
                    </label>
                    <input
                        type="password"
                        className="form-input addressbar-botcreds-input addressbar-botcreds-password"
                        value={settings.addressBar.selectedBot.msaPassword}
                        onChange={e => this.appPasswordChanged((e.target as any).value)} />
                </div>
                <div className="input-group">
                    <label
                        className="form-label">
                        Locale:
                    </label>
                    <input
                        type="text"
                        className="form-input addressbar-botcreds-input addressbar-botcreds-locale"
                        value={settings.addressBar.selectedBot.locale}
                        onChange={e => this.localeChanged((e.target as any).value)} />
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
