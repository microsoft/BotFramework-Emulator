
import { BotConfig } from 'msbot';
import { IBotConfig, IBotInfo, ServiceType } from '@bfemulator/app-shared';
import { mainWindow } from './main';

export function getActiveBot(): IBotConfig {
  const state = mainWindow.store.getState();
  return state.bot.activeBot;
}

export function getBotInfoById(id: string): IBotInfo {
  const state = mainWindow.store.getState();
  return state.bot.botFiles.find(bot => bot && bot.id === id);
}

export function pathExistsInRecentBots(path: string): boolean {
  const state = mainWindow.store.getState();
  return state.bot.botFiles.some(bot => bot && bot.path === path);
}

/** Converts an IBotConfig to a BotConfig */
export function IBotConfigToBotConfig(bot: IBotConfig): BotConfig {
  const newBot: BotConfig = new BotConfig();
  newBot.description = bot.description;
  newBot.name = bot.name;
  newBot.services = bot.services;
  return newBot;
}

/** Encrypts a bot with its secret */
export function encryptBot(bot: BotConfig, secret: string): BotConfig {
  const botWithSecret = copyBotWithSecret(bot, secret);
  botWithSecret.services.forEach(service => {
    const propsThatShouldBeEncrypted = botWithSecret.getEncryptedProperties(getServiceType(service.type));
    propsThatShouldBeEncrypted.forEach(prop => {
      service[prop] = botWithSecret.encryptValue(service[prop]);
    });
  });
  return botWithSecret;
}

/** Decrypts a bot with its secret */
export function decryptBot(bot: BotConfig, secret: string): BotConfig {
  const botWithSecret = copyBotWithSecret(bot, secret);
  botWithSecret.services.forEach(service => {
    const propsThatShouldBeEncrypted = botWithSecret.getEncryptedProperties(getServiceType(service.type));
    propsThatShouldBeEncrypted.forEach(prop => {
      service[prop] = botWithSecret.decryptValue(service[prop]);
    });
  });
  return botWithSecret;
}

/** If we have a bot and its secret separated, this function joins them together */
export function copyBotWithSecret(bot: BotConfig, secret: string): BotConfig {
  let copy: BotConfig = new BotConfig(secret);
  copy.description = bot.description;
  copy.name = bot.name;
  copy.services = bot.services;

  return copy;
}

// for some reason, ServiceType[service.type] returns undefined ?
/** Hacky work-around to broken enum type look-ups */
function getServiceType(type: string): ServiceType {
  switch (type) {
    case 'endpoint':
      return ServiceType.Endpoint

    case 'abs':
      return ServiceType.AzureBotService

    case 'luis':
      return ServiceType.Luis

    case 'qna':
      return ServiceType.QnA

    case 'dispatch':
      return ServiceType.Dispatch

    default:
      return null;
  }
}
