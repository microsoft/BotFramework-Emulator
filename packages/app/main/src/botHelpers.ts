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

import * as path from 'path';

import * as electron from 'electron';
import { BotInfo, getBotDisplayName, SharedConstants } from '@bfemulator/app-shared';
import * as BotActions from '@bfemulator/app-shared/built/state/actions/botActions';
import { BotConfigWithPath, BotConfigWithPathImpl } from '@bfemulator/sdk-shared';
import { BotConfiguration } from 'botframework-config';
import { CommandServiceImpl, CommandServiceInstance } from '@bfemulator/sdk-shared';

import { store } from './state/store';
import { CredentialManager } from './credentialManager';
import { Conversation } from './server/state/conversation';

export class BotHelpers {
  @CommandServiceInstance()
  private static commandService: CommandServiceImpl;
  /** Will attempt to load the bot, using the secret if specified.
   *
   *  If the bot is encrypted and the secret is invalid or missing,
   *  then the user will be prompted with a dialog allowing him / her
   *  to keep retrying until the correct secret is entered or the popup
   *  is dismissed.
   */
  static async loadBotWithRetry(botPath: string, secret?: string): Promise<BotConfigWithPath> {
    try {
      // load the bot and transform it into internal BotConfig implementation
      let bot: BotConfigWithPath = await BotConfiguration.load(botPath, secret);
      bot = BotHelpers.cloneBot(bot);
      bot.path = botPath;

      if (!BotHelpers.pathExistsInRecentBots(botPath)) {
        // bot does not have an entry in recent bots so create one
        const botInfo: BotInfo = {
          path: botPath,
          displayName: getBotDisplayName(bot),
        };
        BotHelpers.patchBotsJson(botPath, botInfo);
      }

      if (secret) {
        // make sure the user stores an updated version of the secret
        const storedSecret = await CredentialManager.getPassword(botPath);
        if (!storedSecret || secret !== storedSecret) {
          await CredentialManager.setPassword(botPath, secret);
        }
      }

      return bot;
    } catch (e) {
      // TODO: Only prompt for password if we know for a fact we need it.
      // Lots of different errors can arrive here, like ENOENT, if the file wasn't found.
      // Add easily discernable errors / error codes to msbot package
      if (e instanceof Error && e.message.includes('secret')) {
        // try to fetch the secret from the OS credential store
        secret = await CredentialManager.getPassword(botPath);
        if (secret) {
          return await this.loadBotWithRetry(botPath, secret);
        } else {
          // otherwise, we need to ask for a secret and decrypt
          return await BotHelpers.promptForSecretAndRetry(botPath);
        }
      } else {
        throw e;
      }
    }
  }

  static getActiveBot(): BotConfigWithPath {
    return store.getState().bot.activeBot;
  }

  static getBotInfoByPath(path: string): BotInfo {
    return store.getState().bot.botFiles.find(bot => bot && bot.path === path);
  }

  static pathExistsInRecentBots(path: string): boolean {
    return store.getState().bot.botFiles.some(bot => bot && bot.path === path);
  }

  /** Prompts the user for a secret and retries the bot load flow */
  static async promptForSecretAndRetry(botPath: string): Promise<BotConfigWithPath> {
    // bot requires a secret to decrypt properties
    const { Commands } = SharedConstants;
    const newSecret = await this.commandService.remoteCall<string>(Commands.UI.ShowSecretPromptDialog);
    if (newSecret === null) {
      // pop-up was dismissed; stop trying to prompt for secret
      return null;
    }
    // try again with new secret
    return BotHelpers.loadBotWithRetry(botPath, newSecret);
  }

  /** Converts a BotConfigWithPath to a BotConfig */
  public static toSavableBot(bot: BotConfigWithPath, secret?: string): BotConfiguration {
    if (!bot) {
      throw new Error(`Cannot convert ${'' + bot} bot to savable bot.`);
    }
    const newBot = BotConfiguration.fromJSON(bot);
    (newBot as any).internal.location = bot.path; // Workaround until defect is fixed
    // refresh the secret key using the current secret
    if (secret) {
      newBot.validateSecret(secret);
    }

    return newBot;
  }

  /** Clones a bot */
  public static cloneBot(bot: BotConfigWithPath): BotConfigWithPath {
    if (!bot) {
      return null;
    }
    return BotConfigWithPathImpl.fromJSON(bot);
  }

  /** Patches a bot record in bots.json, and updates the list
   *  in the store and on disk.
   */
  public static patchBotsJson(botPath: string, bot: BotInfo): BotInfo[] {
    const state = store.getState();
    const bots = [...state.bot.botFiles];
    const botIndex = bots.findIndex(bot1 => bot1.path === botPath);
    if (botIndex > -1) {
      bots[botIndex] = { ...bots[botIndex], ...bot };
    } else {
      bots.unshift(bot);
    }
    store.dispatch(BotActions.load(bots));

    return bots;
  }

  /** Saves a bot to disk */
  public static async saveBot(bot: BotConfigWithPath, secret?: string): Promise<void> {
    secret = secret || (await CredentialManager.getPassword(bot.path));

    const savableBot = BotHelpers.toSavableBot(bot, secret);

    if (secret) {
      savableBot.validateSecret(secret);
    }
    return savableBot.save(secret).catch();
  }

  /** Removes a bot from bots.json (doesn't delete the bot file) */
  public static async removeBotFromList(botPath: string): Promise<void> {
    const state = store.getState();
    const bots = [...state.bot.botFiles].filter(bot => bot.path !== botPath);
    store.dispatch(BotActions.load(bots));
  }

  public static getTranscriptsPath(activeBot: BotConfigWithPath, conversation: Conversation): string {
    if (!activeBot || conversation.mode === 'livechat-url') {
      return path.join(electron.app.getPath('downloads'), './transcripts');
    }
    const dirName = path.dirname(activeBot.path);
    return path.join(dirName, './transcripts');
  }
}
