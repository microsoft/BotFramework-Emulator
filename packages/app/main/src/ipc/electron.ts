import { ipcMain, WebContents, Event } from 'electron';
import { IPC, IDisposable } from '@bfemulator/sdk-shared';

export class ElectronIPC extends IPC {
  get id(): number { return this._webContents.id; }

  constructor(private _webContents: WebContents) {
    super();
  }

  send(...args: any[]): void {
    this._webContents.send('ipc:message', ...args);
  }

  onMessage(event: Event, ...args: any[]): void {
    const channelName = args.shift();
    const channel = super.getChannel(channelName);
    if (channel) {
      channel.onMessage(...args);
    }
  }
}

export const ElectronIPCServer = new class {
  private _ipcs: { [id: number]: ElectronIPC } = {};

  constructor() {
    ipcMain.on('ipc:message', (event: Event, ...args) => {
      const ipc = this._ipcs[event.sender.id];
      if (ipc) {
        ipc.onMessage(event, ...args);
      }
    });
  }

  registerIPC(ipc: ElectronIPC): IDisposable {
    this._ipcs[ipc.id] = ipc;
    return {
      dispose() {
        delete this._ipcs[ipc.id];
      }
    }
  }
}
