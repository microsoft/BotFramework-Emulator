import { uniqueId, Disposable, ICommandService, Channel, CommandService as InternalSharedService } from '@bfemulator/sdk-shared';
import { ElectronIPC } from '../../ipc';
import { CommandRegistry } from '../../commands';

export const CommandService = new class extends Disposable implements ICommandService {

  private _service: InternalSharedService;

  init() { }

  constructor() {
    super();
    this._service = new InternalSharedService(ElectronIPC, 'command-service', CommandRegistry);
    super.toDispose(this._service);
  }

  call<T = any>(commandName: string, ...args: any[]): Promise<T> {
    return this._service.call<T>(commandName, ...args);
  }

  remoteCall<T = any>(commandName: string, ...args: any[]): Promise<T> {
    return this._service.remoteCall<T>(commandName, ...args);
  }
}
