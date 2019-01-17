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

import { IPC, isObject } from '@bfemulator/sdk-shared';
import * as WebSocket from 'ws';

export class WebSocketIPC extends IPC {
  private _ws: WebSocket;
  private _id: number;

  get ws(): WebSocket {
    return this._ws;
  }

  get id(): number {
    return this._id;
  }
  set id(value: number) {
    this._id = value;
  }

  constructor(arg: WebSocket | string = 'http://localhost:9091') {
    super();
    if (typeof arg === 'string') {
      this._ws = new WebSocket(arg, { perMessageDeflate: false });
    } else if (arg instanceof WebSocket) {
      this._ws = arg;
    }
    this._ws.on('message', s => {
      const message = JSON.parse(s as string);
      if (
        isObject(message) &&
        message.type === 'ipc:message' &&
        Array.isArray(message.args)
      ) {
        const channelName = message.args.shift();
        const channel = super.getChannel(channelName);
        if (channel) {
          channel.onMessage(...message.args);
        }
      }
    });
  }

  public send(...args: any[]): void {
    const message = {
      type: 'ipc:message',
      args,
    };
    const s = JSON.stringify(message);
    this._ws.send(s);
  }
}

export abstract class WebSocketServer {
  public _on: (ws: WebSocket) => void;
  private _wss: WebSocket.Server;

  constructor(port: number = 9091) {
    this._wss = new WebSocket.Server({ port });
    this._wss.on('connection', ws => {
      this.onConnection(ws);
    });
  }

  public abstract onConnection(ws: WebSocket): void;
}
