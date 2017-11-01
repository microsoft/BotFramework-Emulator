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

import { getSettings } from '../settings';
import { LogActions } from '../reducers';
import { AddressBarActions, ConversationActions, ServerSettingsActions } from '../reducers';
import { IBot } from '../../types/botTypes';
import { BotEmulatorContext } from '../botEmulatorContext';


export class AddressBarOperators {
    static getMatchingBots(text: string, bots: IBot[]): IBot[] {
        const settings = getSettings();
        text = text || settings.addressBar.text;
        bots = bots || settings.serverSettings.bots;
        if (text.length === 0)
            return bots;
        const lower = text.toLowerCase();
        return bots.filter(bot => bot.botUrl).filter(bot => bot.botUrl.toLowerCase().includes(lower));
    }

    static findMatchingBotForUrl(text: string, bots: IBot[]): IBot {
        const settings = getSettings();
        text = text || settings.addressBar.text;
        bots = bots || settings.serverSettings.bots;
        let bot: IBot = null;
        if (bots && text && text.length) {
            const lower = text.toLowerCase();
            bot = bots.filter(bot => bot.botUrl).find(bot => lower === bot.botUrl.toLowerCase());
        }
        return bot;
    }

    static selectBotForUrl(text: string, bots: IBot[]): IBot {
        const bot = AddressBarOperators.findMatchingBotForUrl(text, bots);
        AddressBarActions.selectBot(bot);
        return bot;
    }

    static selectBot(bot: IBot) {
        AddressBarActions.selectBot(bot);
    }

    static clearMatchingBots() {
        AddressBarActions.setMatchingBots([]);
    }

    static addOrUpdateBot(bot: IBot) {
        const settings = getSettings();
        if (settings.addressBar.selectedBot && settings.addressBar.selectedBot.botId === bot.botId) {
            AddressBarActions.selectBot(bot);
        }
        ServerSettingsActions.remote_addOrUpdateBot(bot);
    }

    static setMatchingBots(bots: IBot[]) {
        AddressBarActions.setMatchingBots(bots);
    }

    static updateMatchingBots(text: string, bots: IBot[]): IBot[] {
        const settings = getSettings();
        text = text || settings.addressBar.text;
        bots = bots || settings.serverSettings.bots;
        const matchingBots = AddressBarOperators.getMatchingBots(text, bots);
        AddressBarActions.setMatchingBots(matchingBots);
        return matchingBots;
    }

    static setText(text: string) {
        AddressBarActions.setText(text);
    }

    static deleteBot(botId: string) {
        const settings = getSettings();
        if (botId === settings.serverSettings.activeBot) {
            ServerSettingsActions.remote_setActiveBot('');
        }
        ServerSettingsActions.remote_deleteBot(botId);
    }

    static activateBot(bot: IBot) {
        ServerSettingsActions.remote_setActiveBot(bot.botId);
    }

    static isActiveBot(bot: IBot): boolean {
        const settings = getSettings();
        return !settings.serverSettings.activeBot ||                // no active bot is set, or
            settings.serverSettings.activeBot.length === 0 ||       // no active bot is set, or
            settings.serverSettings.activeBot === bot.botId;        // active bot matches current bot
    }

    static connectToBot(bot: IBot) {
        if (!AddressBarOperators.isActiveBot(bot)) {
            LogActions.clear();
        }
        AddressBarOperators.selectBot(null);
        AddressBarOperators.addOrUpdateBot(bot);
        AddressBarOperators.activateBot(bot);
        ConversationActions.newConversation();
        AddressBarActions.hideBotCreds();
        AddressBarActions.hideSearchResults();
    }

    static assignBot(botContext: BotEmulatorContext): void {
        const bot = AddressBarOperators.selectBotForUrl(botContext.endpoint, null) ||
                    botContext.toBot();

        // update the bot with the passed in information
        const updatedBot = botContext.updateBot(bot);

        if (!AddressBarOperators.isActiveBot(updatedBot)) {
            LogActions.clear();
        }

        AddressBarOperators.setText(botContext.endpoint);
        AddressBarOperators.selectBot(updatedBot);
        AddressBarOperators.connectToBot(updatedBot);
        AddressBarOperators.selectBot(updatedBot);
    }
}
