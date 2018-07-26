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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { ActiveBotHelper } from '../ui/helpers/activeBotHelper';
import { pathExistsInRecentBots } from '../data/botHelpers';
import { CommandServiceImpl } from '../platform/commands/commandServiceImpl';
import store from '../data/store';
import * as BotActions from '../data/action/botActions';
import * as EditorActions from '../data/action/editorActions';
import * as FileActions from '../data/action/fileActions';
import * as Constants from '../constants';
import { getBotDisplayName, SharedConstants } from '@bfemulator/app-shared';
/** Registers bot commands */
export function registerCommands(commandRegistry) {
    const Commands = SharedConstants.Commands;
    // ---------------------------------------------------------------------------
    // Switches the current active bot
    commandRegistry.registerCommand(Commands.Bot.Switch, (bot) => ActiveBotHelper.confirmAndSwitchBots(bot));
    // ---------------------------------------------------------------------------
    // Closes the current active bot
    commandRegistry.registerCommand(Commands.Bot.Close, () => ActiveBotHelper.confirmAndCloseBot());
    // ---------------------------------------------------------------------------
    // Browse for a .bot file and open it
    commandRegistry.registerCommand(Commands.Bot.OpenBrowse, () => ActiveBotHelper.confirmAndOpenBotFromFile());
    // ---------------------------------------------------------------------------
    // Loads the bot on the client side using the activeBotHelper
    commandRegistry.registerCommand(Commands.Bot.Load, (bot) => {
        if (!pathExistsInRecentBots(bot.path)) {
            // create and switch bots
            return ActiveBotHelper.confirmAndCreateBot(bot, '');
        }
        return ActiveBotHelper.confirmAndSwitchBots(bot);
    });
    // ---------------------------------------------------------------------------
    // Syncs the client side list of bots with bots arg (usually called from server side)
    commandRegistry.registerCommand(Commands.Bot.SyncBotList, (bots) => __awaiter(this, void 0, void 0, function* () {
        store.dispatch(BotActions.load(bots));
        CommandServiceImpl.remoteCall(Commands.Electron.UpdateRecentBotsInMenu);
    }));
    // ---------------------------------------------------------------------------
    // Sets a bot as active (called from server-side)
    commandRegistry.registerCommand(Commands.Bot.SetActive, (bot, botDirectory) => {
        store.dispatch(BotActions.setActive(bot));
        store.dispatch(FileActions.setRoot(botDirectory));
        CommandServiceImpl.remoteCall(Commands.Electron.UpdateRecentBotsInMenu);
        CommandServiceImpl.remoteCall(Commands.Electron.SetTitleBar, getBotDisplayName(bot));
    });
    // ---------------------------------------------------------------------------
    // Opens up bot settings page for a bot
    commandRegistry.registerCommand(Commands.Bot.OpenSettings, (_bot) => {
        store.dispatch(EditorActions.open(Constants.CONTENT_TYPE_BOT_SETTINGS, Constants.DOCUMENT_ID_BOT_SETTINGS, false));
    });
}
//# sourceMappingURL=botCommands.js.map