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
import { store } from '../data/store';
import * as BotActions from '../data/action/botActions';
import * as FileActions from '../data/action/fileActions';
import { BotInfo, getBotDisplayName, SharedConstants } from '@bfemulator/app-shared';
import {
  chatFilesUpdated,
  chatsDirectoryUpdated,
  transcriptDirectoryUpdated,
  transcriptsUpdated
} from '../data/action/resourcesAction';
import { IFileService } from 'botframework-config/lib/schema';

/** Registers bot commands */
export function registerCommands(commandRegistry: CommandRegistryImpl) {
  const Commands = SharedConstants.Commands;

  // ---------------------------------------------------------------------------
  // Switches the current active bot
  commandRegistry.registerCommand(Commands.Bot.Switch,
    (bot: BotConfigWithPath | string) => ActiveBotHelper.switchBots(bot));

  // ---------------------------------------------------------------------------
  // Closes the current active bot
  commandRegistry.registerCommand(Commands.Bot.Close, () => ActiveBotHelper.confirmAndCloseBot());

  // ---------------------------------------------------------------------------
  // Browse for a .bot file and open it
  commandRegistry.registerCommand(Commands.Bot.OpenBrowse, () => ActiveBotHelper.confirmAndOpenBotFromFile());

  // ---------------------------------------------------------------------------
  // Loads the bot on the client side using the activeBotHelper
  commandRegistry.registerCommand(Commands.Bot.Load, (bot: BotConfigWithPath): Promise<any> => {
    if (!pathExistsInRecentBots(bot.path)) {
      // create and switch bots
      return ActiveBotHelper.confirmAndCreateBot(bot, '');
    }
    return ActiveBotHelper.switchBots(bot);
  });

  // ---------------------------------------------------------------------------
  // Syncs the client side list of bots with bots arg (usually called from server side)
  commandRegistry.registerCommand(Commands.Bot.SyncBotList, async (bots: BotInfo[]): Promise<void> => {
    store.dispatch(BotActions.load(bots));
    await CommandServiceImpl.remoteCall(Commands.Electron.UpdateFileMenu);
  });

  // ---------------------------------------------------------------------------
  // Sets a bot as active (called from server-side)
  commandRegistry.registerCommand(Commands.Bot.SetActive, async (bot: BotConfigWithPath, botDirectory: string) => {
    store.dispatch(BotActions.setActive(bot));
    store.dispatch(FileActions.setRoot(botDirectory));
    await Promise.all([
      CommandServiceImpl.remoteCall(Commands.Electron.UpdateFileMenu),
      CommandServiceImpl.remoteCall(Commands.Electron.SetTitleBar, getBotDisplayName(bot))
    ]);
  });

  commandRegistry.registerCommand(Commands.Bot.TranscriptFilesUpdated, (transcripts: IFileService[]) => {
    store.dispatch(transcriptsUpdated(transcripts));
  });

  commandRegistry.registerCommand(Commands.Bot.ChatFilesUpdated, (chatFiles: IFileService[]) => {
    store.dispatch(chatFilesUpdated(chatFiles));
  });

  commandRegistry.registerCommand(Commands.Bot.TranscriptsPathUpdated, (path: string) => {
    store.dispatch(transcriptDirectoryUpdated(path));
  });

  commandRegistry.registerCommand(Commands.Bot.ChatsPathUpdated, (path: string) => {
    store.dispatch(chatsDirectoryUpdated(path));
  });
}
