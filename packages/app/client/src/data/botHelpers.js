import store from './store';

export function getActiveBot() {
  return store.getState().bot.activeBot;
}

export function getBotById(id) {
  return store.getState().bot.bots.filter(bot => bot.id === id).shift();
}
