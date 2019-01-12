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

import { Disposable, IPC } from "@bfemulator/sdk-shared";
import { Event, ipcMain, WebContents } from "electron";

export class ElectronIPC extends IPC {
  private _webContents: WebContents;
  get webContents(): WebContents {
    return this._webContents;
  }

  constructor(webContents: WebContents) {
    super();
    this._webContents = webContents;
  }

  public send(...args: any[]): void {
    this._webContents.send("ipc:message", ...args);
  }

  public onMessage(event: Event, ...args: any[]): void {
    const channelName = args.shift();
    const channel = super.getChannel(channelName);
    if (channel) {
      channel.onMessage(...args);
    }
  }
}

export const ElectronIPCServer = new class {
  private _ipcs: WeakMap<WebContents, ElectronIPC> = new WeakMap<
    WebContents,
    ElectronIPC
  >();
  private initialized = false;

  public registerIPC(ipc: ElectronIPC): Disposable {
    this._ipcs.set(ipc.webContents, ipc);
    this.initialize();
    return {
      dispose: () => {
        this._ipcs.delete(ipc.webContents);
      }
    };
  }

  private initialize(): void {
    if (this.initialized) {
      return;
    }
    ipcMain.on("ipc:message", (event: Event, ...args) => {
      const ipc = this._ipcs.get(event.sender);
      if (ipc) {
        ipc.onMessage(event, ...args);
      }
    });
    this.initialized = true;
  }
}();
