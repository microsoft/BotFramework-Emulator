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

import { getActiveBot, getBotInfoByPath, pathExistsInRecentBots } from './botHelpers';

jest.mock('../store', () => ({
  store: {
    getState: () => ({
      bot: {
        activeBot: {
          name: 'bot1',
          description: 'description1',
          padlock: 'padlock1',
          services: [],
        },
        botFiles: [
          {
            path: 'path1',
          },
        ],
      },
    }),
  },
}));
describe('Bot helpers tests', () => {
  it('should get the active bot', () => {
    const activeBot = getActiveBot();
    expect(activeBot.name).toBe('bot1');
    expect(activeBot.description).toBe('description1');
    expect(activeBot.padlock).toBe('padlock1');
    expect(activeBot.services).toEqual([]);
  });

  describe('returning a bot info object by path', () => {
    it('should return the info object if found', () => {
      const result = getBotInfoByPath('path1');
      expect(result).toEqual({ path: 'path1' });
    });

    it('should return a falsy value if not found', () => {
      const result = getBotInfoByPath('nonExistentPath');
      expect(result).toBeFalsy();
    });
  });

  describe('returning whether a bot exists in recent bots or not', () => {
    it('should return true for an existing bot', () => {
      const botFound = pathExistsInRecentBots('path1');
      expect(botFound).toBe(true);
    });

    it('should return false for a nonexistent bot', () => {
      const botFound = pathExistsInRecentBots('nonExistentPath');
      expect(botFound).toBe(false);
    });
  });

  // unmock store
  jest.unmock('../store');
});
