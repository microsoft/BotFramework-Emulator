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

import { CommandRegistry, CommandRegistryImpl } from '..';

import { Channel, IPC } from '../ipc';
import { Disposable, DisposableImpl } from '../lifecycle';
import { uniqueId } from '../utils';

export interface CommandService extends DisposableImpl {
  registry: CommandRegistry;

  call(commandName: string, ...args: any[]): Promise<any>;

  remoteCall(commandName: string, ...args: any[]): Promise<any>;

  on(commandName: string, handler?: Function): Disposable;

  on(event: 'command-not-found', notFoundHandler?: (commandName: string, ...args: any[]) => any);
}

export class CommandServiceImpl extends DisposableImpl implements CommandService {
  private readonly channel: Channel;
  private readonly _registry: CommandRegistry;
  private readonly channelName: string;
  private readonly ipc: IPC;
  private notFoundHandler: (commandName: string, ...args: any[]) => any;

  public get registry() {
    return this._registry;
  }

  constructor(
    ipc: IPC,
    channelName: string = 'command-service',
    registry: CommandRegistry = new CommandRegistryImpl()
  ) {
    super();

    this.ipc = ipc;
    this.channelName = channelName;
    this._registry = registry;
    this.channel = new Channel(this.channelName, this.ipc);
    this.toDispose(this.ipc.registerChannel(this.channel));
    this.toDispose(
      this.channel.setListener('call', async (commandName: string, transactionId: string, ...args: any[]) => {
        try {
          let result = await this.call<any>(commandName, ...args);
          result = Array.isArray(result) ? result : [result];
          this.channel.send(transactionId, true, ...result);
        } catch (err) {
          err = err.message ? err.message : err;
          this.channel.send(transactionId, false, err);
        }
      })
    );
  }

  public on(event: string, handler: Function): Disposable;
  public on(event: 'command-not-found', handler: (commandName: string, ...args: any[]) => any) {
    if (event === 'command-not-found') {
      this.notFoundHandler = handler;
      return undefined;
    } else {
      return this.registry.registerCommand(event, handler);
    }
  }

  public async call<T>(commandName: string, ...args: any[]): Promise<T | Error> {
    const command = this.registry.getCommand(commandName);
    try {
      if (!command) {
        if (this.notFoundHandler) {
          return this.notFoundHandler(commandName, ...args);
        } else {
          return new Error(`Command '${commandName}' not found`);
        }
      } else {
        return command(...args) as T;
      }
    } catch (err) {
      return err;
    }
  }

  public async remoteCall<T>(commandName: string, ...args: any[]): Promise<T | Error> {
    const transactionId = uniqueId();
    this.channel.send('call', commandName, transactionId, ...args);
    return new Promise<any>((resolve, reject) => {
      this.channel.setListener(transactionId, (success: boolean, ...responseArgs: any[]) => {
        this.channel.clearListener(transactionId);
        if (success) {
          const result = responseArgs.length ? responseArgs.shift() : undefined;
          resolve(result);
        } else {
          reject(responseArgs.shift());
        }
      });
    });
  }
}
