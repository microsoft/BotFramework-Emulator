const electron = window['require']('electron');

import { IPC, Channel, IDisposable } from '@bfemulator/sdk-shared';

export const ElectronIPC = new class extends IPC {
  constructor() {
    super();
    electron.ipcRenderer.on('ipc:message', (sender: any, ...args: any[]) => {
      const channelName = args.shift();
      const channel = super.getChannel(channelName);
      if (channel) {
        channel.onMessage(...args);
      }
    });
  }

  send(...args: any[]): void {
    electron.ipcRenderer.send('ipc:message', ...args);
  }

  registerChannel(channel: Channel): IDisposable {
    return super.registerChannel(channel);
  }
}
