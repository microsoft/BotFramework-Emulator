import {
  CommandService as InternalSharedService,
  Disposable,
  ICommandHandler,
  ICommandService,
  IDisposable
} from '@bfemulator/sdk-shared';
import { CommandRegistry } from '../../commands';
import { ElectronIPC } from '../../ipc';

export const CommandService = new class extends Disposable implements ICommandService {

  private _service: InternalSharedService;

  init() { }

  public get registry() { return this._service.registry; }

  constructor() {
    super();
    this._service = new InternalSharedService(ElectronIPC, 'command-service', CommandRegistry);
    super.toDispose(this._service);
  }

  call(commandName: string, ...args: any[]): Promise<any> {
    return this._service.call(commandName, ...args);
  }

  remoteCall(commandName: string, ...args: any[]): Promise<any> {
    return this._service.remoteCall(commandName, ...args);
  }

  on(event: string, handler?: ICommandHandler): IDisposable
  on(event: 'command-not-found', handler?: (commandName: string, ...args: any[]) => any) {
    return this._service.on(event, handler);
  }
};
