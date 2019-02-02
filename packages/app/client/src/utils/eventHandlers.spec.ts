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

import { CommandServiceImpl } from '../platform/commands/commandServiceImpl';

import { globalHandlers } from './eventHandlers';

const {
  Commands: {
    UI: { ShowBotCreationDialog, ShowOpenBotDialog },
  },
} = SharedConstants;

let mockLocalCommandsCalled = [];

jest.mock('../platform/commands/commandServiceImpl', () => ({
  CommandServiceImpl: {
    call: async (commandName: string, ...args: any[]) => {
      mockLocalCommandsCalled.push({ commandName, args: args });
    },
  },
}));

describe('#globalHandlers', () => {
  beforeEach(() => {
    mockLocalCommandsCalled = [];
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('calls ShowOpenBotDialog when CMD+O is pressed', async () => {
    const event = new KeyboardEvent('keydown', { metaKey: true, key: 'o' });
    await globalHandlers(event);
    expect(mockLocalCommandsCalled.length).toBe(1);
    expect(mockLocalCommandsCalled[0].commandName).toBe(ShowOpenBotDialog);
  });

  it('calls ShowOpenBotDialog when CTRL+O is pressed', async () => {
    const event = new KeyboardEvent('keydown', { ctrlKey: true, key: 'O' });

    await globalHandlers(event);
    expect(mockLocalCommandsCalled.length).toBe(1);
    expect(mockLocalCommandsCalled[0].commandName).toBe(ShowOpenBotDialog);
  });

  it('calls ShowBotCreationDialog when CMD+N is pressed', async () => {
    const event = new KeyboardEvent('keydown', { metaKey: true, key: 'n' });

    await globalHandlers(event);
    expect(mockLocalCommandsCalled.length).toBe(1);
    expect(mockLocalCommandsCalled[0].commandName).toBe(ShowBotCreationDialog);
  });

  it('calls ShowBotCreationDialog when CTRL+N is pressed', async () => {
    const event = new KeyboardEvent('keydown', { ctrlKey: true, key: 'N' });

    await globalHandlers(event);
    expect(mockLocalCommandsCalled.length).toBe(1);
    expect(mockLocalCommandsCalled[0].commandName).toBe(ShowBotCreationDialog);
  });

  it("calls nothing with a keydown it doesn't care about", async () => {
    const event = new KeyboardEvent('keydown', { ctrlKey: true, key: 'y' });

    await globalHandlers(event);
    expect(mockLocalCommandsCalled.length).toBe(0);
  });

  it('should send a notification if a command fails', async () => {
    const event = new KeyboardEvent('keydown', { ctrlKey: true, key: 'N' });
    const spy = jest.spyOn(CommandServiceImpl, 'call').mockRejectedValueOnce('oh noes!');

    await globalHandlers(event);
    expect(spy).toHaveBeenLastCalledWith('notification:add', {
      message: 'oh noes!',
      type: 1,
    });
  });
});
