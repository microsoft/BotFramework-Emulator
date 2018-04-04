const { ipcRenderer, remote } = require('electron');

ipcRenderer.on('inspect', (sender, ...args) => {
  window.host.dispatchInspect(...args);
});

window.host = {
  inspectHandlers: [],

  on(event = 'inspect', handler) {
    this.inspectHandlers.push(handler);
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
  }
}
