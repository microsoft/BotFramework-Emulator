import { uniqueId, Disposable, ICommandService, Channel, CommandService as InternalSharedService, ICommandHandler, IDisposable } from '@bfemulator/sdk-shared';
import { ElectronIPC } from '../../ipc';
import { CommandRegistry } from '../../commands';

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
}
