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

import { IPC, isObject } from "@bfemulator/sdk-shared";

export interface Process {
  pid: number;
  send?(message: any);
  on(event: "message", listener: NodeJS.MessageListener);
  on(event: "exit", listener: NodeJS.ExitListener);
}

export class ProcessIPC extends IPC {
  get id(): number {
    return this._process.pid;
  }

  constructor(private _process: Process) {
    super();
    this._process.on("message", message => {
      if (
        isObject(message) &&
        message.type === "ipc:message" &&
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
    if (this._process.send) {
      this._process.send({
        type: "ipc:message",
        args
      });
    }
  }
}
