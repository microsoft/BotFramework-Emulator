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
import {
  CommandHandler,
  CommandRegistry,
  CommandRegistryImpl,
  CommandService,
  DisposableImpl,
} from '@bfemulator/sdk-shared';

import { openFileFromCommandLine } from './openFileFromCommandLine';
import * as readFileSyncUtil from './readFileSync';

jest.mock('./readFileSync', () => ({
  readFileSync: file => {
    if (file.includes('error.transcript')) {
      return '{}';
    }
    if (file.includes('.transcript')) {
      return '[]';
    }
    if (file.includes('bots.json')) {
      return `{'bots':[]}`;
    }
    return null;
  },
}));

class MockCommandService extends DisposableImpl implements CommandService {
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

  on(commandName: string, handler?: CommandHandler): any {
    return null;
  }
}

describe('The openFileFromCommandLine util', () => {
  let commandService: MockCommandService;
  beforeEach(() => {
    commandService = new MockCommandService();
  });

  it('should make the appropriate calls to open a .bot file', async () => {
    await openFileFromCommandLine('some/path.bot', commandService);
    expect(commandService.localCalls).toEqual([
      ['bot:open', 'some/path.bot'],
      ['bot:set-active', null],
    ]);
    expect(commandService.remoteCalls).toEqual([['bot:load', null]]);
  });

  it('should make the appropriate calls to open a .transcript file', async () => {
    await openFileFromCommandLine('some/path.transcript', commandService);
    expect(commandService.remoteCalls).toEqual([
      [
        'transcript:open',
        'deepLinkedTranscript',
        {
          activities: [],
          inMemory: true,
        },
      ],
    ]);
  });

  it('should throw when the transcript is not an array', async () => {
    let thrown: boolean;
    try {
      await openFileFromCommandLine('some/error.transcript', commandService);
    } catch (e) {
      thrown = true;
      expect(e.message).toEqual(
        'Invalid transcript file contents; should be an array of conversation activities.'
      );
    }
    expect(thrown).toBeTruthy();
  });
});
