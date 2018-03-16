import store from './store';
import { IBot } from '@bfemulator/app-shared';

export function getActiveBot(): IBot {
  return store.getState().bot.activeBot;
}
