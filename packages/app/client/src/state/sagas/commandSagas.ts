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
import { ForkEffect, put, takeEvery } from 'redux-saga/effects';
import { CommandServiceImpl, CommandServiceInstance } from '@bfemulator/sdk-shared';
import {
  beginAdd,
  newNotification,
  CommandAction,
  CommandActionPayload,
  EXECUTE_COMMAND,
} from '@bfemulator/app-shared';

export class CommandSagas {
  @CommandServiceInstance()
  private static commandService: CommandServiceImpl;

  public static *executeCommand(action: CommandAction<CommandActionPayload>): IterableIterator<any> {
    const { isRemote, commandName, args, resolver } = action.payload;
    try {
      const result = isRemote
        ? yield CommandSagas.commandService.remoteCall(commandName, ...args)
        : yield CommandSagas.commandService.call(commandName, ...args);
      if (resolver) {
        resolver(result);
      }
    } catch (e) {
      const type = isRemote ? 'remote' : 'local';
      yield put(
        beginAdd(newNotification(`An error occurred while executing the ${type} command: ${commandName}\n ${e}`))
      );
    }
  }
}

export function* commandSagas(): IterableIterator<ForkEffect> {
  yield takeEvery(EXECUTE_COMMAND, CommandSagas.executeCommand);
}
