
import { IBot } from '@bfemulator/app-shared';
import { mainWindow } from './main';

export function getActiveBot(): IBot {
  const state = mainWindow.store.getState();
  const id = state.bot.activeBot;
  return getBotById(id);
}

export function getBotById(id: string): IBot {
  const state = mainWindow.store.getState();
  return state.bot.bots.filter(bot => bot.id === id).shift();
}
