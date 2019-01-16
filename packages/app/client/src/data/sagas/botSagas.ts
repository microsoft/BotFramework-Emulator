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

import { SharedConstants } from '@bfemulator/app-shared';

import { CommandServiceImpl } from '../../platform/commands/commandServiceImpl';
import {
  BotActions,
  botHashGenerated,
  SetActiveBotAction,
} from '../action/botActions';
import { generateBotHash } from '../botHelpers';

import { refreshConversationMenu } from './sharedSagas';

import {
  call,
  ForkEffect,
  put,
  takeEvery,
  takeLatest,
} from 'redux-saga/effects';

/** Opens up native open file dialog to browse for a .bot file */
export function* browseForBot(): IterableIterator<any> {
  yield CommandServiceImpl.call(SharedConstants.Commands.Bot.OpenBrowse)
    // dialog was closed
    .catch(_err => null);
}

export function* generateHashForActiveBot(
  action: SetActiveBotAction
): IterableIterator<any> {
  const { bot } = action.payload;
  const generatedHash = yield call(generateBotHash, bot);
  yield put(botHashGenerated(generatedHash));
}

export function* botSagas(): IterableIterator<ForkEffect> {
  yield takeEvery(BotActions.browse, browseForBot);
  yield takeEvery(BotActions.setActive, generateHashForActiveBot);
  yield takeLatest(
    [BotActions.setActive, BotActions.load, BotActions.close],
    refreshConversationMenu
  );
}
