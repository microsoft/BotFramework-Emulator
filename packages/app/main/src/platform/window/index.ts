import { BrowserWindow, WebContents } from "electron";
import { CommandService } from "../commands/commandService";
import { IPC, IPCServer } from "../../ipc";
import { Disposable } from "botframework-emulator-shared/built/base/lifecycle/disposable";


export class Window extends Disposable {
  private _commandService: CommandService;
  private _ipc: IPC;

  get browserWindow(): BrowserWindow { return this._browserWindow; }
  get webContents(): WebContents { return this._browserWindow.webContents; }
  get commandService(): CommandService { return this._commandService; }
  get ipc(): IPC { return this._ipc; }

  constructor(private _browserWindow: BrowserWindow) {
    super();
    this._ipc = new IPC(this._browserWindow.webContents);
    this.toDispose(IPCServer.registerIPC(this._ipc));
    this._commandService = new CommandService(this);
    this.toDispose(this._commandService);
  }
}
