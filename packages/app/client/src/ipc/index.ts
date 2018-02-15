const electron = window['require']('electron');
const ipcRenderer = electron.ipcRenderer;

import { BaseIPC } from "botframework-emulator-shared/built/platform/ipc";

export const IPC = new class extends BaseIPC {
  constructor() {
    super();
    ipcRenderer.on('ipc:message', (sender: any, ...args: any[]) => {
      const channelName = args.shift();
      const channel = this.getChannel(channelName);
      if (channel) {
        channel.onMessage(...args);
      }
    });
  }

  send(...args: any[]): void {
    ipcRenderer.send('ipc:message', ...args);
  }
}
