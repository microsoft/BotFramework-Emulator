const { ipcRenderer, remote } = require('electron');

ipcRenderer.on('inspect', (sender, ...args) => {
  window.host.dispatchInspect(...args);
});

ipcRenderer.on('bot-updated', (sender, bot) => {
  window.host.bot = bot;
  window.host.dispatchBotUpdated(bot);
});

window.host = {
  inspectHandlers: [],
  botUpdatedHandlers: [],
  bot: {},

  on(event, handler) {
    if (event === 'inspect')
      this.inspectHandlers.push(handler);
    else if (event === 'bot-updated')
      this.botUpdatedHandlers.push(handler);
  },

  send(...args) {
    ipcRenderer.sendToHost(...args);
  },

  openDevTools() {
    remote.getCurrentWebContents().openDevTools();
  },

  dispatchInspect(...args) {
    for (i = 0; i < this.inspectHandlers.length; ++i) {
      this.inspectHandlers[i](...args);
    }
  },

  dispatchBotUpdated(bot) {
    for (i = 0; i < this.botUpdatedHandlers.length; ++i) {
      this.botUpdatedHandlers[i](bot);
    }
  }
}
