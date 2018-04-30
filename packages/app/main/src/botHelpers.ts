
import { BotConfig } from 'msbot';

import { IBotInfo, getBotDisplayName } from '@bfemulator/app-shared';
import { IBotConfig } from '@bfemulator/sdk-shared';
import { mainWindow } from './main';
import * as BotActions from './data-v2/action/bot';

export function getActiveBot(): IBotConfig {
  const state = mainWindow && mainWindow.store.getState();
  return state && state.bot.activeBot;
}

export function getBotInfoByPath(path: string): IBotInfo {
  const state = mainWindow.store.getState();
  return state.bot.botFiles.find(bot => bot && bot.path === path);
}

export function pathExistsInRecentBots(path: string): boolean {
  const state = mainWindow.store.getState();
  return state.bot.botFiles.some(bot => bot && bot.path === path);
}

/** Will attempt to load the bot, using the secret if specified.
 *
 *  If the bot is encrypted and the secret is invalid or missing,
 *  then the user will be prompted with a dialog allowing him / her
 *  to keep retrying until the correct secret is entered or the popup
 *  is dismissed.
 */
export async function loadBotWithRetry(botPath: string, secret?: string): Promise<IBotConfig> {
  try {
    // load the bot and transform it into internal IBotConfig implementation
    let bot: IBotConfig = await BotConfig.Load(botPath, secret);
    bot = cloneBot(bot);
    bot.path = botPath;

    if (pathExistsInRecentBots(botPath)) {
      // Bot was either decrypted on first try, or we used a new secret
      // entered via the secret prompt dialog. In the latter case, we should
      // update the secret for the bot that we have on record with the correct secret.
      const botInfo = getBotInfoByPath(botPath);
      if (botInfo.secret && botInfo.secret !== secret) {
        // update the secret in bots.json with the valid secret
        const updatedBot = { ...botInfo, secret };
        await patchBotsJson(botPath, updatedBot);
      }
    } else {
      // bot does not have an entry in recent bots so create one
      const botInfo: IBotInfo = {
        path: botPath,
        displayName: getBotDisplayName(bot),
        secret
      };
      await patchBotsJson(botPath, botInfo);
    }

    return bot;
  } catch (e) {
    // TODO: Only prompt for password if we know for a fact we need it. Lots of different errors can arrive here, like ENOENT, if the file wasn't found.
    // Add easily discernable errors / error codes to msbot package
    if (typeof e === 'string' && (e.includes('secret') || e.includes('crypt'))) {
      // bot requires a secret to decrypt properties
      const newSecret = await mainWindow.commandService.remoteCall('secret-prompt:show');
      if (newSecret === null)
        // pop-up was dismissed; stop trying to prompt for secret
        return null;
      // try again with new secret
      return await loadBotWithRetry(botPath, newSecret);
    } else {
      throw e;
    }
  }
}

/** Converts an IBotConfig to a BotConfig */
export function toSavableBot(bot: IBotConfig, secret?: string): BotConfig {
  const botCopy = cloneBot(bot);
  const newBot: BotConfig = new BotConfig(secret);

  // copy everything over but the internal id
  newBot.description = botCopy.description;
  newBot.name = botCopy.name;
  newBot.services = botCopy.services;
  return newBot;
}

/** Clones a bot */
export function cloneBot(bot: IBotConfig): IBotConfig {
  return JSON.parse(JSON.stringify(bot));
}

/** Patches a bot record in bots.json, and updates the list
 *  in the store and on disk.
 */
export async function patchBotsJson(botPath: string, bot: IBotInfo): Promise<IBotInfo[]> {
  const state = mainWindow.store.getState();
  const bots = [...state.bot.botFiles];
  const botIndex = bots.findIndex(bot => bot.path === botPath);
  if (botIndex > -1) {
    bots[botIndex] = { ...bots[botIndex], ...bot };
  } else {
    bots.unshift(bot);
  }

  mainWindow.store.dispatch(BotActions.load(bots));
  await mainWindow.commandService.remoteCall('bot:list:sync', bots);

  return bots;
}

/** Saves a bot to disk */
export async function saveBot(bot: IBotConfig): Promise<void> {
  const botInfo = getBotInfoByPath(bot.path) || {};

  const saveableBot = toSavableBot(bot, botInfo.secret);

  if (botInfo.secret)
    saveableBot.validateSecretKey();
  return await saveableBot.save(bot.path);
}
