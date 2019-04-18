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

import { newNotification, SharedConstants } from '@bfemulator/app-shared';
import { BotConfigWithPath, ConversationService } from '@bfemulator/sdk-shared';
import { call, put, select, takeEvery, takeLatest } from 'redux-saga/effects';

import { ActiveBotHelper } from '../../ui/helpers/activeBotHelper';
import {
  BotAction,
  BotActionType,
  botHashGenerated,
  openBotViaFilePathAction,
  openBotViaUrlAction,
} from '../action/botActions';
import { beginAdd } from '../action/notificationActions';
import { generateHash } from '../botHelpers';

import { botSagas, browseForBot, generateHashForActiveBot, openBotViaFilePath, openBotViaUrl } from './botSagas';
import { refreshConversationMenu } from './sharedSagas';

jest.mock('../../ui/dialogs', () => ({}));

jest.mock('../store', () => ({
  get store() {
    return {};
  },
}));

const mockSharedConstants = SharedConstants;
let mockRemoteCommandsCalled = [];
let mockLocalCommandsCalled = [];

jest.mock('../../platform/commands/commandServiceImpl', () => ({
  CommandServiceImpl: {
    call: async (commandName: string, ...args: any[]) => {
      mockLocalCommandsCalled.push({ commandName, args: args });

      switch (commandName) {
        case mockSharedConstants.Commands.Bot.OpenBrowse:
          return Promise.resolve(true);
        default:
          return Promise.resolve(true);
      }
    },
    remoteCall: async (commandName: string, ...args: any[]) => {
      mockRemoteCommandsCalled.push({ commandName, args: args });

      return Promise.resolve(true);
    },
  },
}));

describe('The botSagas', () => {
  beforeEach(() => {
    mockRemoteCommandsCalled = [];
    mockLocalCommandsCalled = [];
  });

  it('should initialize the root saga', () => {
    const gen = botSagas();

    expect(gen.next().value).toEqual(takeEvery(BotActionType.browse, browseForBot));

    expect(gen.next().value).toEqual(takeEvery(BotActionType.openViaUrl, openBotViaUrl));
    expect(gen.next().value).toEqual(takeEvery(BotActionType.openViaFilePath, openBotViaFilePath));
    expect(gen.next().value).toEqual(takeEvery(BotActionType.setActive, generateHashForActiveBot));

    expect(gen.next().value).toEqual(
      takeLatest([BotActionType.setActive, BotActionType.load, BotActionType.close], refreshConversationMenu)
    );

    expect(gen.next().done).toBe(true);
  });

  it('should generate a hash for an active bot', () => {
    const botConfigPath: BotConfigWithPath = {
      name: 'botName',
      description: 'a bot description here',
      padlock: null,
      services: [],
      path: '/some/Path/something',
      version: '0.1',
    };

    const setActiveBotAction: BotAction<any> = {
      type: BotActionType.setActive,
      payload: {
        bot: botConfigPath,
      },
    };
    const gen = generateHashForActiveBot(setActiveBotAction);
    const generatedHash = gen.next().value;

    expect(generatedHash).toEqual(call(generateHash, botConfigPath));

    const putGeneratedHash = gen.next(generatedHash).value;
    expect(putGeneratedHash).toEqual(put(botHashGenerated(generatedHash)));
    expect(gen.next().done).toBe(true);
  });

  it('should open native open file dialog to browse for .bot file', () => {
    const gen = browseForBot();
    expect(gen.next().value).toEqual(call([ActiveBotHelper, ActiveBotHelper.confirmAndOpenBotFromFile]));
    expect(gen.next().done).toBe(true);
  });

  it('should open a bot from a url', () => {
    const mockState = {
      clientAwareSettings: {
        serverUrl: 'http://localhost:3000',
        users: {
          currentUserId: '1',
          usersById: { '1': {} },
        },
      },
    };
    const gen = openBotViaUrl(
      openBotViaUrlAction({
        appPassword: 'password',
        appId: '1234abcd',
        endpoint: 'http://localhost/api/messages',
      })
    );
    const io = select(() => void 0);
    io.SELECT.selector = jasmine.any(Function) as any;
    // select serverUrl
    const selectServerUrl = gen.next().value as any;
    expect(selectServerUrl).toEqual(io);
    // select user
    const selectUser = gen.next(selectServerUrl.SELECT.selector(mockState)).value as any;
    expect(selectUser).toEqual(io);
    // call ConversationService.startConversation
    jest.spyOn(ConversationService, 'startConversation').mockResolvedValue({ ok: true });
    expect(gen.next(selectUser.SELECT.selector(mockState)).value).not.toBeNull();
  });

  it('should send a notification if opening a bot from a URL fails', () => {
    const gen = openBotViaUrl(
      openBotViaUrlAction({
        appPassword: 'password',
        appId: '1234abcd',
        endpoint: 'http://localhost/api/messages',
      })
    );
    const io = select(() => void 0);
    io.SELECT.selector = jasmine.any(Function) as any;
    // select serverUrl
    expect(gen.next().value).toEqual(io);
    // select user
    const selectUser = gen.next().value as any;
    expect(selectUser).toEqual(io);
    // call ConversationService.startConversation
    jest.spyOn(ConversationService, 'startConversation').mockResolvedValue(true);
    expect(
      gen.next(
        selectUser.SELECT.selector({
          clientAwareSettings: {
            users: {
              currentUserId: '1',
              usersById: { '1': {} },
            },
          },
        })
      ).value
    ).not.toBeNull();
    const errorNotification = beginAdd(
      newNotification('An Error occurred opening the bot at http://localhost/api/messages: oh noes!')
    );
    errorNotification.payload.notification.timestamp = jasmine.any(Number);
    errorNotification.payload.notification.id = jasmine.any(String);
    expect(
      gen.next({
        statusText: 'oh noes!',
        ok: false,
      }).value
    ).toEqual(put(errorNotification));
  });

  it('should open a bot from a file path', () => {
    const gen = openBotViaFilePath(openBotViaFilePathAction('/some/path.bot'));

    jest.spyOn(ActiveBotHelper, 'confirmAndOpenBotFromFile').mockResolvedValue(true);
    expect(gen.next().value).toEqual(
      call([ActiveBotHelper, ActiveBotHelper.confirmAndOpenBotFromFile], '/some/path.bot')
    );
  });

  it('should send a notification when opening a bot from a file path fails', () => {
    const gen = openBotViaFilePath(openBotViaFilePathAction('/some/path.bot'));
    const callOpenBot = gen.next().value;
    expect(callOpenBot).toEqual(call([ActiveBotHelper, ActiveBotHelper.confirmAndOpenBotFromFile], '/some/path.bot'));
    const putNotification = gen.throw(new Error('oh noes!'));
    const errorNotification = beginAdd(
      newNotification('An Error occurred opening the bot at /some/path.bot: Error: oh noes!')
    );
    errorNotification.payload.notification.timestamp = jasmine.any(Number);
    errorNotification.payload.notification.id = jasmine.any(String);
    expect(putNotification.value).toEqual(put(errorNotification));
  });
});
