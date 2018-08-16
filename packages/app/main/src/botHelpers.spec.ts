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

jest.mock('./botData/store', () => ({
  getStore: () => ({
    getState: () => ({
      bot: {
        activeBot: {
          name: 'someBot',
          description: '',
          secretKey: '',
          path: 'somePath',
          services: []
        },
        botFiles: [
          { path: 'path1', displayName: 'name1', secret: '' },
          { path: 'path2', displayName: 'name2', secret: '' },
          { path: 'path3', displayName: 'name3', secret: '' }
        ]
      }
    }),
    dispatch: () => null
  })
}));

jest.mock('./main', () => ({
  mainWindow: {
    commandService: {
      remoteCall: () => null
    }
  }
}));

import { mainWindow } from './main';
import { SharedConstants } from '@bfemulator/app-shared';
import { BotConfigWithPath } from '@bfemulator/sdk-shared';
import { BotConfig } from 'msbot';

import {
  getActiveBot,
  getBotInfoByPath,
  pathExistsInRecentBots,
  removeBotFromList,
  cloneBot,
  toSavableBot,
  saveBot
} from './botHelpers';

describe('botHelpers tests', () => {
  test('getActiveBot()', () => {
    let activeBot = getActiveBot();
    expect(activeBot).toEqual({
      name: 'someBot',
      description: '',
      secretKey: '',
      path: 'somePath',
      services: []
    });
  });

  test('getBotInfoByPath()', () => {
    const info = getBotInfoByPath('path2');
    expect(info).toEqual({ path: 'path2', displayName: 'name2', secret: '' });
  });

  test('pathExistsInRecentBots()', () => {
    const pathExists = pathExistsInRecentBots('path1');
    expect(pathExists).toBe(true);
  });

  test(`removeBotFromList()`, () => {
    const spy = jest.spyOn(mainWindow.commandService, 'remoteCall');
    removeBotFromList('path3');

    // should have sync'd up list with remaining 2 bot entries (3rd was removed)
    expect(spy).toHaveBeenCalledWith(
      SharedConstants.Commands.Bot.SyncBotList,
      [
        { path: 'path1', displayName: 'name1', secret: '' },
        { path: 'path2', displayName: 'name2', secret: '' }
      ]
    );
  });

  test('cloneBot()', () => {
    const bot1 = null;
    expect(cloneBot(bot1)).toBe(null);

    const bot2: BotConfigWithPath = {
      name: 'someName',
      description: 'someDescription',
      secretKey: 'someSecretKey',
      services: [],
      path: 'somePath',
      overrides: null
    };
    expect(cloneBot(bot2)).toEqual(bot2);
  });

  test('toSavableBot()', () => {
    const bot1 = null;
    expect(() => toSavableBot(bot1)).toThrowError('Cannot convert falsy bot to savable bot.');

    const bot2: BotConfigWithPath = {
      name: 'someName',
      description: 'someDescription',
      secretKey: 'someSecretKey',
      services: [],
      path: 'somePath',
      overrides: null
    };
    const expectedBot = new BotConfig();
    expectedBot.name = 'someName';
    expectedBot.description = 'someDescription';
    expectedBot.services = [];
    expectedBot.secretKey = 'someSecretKey';
    expect(toSavableBot(bot2)).toEqual(expectedBot);
  });
});
