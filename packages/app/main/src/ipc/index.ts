import { ipcMain, WebContents, Event } from 'electron';
import { BaseIPC } from "botframework-emulator-shared/built/platform/ipc";
import { IDisposable } from 'botframework-emulator-shared/built/base/lifecycle/disposable';

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
    const channel = this.getChannel(channelName);
    if (channel) {
      const result = channel.onMessage(...args);
      if (result) {
        // Asynchronous response
        channel.send(result);
        // Synchronous response
        //event.returnValue = result;
      }
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
