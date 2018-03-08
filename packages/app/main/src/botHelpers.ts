
import { IBot } from '@bfemulator/app-shared';
import { mainWindow } from './main';

export function getActiveBot(): IBot {
  const state = mainWindow.store.getState();
  return state.bot.activeBot;
}
