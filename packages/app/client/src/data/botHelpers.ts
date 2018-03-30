import store from './store';
import { IBot, IBotInfo } from '@bfemulator/app-shared';

export function getActiveBot(): IBot {
  return store.getState().bot.activeBot;
}

export function getBotInfoById(id: string): IBotInfo {
  const state = store.getState();
  return state.bot.botFiles.find(bot => bot && bot.id === id);
}
