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

import { EventEmitter } from 'events';

import { uniqueId } from '../utils';
import { CommandRegistry, CommandRegistryImpl } from '..';

interface Sender {
  send(channel: string, ...args: any[]): void;
}

export class CommandServiceImpl {
  public readonly registry: CommandRegistry;
  private readonly ipcListener: EventEmitter;
  private ipcSender: Sender;

  private notFoundHandler: (commandName: string, ...args: any[]) => any;

  constructor(ipcListener: EventEmitter, channelName = 'command-service', registry = new CommandRegistryImpl()) {
    this.ipcListener = ipcListener;
    this.ipcSender = 'send' in ipcListener ? (ipcListener as Sender) : null;
    this.registry = registry;
    this.initializeListeners();
  }

  public on(event: string, handler: (commandName: string, ...args: any[]) => any) {
    if (event === 'command-not-found') {
      this.notFoundHandler = handler;
      return undefined;
    } else {
      return this.registry.registerCommand(event, handler);
    }
  }

  public async call<T>(commandName: string, ...args: any[]): Promise<T | Error> {
    const command = this.registry.getCommand(commandName);
    if (!command) {
      if (this.notFoundHandler) {
        return this.notFoundHandler(commandName, ...args);
      } else {
        throw new Error(`Command '${commandName}' not found`);
      }
    } else {
      return (await command(...args)) as T;
    }
  }

  public async remoteCall<T>(commandName: string, ...args: any[]): Promise<T> {
    const transactionId = uniqueId();
    return new Promise<T>((resolve, reject) => {
      // Wait for the response
      this.ipcListener.once(transactionId, (event: Event, ...args) => {
        const [success, ...responseArgs] = args;
        if (success) {
          const result = responseArgs.length ? responseArgs.shift() : undefined;
          resolve(result);
        } else {
          reject(responseArgs.shift());
        }
      });
      if (this.ipcSender) {
        this.ipcSender.send('remote-call', commandName, transactionId, ...args);
      }
    });
  }

  protected onIpcMessage = async (event: Event, commandName: string, transactionId: string, ...args: any[]) => {
    try {
      let result = await this.call<any>(commandName, ...args);
      result = Array.isArray(result) ? result : [result];
      this.ipcSender.send(transactionId, true, ...result);
    } catch (err) {
      const message = err.message ? err.message : err;
      this.ipcSender.send(transactionId, false, message);
    }
  };

  private initializeListeners() {
    this.ipcListener.on('remote-call', this.onIpcMessage);
    if (process.type === 'browser' && !this.ipcSender) {
      // We're in main and need the ipcSender from the
      // render process.
      this.ipcListener.once('ping', event => {
        this.ipcSender = event.sender;
      });
    } else {
      // this is the render process and the main
      // process needs our ipcSender
      this.ipcSender.send('ping');
    }
  }
}
