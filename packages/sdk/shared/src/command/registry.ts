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

import { Disposable } from "../lifecycle";

import { Command, CommandHandler, CommandMap } from "./";

export interface CommandRegistry {
  registerCommand(id: string, command: CommandHandler): Disposable;

  registerCommand(command: Command): Disposable;

  getCommand(id: string): Command;

  getCommands(): CommandMap;
}

export class CommandRegistryImpl implements CommandRegistry {
  private _commands: CommandMap = {};

  public registerCommand(
    idOrCommand: string | Command,
    handler?: CommandHandler
  ): Disposable {
    if (!idOrCommand) {
      throw new Error("invalid command");
    }

    if (typeof idOrCommand === "string") {
      if (!handler) {
        throw new Error("invalid command");
      }
      return this.registerCommand({ id: idOrCommand, handler });
    }

    const { id } = idOrCommand;

    this._commands[id] = idOrCommand;

    return {
      dispose: () => delete this._commands[id]
    };
  }

  public getCommand(id: string): Command {
    return this._commands[id];
  }

  public getCommands(): CommandMap {
    return this._commands;
  }
}
