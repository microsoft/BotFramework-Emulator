import { Store } from 'redux';
import { BrowserWindow, WebContents } from 'electron';
import { ILogService } from '@bfemulator/app-shared';
import { Disposable } from '@bfemulator/sdk-shared';
import { ICommandService, CommandService } from '@bfemulator/sdk-shared';
import { LogService } from '../log/logService';
import { ElectronIPC, ElectronIPCServer } from '../../ipc';
import createStore from '../../data-v2/createStore';
import { IState } from '../../data-v2/state';
import { CommandRegistry } from '../../commands';

export class Window extends Disposable {
  private _commandService: ICommandService;
  private _logService: ILogService;
  private _ipc: ElectronIPC;
  private _store: Store<IState>;

  get browserWindow(): BrowserWindow { return this._browserWindow; }
  get webContents(): WebContents { return this._browserWindow.webContents; }
  get commandService(): ICommandService { return this._commandService; }
  get logService(): ILogService { return this._logService; }
  get ipc(): ElectronIPC { return this._ipc; }
  get store(): Store<IState> { return this._store; }

  constructor(private _browserWindow: BrowserWindow) {
    super();
    this._ipc = new ElectronIPC(this._browserWindow.webContents);
    let commandService = this._commandService = new CommandService(this._ipc, 'command-service', CommandRegistry);
    let logService = this._logService = new LogService(this);
    super.toDispose(ElectronIPCServer.registerIPC(this._ipc));
    super.toDispose(commandService);
    super.toDispose(logService);
  }

  initStore(): Promise<Store<IState>> {
    return new Promise((resolve, reject) => {
      createStore(this._browserWindow).then(store => {
        this._store = store;
        resolve(this.store);
      });
    });
  }
}
