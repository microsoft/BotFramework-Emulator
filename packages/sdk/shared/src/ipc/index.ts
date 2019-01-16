//
// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license.
//
// Microsoft Bot Framework: http://botframework.com
//
// Bot Framework Emulator Github:
// https://github.com/Microsoft/BotFramwork-Emulator
//
// Copyright (c) Microsoft Corporation
// All rights reserved.
//
// MIT License:
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//

import { Disposable, DisposableImpl } from '../lifecycle';

import { Channel } from './channel';
import { Sender } from './sender';

export * from './channel';
export * from './sender';

export abstract class IPC extends DisposableImpl implements Sender {
  protected _channels: { [id: string]: Channel } = {};

  public id: number;

  public registerChannel(channel: Channel): Disposable {
    if (!channel) {
      throw new Error('channel cannot be null');
    }
    if (this._channels[channel.name]) {
      throw new Error(`channel ${channel.name} already exists`);
    }
    this._channels[channel.name] = channel;
    return {
      dispose: () => {
        delete this._channels[channel.name];
      },
    };
  }

  public getChannel(name: string): Channel {
    return this._channels[name];
  }

  public abstract send(...args: any[]): void;
}

// eslint does not support abstract classes
// eslint-disable-next-line no-undef
export class NoopIPC extends IPC {
  constructor(private _id: number) {
    super();
  }

  get id(): number {
    return this._id;
  }

  public send(...args: any[]): void {
    return null;
  }
}
