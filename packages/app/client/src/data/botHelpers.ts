import store from './store';
import { IBotConfig, IBotInfo } from '@bfemulator/app-shared';

export function getActiveBot(): IBotConfig {
  return store.getState().bot.activeBot;
}

export function getBotInfoById(id: string): IBotInfo {
  const state = store.getState();
  return state.bot.botFiles.find(bot => bot && bot.id === id);
}
