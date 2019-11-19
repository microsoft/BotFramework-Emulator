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

import { TokenCache } from './tokenCache';

describe('TokenCache tests', () => {
  const botId = 'someBotId';
  const userId = 'someUserId';
  const connectionName = 'someConnectionName';
  const token = 'someToken';
  const tokenKey = `${botId}_${userId}_${connectionName}`;

  beforeEach(() => {
    (TokenCache as any).tokenStore = {};
  });

  it('should add a token to the cache', () => {
    TokenCache.addTokenToCache(botId, userId, connectionName, token);

    expect((TokenCache as any).tokenStore[tokenKey]).toEqual({
      connectionName,
      token,
    });
  });

  it('should delete a token from the cache', () => {
    const tokenEntry = { connectionName, token };
    (TokenCache as any).tokenStore[tokenKey] = tokenEntry;

    TokenCache.deleteTokenFromCache(botId, userId, connectionName);

    expect((TokenCache as any).tokenStore[tokenKey]).toBe(undefined);
  });

  it('should get a token from the cache', () => {
    const tokenEntry = { connectionName, token };
    (TokenCache as any).tokenStore[tokenKey] = tokenEntry;

    expect(TokenCache.getTokenFromCache(botId, userId, connectionName)).toBe(tokenEntry);
  });

  it('should generate a token key', () => {
    expect((TokenCache as any).tokenKey(botId, userId, connectionName)).toBe(tokenKey);
  });
});
