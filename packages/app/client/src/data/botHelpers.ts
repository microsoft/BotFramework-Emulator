import store from './store';
import { IBotInfo } from '@bfemulator/app-shared';
import { IBotConfig } from '@bfemulator/sdk-shared';

export function getActiveBot(): IBotConfig {
  return store.getState().bot.activeBot;
}

export function getBotInfoById(id: string): IBotInfo {
  const state = store.getState();
  return state.bot.botFiles.find(bot => bot && bot.id === id);
}
