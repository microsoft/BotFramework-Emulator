import { Store } from 'redux';
import { BrowserWindow, WebContents } from "electron";
import { ICommandService } from "botframework-emulator-shared/built/platform/commands";
import { CommandService } from "../commands/commandService";
import { ILogService } from "botframework-emulator-shared/built/platform/log";
import { LogService } from "../log/logService";
import { IPC, IPCServer } from "../../ipc";
import { Disposable } from "botframework-emulator-shared/built/base/lifecycle/disposable";
import createStore from '../../data-v2/createStore';
import { IState } from '../../data-v2/state';


export class Window extends Disposable {
  private _commandService: ICommandService;
  private _logService: ILogService;
  private _ipc: IPC;
  private _store: Store<IState>;

  get browserWindow(): BrowserWindow { return this._browserWindow; }
  get webContents(): WebContents { return this._browserWindow.webContents; }
  get commandService(): ICommandService { return this._commandService; }
  get logService(): ILogService { return this._logService; }
  get ipc(): IPC { return this._ipc; }
  get store(): Store<IState> { return this._store; }

  constructor(private _browserWindow: BrowserWindow) {
    super();
    createStore(this._browserWindow).then(store => this._store = store);
    this._ipc = new IPC(this._browserWindow.webContents);
    let commandService = this._commandService = new CommandService(this);
    let logService = this._logService = new LogService(this);
    this.toDispose(IPCServer.registerIPC(this._ipc));
    this.toDispose(commandService);
    this.toDispose(logService);
  }
}
