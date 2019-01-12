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

import {
  CommandHandler,
  CommandService,
  CommandServiceImpl as InternalSharedService,
  Disposable,
  DisposableImpl
} from "@bfemulator/sdk-shared";

import { CommandRegistry } from "../../commands";
import { ElectronIPC } from "../../ipc";

export const CommandServiceImpl = new class extends DisposableImpl
  implements CommandService {
  private readonly _service: InternalSharedService;

  public init() {
    return null;
  }

  public get registry() {
    return this._service.registry;
  }

  constructor() {
    super();
    this._service = new InternalSharedService(
      ElectronIPC,
      "command-service",
      CommandRegistry
    );
    super.toDispose(this._service);
  }

  public call(commandName: string, ...args: any[]): Promise<any> {
    return this._service.call(commandName, ...args);
  }

  public remoteCall(commandName: string, ...args: any[]): Promise<any> {
    return this._service.remoteCall(commandName, ...args);
  }

  public on(event: string, handler?: CommandHandler): Disposable;
  public on(
    event: "command-not-found",
    handler?: (commandName: string, ...args: any[]) => any
  ) {
    return this._service.on(event, handler);
  }
}();
