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

import { BotInfo, getBotDisplayName, SharedConstants } from '@bfemulator/app-shared';
import { BotConfigWithPath, Command, CommandServiceImpl, CommandServiceInstance } from '@bfemulator/sdk-shared';
import { IFileService } from 'botframework-config/lib/schema';

import * as BotActions from '../data/action/botActions';
import * as FileActions from '../data/action/fileActions';
import {
  chatFilesUpdated,
  chatsDirectoryUpdated,
  transcriptDirectoryUpdated,
  transcriptsUpdated,
} from '../data/action/resourcesAction';
import { pathExistsInRecentBots } from '../data/botHelpers';
import { store } from '../data/store';
import { ActiveBotHelper } from '../ui/helpers/activeBotHelper';
import { newNotification } from '@bfemulator/app-shared';
import { beginAdd } from '../data/action/notificationActions';

const Commands = SharedConstants.Commands;

/** Registers bot commands */
export class BotCommands {
  @CommandServiceInstance()
  private commandService: CommandServiceImpl;

  // ---------------------------------------------------------------------------
  // Switches the current active bot
  @Command(Commands.Bot.Switch)
  protected async switchBot(bot: BotConfigWithPath | string) {
    let numOfServices;
    if (typeof bot !== 'string') {
      numOfServices = bot.services && bot.services.length;
    }
    try {
      await this.commandService.remoteCall(Commands.Telemetry.TrackEvent, 'bot_open', {
        method: 'bots_list',
        numOfServices,
      });
      return ActiveBotHelper.confirmAndSwitchBots(bot);
    } catch (e) {
      await beginAdd(newNotification(e));
    }
  }

  // ---------------------------------------------------------------------------
  // Closes the current active bot
  @Command(Commands.Bot.Close)
  protected async closeBot() {
    try {
      await ActiveBotHelper.confirmAndCloseBot();
    } catch (e) {
      await beginAdd(newNotification(e));
    }
  }

  // ---------------------------------------------------------------------------
  // Browse for a .bot file and open it
  @Command(Commands.Bot.OpenBrowse)
  protected async browseForBotFile() {
    try {
      await ActiveBotHelper.confirmAndOpenBotFromFile();
    } catch (e) {
      await beginAdd(newNotification(e));
    }
  }

  // ---------------------------------------------------------------------------
  // Loads the bot on the client side using the activeBotHelper
  @Command(Commands.Bot.Load)
  protected loadBot(bot: BotConfigWithPath): Promise<any> {
    if (!pathExistsInRecentBots(bot.path)) {
      // create and switch bots
      return ActiveBotHelper.confirmAndCreateBot(bot, '');
    }
    return ActiveBotHelper.confirmAndSwitchBots(bot);
  }

  // ---------------------------------------------------------------------------
  // Syncs the client side list of bots with bots arg (usually called from server side)
  @Command(Commands.Bot.SyncBotList)
  protected async syncBotList(bots: BotInfo[]): Promise<void> {
    store.dispatch(BotActions.loadBotInfos(bots));
    await this.commandService.remoteCall(Commands.Electron.UpdateFileMenu);
  }

  // ---------------------------------------------------------------------------
  // Sets a bot as active (called from server-side)
  @Command(Commands.Bot.SetActive)
  protected async setActiveBot(bot: BotConfigWithPath, botDirectory: string) {
    store.dispatch(BotActions.setActiveBot(bot));
    store.dispatch(FileActions.setRoot(botDirectory));
    await Promise.all([
      this.commandService.remoteCall(Commands.Electron.UpdateFileMenu),
      this.commandService.remoteCall(Commands.Electron.SetTitleBar, getBotDisplayName(bot)),
    ]);
  }

  @Command(Commands.Bot.TranscriptFilesUpdated)
  protected transcriptFilesUpdated(transcripts: IFileService[]) {
    store.dispatch(transcriptsUpdated(transcripts));
  }

  @Command(Commands.Bot.ChatFilesUpdated)
  protected chatFilesUpdated(chatFiles: IFileService[]) {
    store.dispatch(chatFilesUpdated(chatFiles));
  }

  @Command(Commands.Bot.TranscriptsPathUpdated)
  protected transcriptsPathUpdated(path: string) {
    store.dispatch(transcriptDirectoryUpdated(path));
  }

  @Command(Commands.Bot.ChatsPathUpdated)
  protected chatsPathUpdated(path: string) {
    store.dispatch(chatsDirectoryUpdated(path));
  }
}
