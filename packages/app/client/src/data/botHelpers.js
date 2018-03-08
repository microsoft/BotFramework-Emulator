import store from './store';

export function getActiveBot() {
  return store.getState().bot.activeBot;
}
