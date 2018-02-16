import { Channel } from './channel';
import { IDisposable, Disposable } from '../../base/lifecycle/disposable';
import { ISender } from './sender';

export abstract class BaseIPC extends Disposable implements ISender {
  private _channels: { [id: string]: Channel } = {};

  registerChannel(channel: Channel): IDisposable {
    if (!channel) throw new Error("channel cannot be null");
    this._channels[channel.name] = channel;
    return {
      dispose() {
        delete this._channels[channel.name];
      }
    }
  }

  getChannel(name: string): Channel {
    return this._channels[name];
  }

  abstract send(...args: any[]): void;
}
