import { ipcMain, WebContents, Event } from 'electron';
import { BaseIPC, IDisposable } from 'botframework-emulator-shared';

export class IPC extends BaseIPC {
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

export const IPCServer = new class {
  private _ipcs: { [id: number]: IPC } = {};

  constructor() {
    ipcMain.on('ipc:message', (event: Event, ...args) => {
      const ipc = this._ipcs[event.sender.id];
      if (ipc) {
        ipc.onMessage(event, ...args);
      }
    });
  }

  registerIPC(ipc: IPC): IDisposable {
    this._ipcs[ipc.id] = ipc;
    return {
      dispose() {
        delete this._ipcs[ipc.id];
      }
    }
  }
}
