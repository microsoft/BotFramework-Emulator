import store from './store';

export function getActiveBot() {
  return store.getState().bot.activeBot;
}

export function getBotById(botId) {
  return store.getState().bot.bots.filter(bot => bot.botId === botId).shift();
}
