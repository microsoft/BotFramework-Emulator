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

import { ADD_SAVED_BOT_URL } from '../actions/savedBotUrlsActions';

import { savedBotUrls } from './savedBotUrls';

describe('saved bot urls reducer', () => {
  it('should return the default state', () => {
    const state = savedBotUrls([], {} as any);

    expect(state).toEqual([]);
  });

  it('should add a saved bot url if it has not already been saved', () => {
    const action: any = { type: ADD_SAVED_BOT_URL, payload: 'http://some.boturl.com' };
    const state = savedBotUrls([], action);

    expect(state).toEqual([{ url: 'http://some.boturl.com', lastAccessed: expect.any(String) }]);
  });

  it('should re-order the savedBots list when mutated', () => {
    const action: any = { type: ADD_SAVED_BOT_URL, payload: 'http://some.boturl2.com' };
    const state = savedBotUrls(
      [{ url: 'http://some.boturl1.com', lastAccessed: new Date('2019-05-06T21:18:08.029Z').toUTCString() }],
      action
    );

    expect(state).toEqual([
      { url: 'http://some.boturl2.com', lastAccessed: expect.any(String) },
      { url: 'http://some.boturl1.com', lastAccessed: expect.any(String) },
    ]);
  });
});
