const { ipcRenderer, remote } = require('electron');

ipcRenderer.on('inspect', (sender, obj) => {
  window.host.dispatch('inspect', obj);
});

ipcRenderer.on('bot-updated', (sender, bot) => {
  window.host.bot = bot;
  window.host.dispatch('bot-updated', bot);
});

ipcRenderer.on('toggle-dev-tools', (sender) => {
  remote.getCurrentWebContents().toggleDevTools();
});

ipcRenderer.on('accessory-click', (sender, id) => {
  window.host.dispatch('accessory-click', id);
});

window.host = {
  handlers: {
    'inspect': [],
    'bot-updated': [],
    'accessory-click': []
  },
  bot: {},

  on(event, handler) {
    if (!this.handlers[event].includes(handler)) {
      this.handlers[event].push(handler);
    }
    return () => {
      this.handlers[event] = this.handlers[event].filter(item => item !== handler);
    }
  },

  send(...args) {
    ipcRenderer.sendToHost(...args);
  },

  dispatch(event, ...args) {
    this.handlers[event].forEach(handler => handler(...args));
  },
}
