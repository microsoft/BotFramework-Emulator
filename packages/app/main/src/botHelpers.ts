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
import { BotConfigWithPath, BotConfigWithPathImpl } from '@bfemulator/sdk-shared';
import { BotConfiguration } from 'botframework-config';

import * as BotActions from './botData/actions/botActions';
import { getStore } from './botData/store';
import { mainWindow } from './main';

const store = getStore();

export function getActiveBot(): BotConfigWithPath {
  return store.getState().bot.activeBot;
}

export function getBotInfoByPath(path: string): BotInfo {
  return store.getState().bot.botFiles.find(bot => bot && bot.path === path);
}

export function pathExistsInRecentBots(path: string): boolean {
  return store.getState().bot.botFiles.some(bot => bot && bot.path === path);
}

/** Will attempt to load the bot, using the secret if specified.
 *
 *  If the bot is encrypted and the secret is invalid or missing,
 *  then the user will be prompted with a dialog allowing him / her
 *  to keep retrying until the correct secret is entered or the popup
 *  is dismissed.
 */
export async function loadBotWithRetry(botPath: string, secret?: string): Promise<BotConfigWithPath> {
  try {
    // load the bot and transform it into internal BotConfig implementation
    let bot: BotConfigWithPath = await BotConfiguration.load(botPath, secret);

    // if the bot has a padlock and we don't have a secret, then we need to ask for a secret and decrypt
    if (bot.padlock && !secret) {
      return await promptForSecretAndRetry(botPath);
    }

    bot = cloneBot(bot);
    bot.path = botPath;

    if (pathExistsInRecentBots(botPath)) {
      // Bot was either decrypted on first try, or we used a new secret
      // entered via the secret prompt dialog. In the latter case, we should
      // update the secret for the bot that we have on record with the correct secret.
      const botInfo = getBotInfoByPath(botPath);
      if (secret && botInfo.secret !== secret) {
        // update the secret in bots.json with the valid secret
        const updatedBot = { ...botInfo, secret };
        await patchBotsJson(botPath, updatedBot);
      }
    } else {
      // bot does not have an entry in recent bots so create one
      const botInfo: BotInfo = {
        path: botPath,
        displayName: getBotDisplayName(bot),
        secret,
      };
      await patchBotsJson(botPath, botInfo);
    }

    return bot;
  } catch (e) {
    // TODO: Only prompt for password if we know for a fact we need it.
    // Lots of different errors can arrive here, like ENOENT, if the file wasn't found.
    // Add easily discernable errors / error codes to msbot package
    if (e instanceof Error && e.message.includes('secret')) {
      return promptForSecretAndRetry(botPath);
    } else {
      throw e;
    }
  }
}

/** Prompts the user for a secret and retries the bot load flow */
export async function promptForSecretAndRetry(botPath: string): Promise<BotConfigWithPath> {
  // bot requires a secret to decrypt properties
  const { Commands } = SharedConstants;
  const newSecret = await mainWindow.commandService.remoteCall(Commands.UI.ShowSecretPromptDialog);
  if (newSecret === null) {
    // pop-up was dismissed; stop trying to prompt for secret
    return null;
  }
  // try again with new secret
  return loadBotWithRetry(botPath, newSecret);
}

/** Converts a BotConfigWithPath to a BotConfig */
export function toSavableBot(bot: BotConfigWithPath, secret?: string): BotConfiguration {
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
export function cloneBot(bot: BotConfigWithPath): BotConfigWithPath {
  if (!bot) {
    return null;
  }
  return BotConfigWithPathImpl.fromJSON(bot);
}

/** Patches a bot record in bots.json, and updates the list
 *  in the store and on disk.
 */
export async function patchBotsJson(botPath: string, bot: BotInfo): Promise<BotInfo[]> {
  const state = store.getState();
  const bots = [...state.bot.botFiles];
  const botIndex = bots.findIndex(bot1 => bot1.path === botPath);
  if (botIndex > -1) {
    bots[botIndex] = { ...bots[botIndex], ...bot };
  } else {
    bots.unshift(bot);
  }
  store.dispatch(BotActions.load(bots));
  const { Commands } = SharedConstants;
  await mainWindow.commandService.remoteCall(Commands.Bot.SyncBotList, bots).catch();

  return bots;
}

/** Saves a bot to disk */
export async function saveBot(bot: BotConfigWithPath): Promise<void> {
  const botInfo = (await getBotInfoByPath(bot.path)) || {};

  const savableBot = toSavableBot(bot, botInfo.secret);

  if (botInfo.secret) {
    savableBot.validateSecret(botInfo.secret);
  }
  return savableBot.save(botInfo.secret).catch();
}

/** Removes a bot from bots.json (doesn't delete the bot file) */
export async function removeBotFromList(botPath: string): Promise<void> {
  const state = store.getState();
  const bots = [...state.bot.botFiles].filter(bot => bot.path !== botPath);
  store.dispatch(BotActions.load(bots));
  const { Commands } = SharedConstants;
  await mainWindow.commandService.remoteCall(Commands.Bot.SyncBotList, bots).catch();
}

export function getTranscriptsPath(activeBot, conversation): string {
  if (conversation.mode === 'livechat-url') {
    return path.join(electron.app.getPath('downloads'), './transcripts');
  }

  if (activeBot) {
    const dirName = path.dirname(activeBot.path);
    return path.join(dirName, './transcripts');
  }

  return '/';
}
