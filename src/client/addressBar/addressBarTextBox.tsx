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
import { AddressBarActions } from '../reducers';
import { newBot } from '../../types/botTypes';
import { AddressBarOperators } from './addressBarOperators';


export class AddressBarTextBox extends React.Component<{}, {}> {
    settingsUnsubscribe: any;
    textBoxRef: any;
    hasFocus: boolean;

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

    onFocus() {
        this.hasFocus = true;
        this.focusAddressBarAndSelectText();
        AddressBarActions.gainFocus();
    }

    onBlur() {
        this.hasFocus = false;
        AddressBarActions.loseFocus();
    }

    focusAddressBarAndSelectText() {
        this.textBoxRef.select();
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
        this.settingsUnsubscribe = addSettingsListener((settings) => {
            let addressBarGainFocus = settings.addressBar.hasFocus && !this.hasFocus;
            let addressBarLoseFocus = !settings.addressBar.hasFocus && this.hasFocus;

            if (addressBarGainFocus) {
                this.textBoxRef.focus();
            }
            else if (addressBarLoseFocus) {
                this.textBoxRef.blur();
            }
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
                    ref={ref => this.textBoxRef = ref}
                    value={settings.addressBar.text}
                    onChange={e => this.onChange((e.target as any).value)}
                    onFocus={() => this.onFocus()}
                    onBlur={() => this.onBlur()}
                    placeholder="Enter your endpoint URL" />
            </div>
        );
    }
}
