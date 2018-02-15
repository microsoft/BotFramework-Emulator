import { Store } from 'redux';
import { BrowserWindow, WebContents } from "electron";
import { CommandService } from "../commands/commandService";
import { IPC, IPCServer } from "../../ipc";
import { Disposable } from "botframework-emulator-shared/built/base/lifecycle/disposable";
import createStore from '../../data-v2/createStore';
import { IState } from '../../data-v2/state';


export class Window extends Disposable {
  private _commandService: CommandService;
  private _ipc: IPC;
  private _store: Store<IState>;

  get browserWindow(): BrowserWindow { return this._browserWindow; }
  get webContents(): WebContents { return this._browserWindow.webContents; }
  get commandService(): CommandService { return this._commandService; }
  get ipc(): IPC { return this._ipc; }
  get store(): Store<IState> { return this._store; }

  constructor(private _browserWindow: BrowserWindow) {
    super();
    createStore(this._browserWindow).then(store => this._store = store);
    this._ipc = new IPC(this._browserWindow.webContents);
    this.toDispose(IPCServer.registerIPC(this._ipc));
    this._commandService = new CommandService(this);
    this.toDispose(this._commandService);
  }
}
