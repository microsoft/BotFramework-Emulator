import store from './store';
import { IBotInfo } from '@bfemulator/app-shared';
import { IBotConfig } from '@bfemulator/sdk-shared';

export function getActiveBot(): IBotConfig {
  return store.getState().bot.activeBot;
}

export function getBotInfoByPath(path: string): IBotInfo {
  const state = store.getState();
  return state.bot.botFiles.find(bot => bot && bot.path === path);
}

export function pathExistsInRecentBots(path: string): boolean {
  const state = store.getState();
  return state.bot.botFiles.some(bot => bot && bot.path === path);
}