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

import { BotConfigWithPath, CommandRegistryImpl } from '@bfemulator/sdk-shared';
import { ActiveBotHelper } from '../ui/helpers/activeBotHelper';
import { pathExistsInRecentBots } from '../data/botHelpers';
import { CommandServiceImpl } from '../platform/commands/commandServiceImpl';
import store from '../data/store';
import * as BotActions from '../data/action/botActions';
import * as EditorActions from '../data/action/editorActions';
import * as FileActions from '../data/action/fileActions';
import * as Constants from '../constants';
import { BotInfo, getBotDisplayName } from '@bfemulator/app-shared';

/** Registers bot commands */
export function registerCommands(commandRegistry: CommandRegistryImpl) {
  // ---------------------------------------------------------------------------
  // Switches the current active bot
  commandRegistry.registerCommand('bot:switch',
    (bot: BotConfigWithPath | string) => ActiveBotHelper.confirmAndSwitchBots(bot));

  // ---------------------------------------------------------------------------
  // Closes the current active bot
  commandRegistry.registerCommand('bot:close', () => ActiveBotHelper.confirmAndCloseBot());

  // ---------------------------------------------------------------------------
  // Browse for a .bot file and open it
  commandRegistry.registerCommand('bot:browse-open', () => ActiveBotHelper.confirmAndOpenBotFromFile());

  // ---------------------------------------------------------------------------
  // Loads the bot on the client side using the activeBotHelper
  commandRegistry.registerCommand('bot:load', (bot: BotConfigWithPath): Promise<any> => {
    if (!pathExistsInRecentBots(bot.path)) {
      // create and switch bots
      return ActiveBotHelper.confirmAndCreateBot(bot, '');
    }
    return ActiveBotHelper.confirmAndSwitchBots(bot);
  });

  // ---------------------------------------------------------------------------
  // Syncs the client side list of bots with bots arg (usually called from server side)
  commandRegistry.registerCommand('bot:list:sync', async (bots: BotInfo[]): Promise<void> => {
    store.dispatch(BotActions.load(bots));
    CommandServiceImpl.remoteCall('menu:update-recent-bots');
  });

  // ---------------------------------------------------------------------------
  // Sets a bot as active (called from server-side)
  commandRegistry.registerCommand('bot:set-active', (bot: BotConfigWithPath, botDirectory: string) => {
    store.dispatch(BotActions.setActive(bot));
    store.dispatch(FileActions.setRoot(botDirectory));
    CommandServiceImpl.remoteCall('menu:update-recent-bots');
    CommandServiceImpl.remoteCall('electron:set-title-bar', getBotDisplayName(bot));
  });

  // ---------------------------------------------------------------------------
  // Opens up bot settings page for a bot
  commandRegistry.registerCommand('bot-settings:open', (_bot: BotConfigWithPath): void => {
    store.dispatch(EditorActions.open(Constants.CONTENT_TYPE_BOT_SETTINGS, Constants.DOCUMENT_ID_BOT_SETTINGS, false));
  });
}
