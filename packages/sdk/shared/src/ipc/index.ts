export * from './channel';
export * from './sender';

import { Disposable, IDisposable } from '../lifecycle';
import { Channel } from './channel';
import { ISender } from './sender';

export abstract class IPC extends Disposable implements ISender {
  private _channels: { [id: string]: Channel } = {};

  abstract get id(): number;

  registerChannel(channel: Channel): IDisposable {
    if (!channel)
      throw new Error("channel cannot be null");
    if (this._channels[channel.name])
      throw new Error(`channel ${channel.name} already exists`);
    this._channels[channel.name] = channel;
    return {
      dispose: () => {
        delete this._channels[channel.name];
      }
    }
  }

  getChannel(name: string): Channel {
    return this._channels[name];
  }

  abstract send(...args: any[]): void;
}

export class NoopIPC extends IPC {
  constructor(private _id: number) {
    super();
  }
  get id(): number { return this._id; }
  send(...args: any[]): void { }
}
