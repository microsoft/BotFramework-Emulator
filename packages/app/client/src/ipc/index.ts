const electron = window['require']('electron');
const ipcRenderer = electron.ipcRenderer;

import { BaseIPC, Channel, IDisposable } from '@bfemulator/app-shared';

export const IPC = new class extends BaseIPC {
  constructor() {
    super();
    ipcRenderer.on('ipc:message', (sender: any, ...args: any[]) => {
      const channelName = args.shift();
      const channel = super.getChannel(channelName);
      if (channel) {
        channel.onMessage(...args);
      }
    });
  }

  send(...args: any[]): void {
    ipcRenderer.send('ipc:message', ...args);
  }

  registerChannel(channel: Channel): IDisposable {
    return super.registerChannel(channel);
  }
}
