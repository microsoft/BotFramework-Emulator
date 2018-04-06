import { IPC, isObject } from '@bfemulator/sdk-shared';

export interface IProcess {
  pid: number;
  send?(message: any);
  on(event: 'message', listener: NodeJS.MessageListener);
  on(event: 'exit', listener: NodeJS.ExitListener);
}

export class ProcessIPC extends IPC {
  get id(): number { return this._process.pid; }

  constructor(private _process: IProcess) {
    super();
    this._process.on('message', message => {
      if (isObject(message) && message.type === 'ipc:message' && Array.isArray(message.args)) {
        const channelName = message.args.shift();
        const channel = super.getChannel(channelName);
        if (channel) {
          channel.onMessage(...message.args);
        }
      }
    });
  }

  send(...args: any[]): void {
    if (this._process.send) {
      this._process.send({
        type: 'ipc:message',
        args
      });
    }
  }
}
