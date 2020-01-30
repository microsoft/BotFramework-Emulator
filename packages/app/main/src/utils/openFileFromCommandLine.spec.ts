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

import { normalize } from 'path';

import { openTranscript } from '@bfemulator/app-shared';
import { CommandRegistry, CommandRegistryImpl } from '@bfemulator/sdk-shared';

import { openFileFromCommandLine } from './openFileFromCommandLine';

const mockDispatch = jest.fn();
jest.mock('../state', () => ({
  store: {
    dispatch: action => mockDispatch(action),
  },
}));

class MockCommandService implements CommandService {
  public registry: CommandRegistry = new CommandRegistryImpl();
  public remoteCalls = [];
  public localCalls = [];

  async remoteCall(...args: any[]) {
    this.remoteCalls.push(args);
    return null;
  }

  async call(...args: any[]) {
    this.localCalls.push(args);
    return null;
  }

  on(commandName: string, handler?: Function): any {
    return null;
  }
}

describe('The openFileFromCommandLine util', () => {
  let commandService: MockCommandService;

  beforeEach(() => {
    commandService = new MockCommandService();
    mockDispatch.mockClear();
  });

  it('should make the appropriate calls to open a .bot file', async () => {
    await openFileFromCommandLine('some/path.bot', commandService);
    expect(commandService.localCalls).toEqual([
      ['bot:open', 'some/path.bot'],
      ['bot:set-active', null],
    ]);
    expect(commandService.remoteCalls).toEqual([['bot:load', null]]);
  });

  it('should throw when there is an error trying to open a .bot file', async () => {
    jest.spyOn(commandService, 'call').mockRejectedValueOnce('Something went wrong.');
    try {
      await openFileFromCommandLine('some/path.bot', commandService);
      expect(true).toBe(false); // ensure catch is hit
    } catch (e) {
      expect(e).toEqual(
        new Error('Error while trying to open a .bot file via double click at: some/path.bot: Something went wrong.')
      );
    }
  });

  it('should make the appropriate calls to open a .transcript file', async () => {
    const filename = 'some/path.transcript';
    await openFileFromCommandLine(filename, commandService);
    expect(mockDispatch).toHaveBeenCalledWith(openTranscript(normalize(filename)));
  });

  it('should make the appropriate calls to open a .chat file', async () => {
    const filename = 'some/path.chat';
    await openFileFromCommandLine(filename, commandService);
    expect(mockDispatch).toHaveBeenCalledWith(openTranscript(normalize(filename)));
  });
});
