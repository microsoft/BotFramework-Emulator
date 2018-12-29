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

import { globalHandlers } from './eventHandlers';
import { SharedConstants } from '@bfemulator/app-shared';

const { Commands: { Bot: { OpenBrowse }, UI: { ShowBotCreationDialog }} } = SharedConstants;

let mockLocalCommandsCalled = [];

jest.mock('../platform/commands/commandServiceImpl', () => ({
  CommandServiceImpl: {
    call: async (commandName: string, ...args: any[]) => {
      mockLocalCommandsCalled.push({ commandName, args: args });
    },
  }
}));

describe('#globalHandlers', () => {
  beforeEach(() => {
    mockLocalCommandsCalled = [];
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('handles CMD+O', () => {
    const event = new KeyboardEvent('keydown', { metaKey: true, key: 'o' });
    globalHandlers(event);
    expect(mockLocalCommandsCalled.length).toBe(1);
    expect(mockLocalCommandsCalled[0].commandName).toBe(OpenBrowse);
  });

  it('handles CTRL+O', () => {
    const event = new KeyboardEvent('keydown', { ctrlKey: true, key: 'O' });

    globalHandlers(event);
    expect(mockLocalCommandsCalled.length).toBe(1);
    expect(mockLocalCommandsCalled[0].commandName).toBe(OpenBrowse);
  });

  it('handles CMD+N', () => {
    const event = new KeyboardEvent('keydown', { metaKey: true, key: 'n' });

    globalHandlers(event);
    expect(mockLocalCommandsCalled.length).toBe(1);
    expect(mockLocalCommandsCalled[0].commandName).toBe(ShowBotCreationDialog);
  });

  it('handles CTRL+N', () => {
    const event = new KeyboardEvent('keydown', { ctrlKey: true, key: 'N' });

    globalHandlers(event);
    expect(mockLocalCommandsCalled.length).toBe(1);
    expect(mockLocalCommandsCalled[0].commandName).toBe(ShowBotCreationDialog);
  });

  it('handles something it doesn\'t care about', () => {
    const event = new KeyboardEvent('keydown', { ctrlKey: true, key: 'y'});

    globalHandlers(event);
    expect(mockLocalCommandsCalled.length).toBe(0);
  });
});
