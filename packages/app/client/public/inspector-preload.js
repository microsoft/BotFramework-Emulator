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
    if (handler && Array.isArray(this.handlers[event]) && !this.handlers[event].includes(handler)) {
      this.handlers[event].push(handler);
    }
    return () => {
      this.handlers[event] = this.handlers[event].filter(item => item !== handler);
    }
  },

  enableAccessory(id, enabled) {
    if (typeof id === 'string') {
      ipcRenderer.sendToHost('enable-accessory', id, !!enabled);
    }
  },

  setAccessoryState(id, state) {
    if (typeof id === 'string' && typeof state === 'string') {
      ipcRenderer.sendToHost('set-accessory-state', id, state);
    }
  },

  setInspectorTitle(title) {
    if (typeof title === 'string') {
      ipcRenderer.sendToHost('set-inspector-title', title);
    }
  },

  dispatch(event, ...args) {
    this.handlers[event].forEach(handler => handler(...args));
  },
}
