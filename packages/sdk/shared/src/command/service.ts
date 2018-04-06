import { Disposable, IDisposable } from '../lifecycle/disposable';
import { Channel } from '../ipc/channel';
import { IPC } from '../ipc/index';
import { uniqueId } from '../utils';
import { ICommandRegistry, CommandRegistry } from '..';
import { ICommandHandler } from '.';


export interface ICommandService extends IDisposable {
  registry: ICommandRegistry;
  call(commandName: string, ...args: any[]): Promise<any>;
  remoteCall(commandName: string, ...args: any[]): Promise<any>;
  on(commandName: string, handler?: ICommandHandler): IDisposable;
  on(event: 'command-not-found', notFoundHandler?: (commandName: string, ...args: any[]) => any);
}

export class CommandService extends Disposable implements ICommandService {

  private _channel: Channel;
  private _notFoundHandler: (commandName: string, ...args: any[]) => any;

  public get registry() { return this._registry; }

  constructor(private _ipc: IPC, private _channelName: string = 'command-service', private _registry: ICommandRegistry = null) {
    super();
    this._registry = this._registry || new CommandRegistry();
    this._channel = new Channel(this._channelName, this._ipc);
    super.toDispose(
      this._ipc.registerChannel(this._channel));
    super.toDispose(
      this._channel.setListener('call', (commandName: string, transactionId: string, ...args: any[]) => {
        this.call(commandName, ...args)
          .then(result => {
            result = Array.isArray(result) ? result : [result];
            this._channel.send(transactionId, true, ...result);
          })
          .catch(err => {
            err = err.message ? err.message : err;
            this._channel.send(transactionId, false, err);
          })
      }));
  }

  on(event: string, handler?: ICommandHandler): IDisposable
  on(event: 'command-not-found', handler?: (commandName: string, ...args: any[]) => any) {
    if (event === 'command-not-found') {
      this._notFoundHandler = handler;
      return undefined;
    } else {
      return this.registry.registerCommand(event, handler);
    }
  }

  call(commandName: string, ...args: any[]): Promise<any> {
    const command = this._registry.getCommand(commandName);
    try {
      if (!command) {
        if (this._notFoundHandler) {
          const result = this._notFoundHandler(commandName, ...args);
          return Promise.resolve(result);
        } else {
          throw new Error(`Command '${commandName}' not found`);
        }
      } else {
        const result = command.handler(...args);
        return Promise.resolve(result);
      }
    } catch (err) {
      return Promise.reject(err);
    }
  }

  remoteCall(commandName: string, ...args: any[]): Promise<any> {
    const transactionId = uniqueId();
    this._channel.send('call', commandName, transactionId, ...args);
    return new Promise<any>((resolve, reject) => {
      this._channel.setListener(transactionId, (success: boolean, ...responseArgs: any[]) => {
        this._channel.clearListener(transactionId);
        if (success) {
          let result = responseArgs.length ? responseArgs.shift() : undefined;
          resolve(result);
        }
        else {
          reject(responseArgs.shift());
        }
      });
    });
  }
}
