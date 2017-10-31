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
import { IBot } from '../../types/botTypes';
import { AddressBarOperators } from './addressBarOperators';
import * as Constants from '../constants';


export class AddressBarSearch extends React.Component<{}, {}> {
    settingsUnsubscribe: any;

    componentWillMount() {
        this.settingsUnsubscribe = addSettingsListener(() => {
            this.forceUpdate();
        });
    }

    componentWillUnmount() {
        this.settingsUnsubscribe();
    }

    searchResultComponents() {
        const settings = getSettings();
        return settings.addressBar.matchingBots.map((bot, index) => <AddressBarSearchResult index={index} bot={bot} key={bot.botId} />);
    }

    render() {
        const settings = getSettings();
        if (!settings.addressBar.showSearchResults) return null;
        if (settings.addressBar.showBotCreds) return null;
        if (!settings.addressBar.matchingBots || !settings.addressBar.matchingBots.length) return null;
        return (
            <div className="addressbar-search">
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
    selectBot() {
        AddressBarOperators.setText(this.props.bot.botUrl);
        AddressBarOperators.selectBot(this.props.bot);
        AddressBarOperators.clearMatchingBots();
        AddressBarActions.showBotCreds();
        AddressBarActions.loseFocus();
    }

    deleteBot() {
        const settings = getSettings();
        if (settings.addressBar.selectedBot && settings.addressBar.selectedBot.botId === this.props.bot.botId) {
            AddressBarOperators.setText('');
            AddressBarOperators.selectBot(null);
        }
        const matchingBots = settings.addressBar.matchingBots.filter(bot => bot.botId !== this.props.bot.botId);
        AddressBarOperators.setMatchingBots(matchingBots);
        AddressBarOperators.deleteBot(this.props.bot.botId);
    }

    render() {
        return (
            <div className='addressbar-searchresult'>
                <div className='addressbar-searchresult-title' onClick={() => this.selectBot()}>
                    <a className='addressbar-searchresult-a' href='javascript:void(0)' onClick={() => this.selectBot()}>
                        {this.props.bot.botUrl}
                    </a>
                </div>
                <a href='javascript:void(0)' onClick={() => this.deleteBot()} >
                    <div className='addressbar-searchresult-delete' onClick={() => this.deleteBot()} dangerouslySetInnerHTML={{ __html: Constants.clearCloseIcon('', 16) }} />
                </a>
            </div>
        );
    }
}
