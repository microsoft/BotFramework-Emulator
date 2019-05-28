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

import { newNotification, SharedConstants, UserSettings } from '@bfemulator/app-shared';
import { ConversationService, StartConversationParams } from '@bfemulator/sdk-shared';
import { call, ForkEffect, put, select, takeEvery, takeLatest } from 'redux-saga/effects';
import { CommandServiceImpl, CommandServiceInstance } from '@bfemulator/sdk-shared';

import { ActiveBotHelper } from '../../ui/helpers/activeBotHelper';
import { BotAction, BotActionType, BotConfigWithPathPayload, botHashGenerated } from '../action/botActions';
import { beginAdd } from '../action/notificationActions';
import { generateHash } from '../botHelpers';
import { RootState } from '../store';

import { SharedSagas } from './sharedSagas';

export class BotSagas {
  @CommandServiceInstance()
  private static commandService: CommandServiceImpl;

  public static *browseForBot(): IterableIterator<any> {
    yield call([ActiveBotHelper, ActiveBotHelper.confirmAndOpenBotFromFile]);
  }

  public static *generateHashForActiveBot(action: BotAction<BotConfigWithPathPayload>): IterableIterator<any> {
    const { bot } = action.payload;
    const generatedHash = yield call(generateHash, bot);
    yield put(botHashGenerated(generatedHash));
  }

  public static *openBotViaFilePath(action: BotAction<string>) {
    try {
      yield call([ActiveBotHelper, ActiveBotHelper.confirmAndOpenBotFromFile], action.payload);
    } catch (e) {
      const errorNotification = beginAdd(
        newNotification(`An Error occurred opening the bot at ${action.payload}: ${e}`)
      );
      yield put(errorNotification);
    }
  }

  public static *openBotViaUrl(action: BotAction<Partial<StartConversationParams>>) {
    const serverUrl = yield select((state: RootState) => state.clientAwareSettings.serverUrl);
    if (!action.payload.user) {
      // If no user is provided, select the current user
      const customUserId = yield select((state: RootState) => state.framework.userGUID);
      const users: UserSettings = yield select((state: RootState) => state.clientAwareSettings.users);
      action.payload.user = customUserId || users.usersById[users.currentUserId];
      if (customUserId) {
        action.payload.user = customUserId;
        yield call(
          [BotSagas.commandService, BotSagas.commandService.remoteCall],
          SharedConstants.Commands.Emulator.SetCurrentUser,
          customUserId
        );
      }
    }
    let error;
    try {
      const response = yield ConversationService.startConversation(serverUrl, action.payload);
      if (!response.ok) {
        error = `An Error occurred opening the bot at ${action.payload.endpoint}: ${response.statusText}`;
      }
      // if (debugMode === DebugMode.Sidecar) {
      //   // extract the conversation id from the body
      //   const parsedBody = yield response.json();
      //   const conversationId = parsedBody.id || '';
      //   if (conversationId) {
      //     // post debug init command to conversation
      //     const activity = {
      //       type: 'message',
      //       text: '/INSPECT open',
      //     };
      //     const postActivityResponse = yield call(
      //       [BotSagas.commandService, BotSagas.commandService.remoteCall],
      //       SharedConstants.Commands.Emulator.PostActivityToConversation,
      //       conversationId,
      //       activity
      //     );
      //     if (postActivityResponse.statusCode >= 400) {
      //       throw new Error(
      //         `An error occurred while POSTing "/INSPECT open" command to conversation ${conversationId}`
      //       );
      //     }
      //   } else {
      //     throw new Error('An error occurred while trying to grab conversation ID from new conversation.');
      //   }
      // }
    } catch (e) {
      error = e.message;
    }
    if (error) {
      const errorNotification = beginAdd(newNotification(error));
      yield put(errorNotification);
    } else {
      // remember the endpoint
      yield call(
        [BotSagas.commandService, BotSagas.commandService.remoteCall],
        SharedConstants.Commands.Settings.SaveBotUrl,
        action.payload.endpoint
      );
    }
  }
}

export function* botSagas(): IterableIterator<ForkEffect> {
  yield takeEvery(BotActionType.browse, BotSagas.browseForBot);
  yield takeEvery(BotActionType.openViaUrl, BotSagas.openBotViaUrl);
  yield takeEvery(BotActionType.openViaFilePath, BotSagas.openBotViaFilePath);
  yield takeEvery(BotActionType.setActive, BotSagas.generateHashForActiveBot);
  yield takeLatest(
    [BotActionType.setActive, BotActionType.load, BotActionType.close],
    SharedSagas.refreshConversationMenu
  );
}
