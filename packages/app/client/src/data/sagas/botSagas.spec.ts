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

import { BotConfigWithPath } from '@bfemulator/sdk-shared';
import { SharedConstants } from '@bfemulator/app-shared';

import {
  BotActions,
  botHashGenerated,
  SetActiveBotAction,
} from '../action/botActions';
import { generateBotHash } from '../botHelpers';

import {
  botSagas,
  browseForBot,
  editorSelector,
  generateHashForActiveBot,
} from './botSagas';
import { refreshConversationMenu } from './sharedSagas';

import { call, put, select, takeEvery, takeLatest } from 'redux-saga/effects';

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

    const browseForBotYield = gen.next().value;

    expect(browseForBotYield).toEqual(
      takeEvery(BotActions.browse, browseForBot)
    );

    const generateBotHashYield = gen.next().value;

    expect(generateBotHashYield).toEqual(
      takeEvery(BotActions.setActive, generateHashForActiveBot)
    );

    const refreshConversationMenuYield = gen.next().value;

    expect(refreshConversationMenuYield).toEqual(
      takeLatest(
        [BotActions.setActive, BotActions.load, BotActions.close],
        refreshConversationMenu
      )
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

    const setActiveBotAction: SetActiveBotAction = {
      type: BotActions.setActive,
      payload: {
        bot: botConfigPath,
      },
    };
    const gen = generateHashForActiveBot(setActiveBotAction);
    const generatedHash = gen.next().value;

    expect(generatedHash).toEqual(call(generateBotHash, botConfigPath));

    const putGeneratedHash = gen.next(generatedHash).value;
    expect(putGeneratedHash).toEqual(put(botHashGenerated(generatedHash)));
    expect(gen.next().done).toBe(true);
  });

  it('should open native open file dialog to browse for .bot file', () => {
    const gen = browseForBot();
    gen.next();
    expect(mockLocalCommandsCalled).toHaveLength(1);
    const { OpenBrowse } = SharedConstants.Commands.Bot;

    expect(mockLocalCommandsCalled[0].commandName).toEqual(OpenBrowse);
    expect(gen.next().done).toBe(true);
  });
});
