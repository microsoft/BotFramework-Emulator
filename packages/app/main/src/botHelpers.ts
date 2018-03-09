
import { IBot, IBotInfo } from '@bfemulator/app-shared';
import { mainWindow } from './main';

export function getActiveBot(): IBot {
  const state = mainWindow.store.getState();
  return state.bot.activeBot;
}

export function getBotInfoById(id: string): IBotInfo {
  const state = mainWindow.store.getState();
  return state.bot.botFiles.find(bot => bot.id === id);
}
