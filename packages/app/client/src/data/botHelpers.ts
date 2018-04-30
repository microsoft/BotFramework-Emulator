import { IBotInfo } from '@bfemulator/app-shared';
import { IBotConfigWithPath } from '@bfemulator/sdk-shared';
import store from './store';

export function getActiveBot(): IBotConfigWithPath {
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
