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

import ILogService from "@bfemulator/emulator-core/lib/types/log/service";
import {
  CommandService,
  CommandServiceImpl,
  DisposableImpl
} from "@bfemulator/sdk-shared";
import { BrowserWindow, WebContents } from "electron";

import { CommandRegistry } from "../../commands";
import { ElectronIPC, ElectronIPCServer } from "../../ipc";
import { LogService } from "../log/logService";

export class Window extends DisposableImpl {
  private readonly _commandService: CommandService;
  private readonly _logService: ILogService;
  private readonly _ipc: ElectronIPC;

  get browserWindow(): BrowserWindow {
    return this._browserWindow;
  }

  get webContents(): WebContents {
    return this._browserWindow.webContents;
  }

  get commandService(): CommandService {
    return this._commandService;
  }

  get logService(): ILogService {
    return this._logService;
  }

  get ipc(): ElectronIPC {
    return this._ipc;
  }

  constructor(private _browserWindow: BrowserWindow) {
    super();
    this._ipc = new ElectronIPC(this._browserWindow.webContents);
    const commandService = (this._commandService = new CommandServiceImpl(
      this._ipc,
      "command-service",
      CommandRegistry
    ));
    const logService = (this._logService = new LogService(this));
    super.toDispose(ElectronIPCServer.registerIPC(this._ipc));
    super.toDispose(commandService);
    super.toDispose(logService);
  }
}
