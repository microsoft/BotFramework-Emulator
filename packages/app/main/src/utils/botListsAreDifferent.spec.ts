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

import { BotInfo } from '@bfemulator/app-shared';

import { botListsAreDifferent } from './botListsAreDifferent';

test('botListsAreDifferent() tests', () => {
  const list1: BotInfo[] = [
    {
      path: 'path1',
      displayName: 'bot1',
    },
    {
      path: 'path2',
      displayName: 'bot2',
    },
    {
      path: 'path3',
      displayName: 'bot3',
    },
  ];

  const list2: BotInfo[] = [];

  expect(botListsAreDifferent(list1, list2)).toBe(true);

  list2[0] = { path: 'path1', displayName: 'bot1' };
  list2[1] = { path: 'path2', displayName: 'bot2' };
  list2[2] = { path: 'path3', displayName: 'bot3' };

  expect(botListsAreDifferent(list1, list2)).toBe(false);

  list2[1] = { path: 'path2', displayName: 'bot_not2' };

  expect(botListsAreDifferent(list1, list2)).toBe(true);
});
