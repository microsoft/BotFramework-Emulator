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

import { getStore } from '../botData/store';
import { BotConfigWithPath, CommandRegistryImpl } from '@bfemulator/sdk-shared';
import { Conversation } from '@bfemulator/emulator-core';
import * as Path from 'path';
import { mainWindow } from '../main';
import { getActiveBot, getBotInfoByPath, patchBotsJson, toSavableBot } from '../botHelpers';
import { parseActivitiesFromChatFile, showSaveDialog, writeFile } from '../utils';
import { emulator } from '../emulator';
import { sync as mkdirpSync } from 'mkdirp';
import * as BotActions from '../botData/actions/botActions';
import { promisify } from 'util';
import * as Fs from 'fs';
import { cleanupId as cleanupActivityChannelAccountId, CustomActivity } from '../utils/conversation';
import { newBot, newEndpoint, SharedConstants } from '@bfemulator/app-shared';
import { botProjectFileWatcher } from '../watchers';
import { getStore as getSettingsStore } from '../settingsData/store';

/** Registers emulator (actual conversation emulation logic) commands */
export function registerCommands(commandRegistry: CommandRegistryImpl) {
  const Commands = SharedConstants.Commands.Emulator;

  // ---------------------------------------------------------------------------
  // Saves the conversation to a transcript file, with user interaction to set filename.
  commandRegistry.registerCommand(Commands.SaveTranscriptToFile, async (conversationId: string): Promise<void> => {
    const activeBot: BotConfigWithPath = getActiveBot();
    if (!activeBot) {
      throw new Error(`${Commands.SaveTranscriptToFile}: No active bot.`);
    }

    const convo = emulator.framework.server.botEmulator.facilities.conversations.conversationById(conversationId);
    if (!convo) {
      throw new Error(`${Commands.SaveTranscriptToFile}: Conversation ${conversationId} not found.`);
    }
    const store = getStore();
    const path = Path.resolve(store.getState().bot.currentBotDirectory) || '';

    const filename = showSaveDialog(mainWindow.browserWindow, {
      // TODO - Localization
      filters: [
        {
          name: 'Transcript Files',
          extensions: ['transcript']
        }
      ],
      defaultPath: path,
      showsTagField: false,
      title: 'Save conversation transcript',
      buttonLabel: 'Save'
    });

    // If there is no current bot directory, we should set the directory
    // that the transcript is saved in as the bot directory, copy the botfile over,
    // change the bots.json entry, and watch the directory.
    if (!path && filename && filename.length) {
      const bot = getActiveBot();
      let botInfo = getBotInfoByPath(bot.path);
      const saveableBot = toSavableBot(bot, botInfo.secret);
      const botDirectory = Path.dirname(filename);
      const botPath = Path.join(botDirectory, `${bot.name}.bot`);
      botInfo = { ...botInfo, path: botPath };

      await saveableBot.save(botPath);
      await patchBotsJson(botPath, botInfo);
      await botProjectFileWatcher.watch(botPath);
      store.dispatch(BotActions.setDirectory(botDirectory));
    }

    if (filename && filename.length) {
      mkdirpSync(Path.dirname(filename));
      const transcripts = await convo.getTranscript();
      writeFile(filename, transcripts);
    }
  });

  // ---------------------------------------------------------------------------
  // Feeds a transcript from disk to a conversation
  commandRegistry.registerCommand(
    Commands.FeedTranscriptFromDisk,
    async (conversationId: string, botId: string, userId: string, filePath: string) => {

      const path = Path.resolve(filePath);
      const stat = await promisify(Fs.stat)(path);

      if (!stat || !stat.isFile()) {
        throw new Error(`${Commands.FeedTranscriptFromDisk}: File ${filePath} not found.`);
      }

      const activities = JSON.parse(await promisify(Fs.readFile)(path, 'utf-8'));

      mainWindow.commandService.call(Commands.FeedTranscriptFromMemory, conversationId, botId, userId, activities);

      const { name, ext } = Path.parse(path);
      const fileName = `${name}${ext}`;

      return {
        fileName,
        filePath
      };
    }
  );

  // ---------------------------------------------------------------------------
  // Feeds a deep-linked transcript (array of parsed activities) to a conversation
  commandRegistry.registerCommand(
    Commands.FeedTranscriptFromMemory,
    (conversationId: string, botId: string, userId: string, activities: CustomActivity[]): void => {

      const activeBot: BotConfigWithPath = getActiveBot();

      if (!activeBot) {
        throw new Error('emulator:feed-transcript:deep-link: No active bot.');
      }

      const convo = emulator.framework.server.botEmulator.facilities.conversations.conversationById(conversationId);
      if (!convo) {
        throw new Error(`emulator:feed-transcript:deep-link: Conversation ${conversationId} not found.`);
      }

      activities = cleanupActivityChannelAccountId(activities, botId, userId);
      convo.feedActivities(activities);
    }
  );

  // ---------------------------------------------------------------------------
  // Get a speech token
  commandRegistry.registerCommand(Commands.GetSpeechToken, (endpointId: string, refresh: boolean) => {
    const endpoint = emulator.framework.server.botEmulator.facilities.endpoints.get(endpointId);

    return endpoint && endpoint.getSpeechToken(refresh);
  });

  // ---------------------------------------------------------------------------
  // Creates a new conversation object for transcript
  commandRegistry.registerCommand(Commands.NewTranscript, (conversationId: string): Conversation => {
    // get the active bot or mock one
    let bot: BotConfigWithPath = getActiveBot();

    if (!bot) {
      bot = newBot();
      bot.services.push(newEndpoint());
      getStore().dispatch(BotActions.mockAndSetActive(bot));
    }

    // TODO: Move away from the .users state on legacy emulator settings, and towards per-conversation users
    const conversation = emulator.framework.server.botEmulator.facilities.conversations.newConversation(
      emulator.framework.server.botEmulator,
      null,
      { id: getSettingsStore().getState().users.currentUserId, name: 'User' },
      conversationId
    );

    return conversation;
  });

  // ---------------------------------------------------------------------------
  // Open the chat file in a tabbed document as a transcript
  commandRegistry.registerCommand(Commands.OpenChatFile,
    async (filename: string): Promise<{ activities: CustomActivity[] }> => {
      try {
        const activities = await parseActivitiesFromChatFile(filename);
        return { activities };
      } catch (err) {
        throw new Error(`${Commands.OpenChatFile}: Error calling parseActivitiesFromChatFile(): ${err}`);
      }
    });
}
