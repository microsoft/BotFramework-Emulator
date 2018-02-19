
import { IBot } from 'botframework-emulator-shared/built/types/botTypes';
import { mainWindow } from './main';

export function getActiveBot(): IBot {
  const state = mainWindow.store.getState();
  const botId = state.bot.activeBot;
  return getBotById(botId);
}

export function getBotById(botId: string): IBot {
  const state = mainWindow.store.getState();
  return state.bot.bots.filter(bot => bot.botId === botId).shift();
}
