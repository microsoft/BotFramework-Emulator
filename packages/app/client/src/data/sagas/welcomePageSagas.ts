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
import { BotInfo, newNotification, SharedConstants } from '@bfemulator/app-shared';
import { ForkEffect, put, takeEvery } from 'redux-saga/effects';

import { CommandServiceImpl } from '../../platform/commands/commandServiceImpl';
import { beginAdd } from '../action/notificationActions';
import { OPEN_CONTEXT_MENU_FOR_BOT, WelcomePageAction } from '../action/welcomePageActions';

function* openContextMenuForBot(action: WelcomePageAction<BotInfo>): IterableIterator<any> {
  const menuItems = [
    { label: 'Move...', id: 0 },
    { label: 'Open file location', id: 1 },
    { label: 'Forget this bot', id: 2 },
  ];

  const result = yield CommandServiceImpl.remoteCall(SharedConstants.Commands.Electron.DisplayContextMenu, menuItems);
  switch (result.id) {
    case 0:
      yield* moveBotToNewLocation(action.payload);
      break;

    case 1:
      yield CommandServiceImpl.remoteCall(SharedConstants.Commands.Electron.OpenFileLocation, action.payload.path);
      break;

    case 2:
      yield CommandServiceImpl.remoteCall(SharedConstants.Commands.Bot.RemoveFromBotList, action.payload.path);
      break;

    default:
      // Canceled context menu
      break;
  }
}

function* moveBotToNewLocation(bot: BotInfo): IterableIterator<any> {
  const newPath = yield CommandServiceImpl.remoteCall(SharedConstants.Commands.Electron.ShowSaveDialog, {
    defaultPath: bot.path,
    buttonLabel: 'Move',
    nameFieldLabel: 'Name',
    filters: [{ extensions: ['.bot'] }],
  });
  if (!newPath) {
    return;
  }
  try {
    const { path: oldPath } = bot;
    bot.path = newPath;
    yield CommandServiceImpl.remoteCall(SharedConstants.Commands.Electron.RenameFile, { path: oldPath, newPath });
    yield CommandServiceImpl.remoteCall(SharedConstants.Commands.Bot.PatchBotList, oldPath, bot);
  } catch (e) {
    const errMsg = `Error occurred while moving the bot file: ${e}`;
    const notification = newNotification(errMsg);
    yield put(beginAdd(notification));
  }
}

export function* welcomePageSagas(): IterableIterator<ForkEffect> {
  yield takeEvery(OPEN_CONTEXT_MENU_FOR_BOT, openContextMenuForBot);
}
