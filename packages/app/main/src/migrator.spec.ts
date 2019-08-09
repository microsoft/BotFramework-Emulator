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

import * as Path from 'path';

import { SharedConstants } from '@bfemulator/app-shared';
import { CommandServiceImpl, CommandServiceInstance } from '@bfemulator/sdk-shared';

import { Migrator } from './migrator';

interface MockCall {
  name: string;
  args?: any[];
}

let mockAppDataPath = Path.join('%appdata%', '@bfemulator', 'main');
jest.mock('electron', () => ({
  app: {
    getPath: () => mockAppDataPath,
    setName: () => null,
  },
  ipcMain: new Proxy(
    {},
    {
      get(): any {
        return () => ({});
      },
      has() {
        return true;
      },
    }
  ),
  ipcRenderer: new Proxy(
    {},
    {
      get(): any {
        return () => ({});
      },
      has() {
        return true;
      },
    }
  ),
}));

let mockWillCallMkdirp;
let mockCalls: MockCall[] = [];
let mockFailExists;
jest.mock('fs-extra', () => ({
  pathExists: (path: string) => {
    mockCalls.push({ name: 'pathExists', args: [path] });
    if (path.startsWith('v4') && !mockWillCallMkdirp) {
      // this will mock the scenario in which the v4
      // /migration/ dir does not exist and is created for the first time
      mockWillCallMkdirp = true;
      return Promise.resolve(false);
    }
    if (path.startsWith('nonexistent') || mockFailExists) {
      return Promise.resolve(false);
    }
    return Promise.resolve(true);
  },
}));

jest.mock('./utils/getFilesInDir', () => ({
  getFilesInDir: () => ['bot1.bot', 'bot2.bot', 'bot3.bot'],
}));

jest.mock('./utils/writeFile', () => ({
  writeFile: (path: string) => {
    mockCalls.push({ name: 'writeFile', args: [path] });
  },
}));

let mockBotCounter;
jest.mock('botframework-config', () => ({
  BotConfiguration: {
    load: (path: string) => {
      mockCalls.push({ name: 'load', args: [path] });
      // return bot1, bot2, bot3
      const bot = {
        name: `bot${mockBotCounter}`,
      };
      mockBotCounter++;
      return bot;
    },
  },
}));

jest.mock('./botHelpers', () => ({
  BotHelpers: {
    cloneBot: bot => bot,
    saveBot: bot => {
      mockCalls.push({ name: 'saveBot', args: [bot] });
      return Promise.resolve(true);
    },
  },
}));

jest.mock('./utils/ensureStoragePath', () => ({
  ensureStoragePath: () => 'v4path',
}));

jest.mock('mkdirp', () => ({
  sync: path => {
    mockCalls.push({ name: 'mkdirp', args: [path] });
  },
}));

jest.mock('./state/store', () => ({
  store: {
    dispatch: () => null,
    getState: () => ({
      bot: {
        botFiles: [],
      },
    }),
  },
}));

describe('Migrator tests', () => {
  let tempLeaveMigrationMarker;
  let tempMigrateBots;
  let commandService: CommandServiceImpl;

  beforeAll(() => {
    const decorator = CommandServiceInstance();
    const descriptor = decorator({ descriptor: {} }, 'none') as any;
    commandService = descriptor.descriptor.get();
    commandService.remoteCall = (...args: any[]) => {
      mockCalls.push({ name: 'remoteCall', args });
      return Promise.resolve(true) as any;
    };
    commandService.call = (...args: any[]) => {
      mockCalls.push({ name: 'call', args });
      return Promise.resolve(true) as any;
    };
  });

  beforeEach(() => {
    tempLeaveMigrationMarker = (Migrator as any).leaveMigrationMarker;
    tempMigrateBots = Migrator.migrateBots;
    mockCalls = [];
    mockAppDataPath = Path.join('%appdata%', '@bfemulator', 'main');
    mockWillCallMkdirp = false;
    mockBotCounter = 1;
    mockFailExists = false;
  });

  afterEach(() => {
    (Migrator as any).leaveMigrationMarker = tempLeaveMigrationMarker;
    Migrator.migrateBots = tempMigrateBots;
  });

  test('startup', async () => {
    // migration won't happen the first time, but will the second time
    const mockMigrateBots = jest
      .fn()
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true);
    Migrator.migrateBots = mockMigrateBots;

    // marker should only be placed when migration succeeds
    mockFailExists = true;
    await Migrator.startup();
    expect(
      mockCalls.some(
        _call => _call.name === 'writeFile' && _call.args[0] === Path.join('v4path', 'migration_marker.txt')
      )
    ).not.toBe(true);

    await Migrator.startup();
    expect(
      mockCalls.some(
        _call => _call.name === 'writeFile' && _call.args[0] === Path.join('v4path', 'migration_marker.txt')
      )
    ).toBe(true);
  });

  test('migrating bots with no v3 /migration/ dir', async () => {
    // the first exists call will fail and return false
    mockAppDataPath = Path.join('nonexistent', '@bfemulator', 'main');
    const result = await Migrator.migrateBots();
    expect(result).toBe(false);
    expect(
      mockCalls.some(
        _call =>
          _call.name === 'pathExists' &&
          _call.args[0] === Path.join('nonexistent', 'botframework-emulator', 'botframework-emulator', 'migration')
      )
    ).toBe(true);
  });

  test('migrating bots with no v4 /migration/ dir', async () => {
    const result = await Migrator.migrateBots();

    // mkdirp should be called to create the v4 migration dir
    expect(mockCalls.some(_call => _call.name === 'mkdirp' && _call.args[0] === Path.join('v4path', 'migration'))).toBe(
      true
    );

    // load should have been called once (3 times total) for each bot in v3 migration dir
    const v3MigrationDir = Path.join('%appdata%', 'botframework-emulator', 'botframework-emulator', 'migration');
    const mockLoadCalls = mockCalls.filter(_call => _call.name === 'load');
    expect(mockLoadCalls).toHaveLength(3);
    expect(
      mockLoadCalls.some(_call => _call.name === 'load' && _call.args[0] === Path.join(v3MigrationDir, 'bot1.bot'))
    ).toBe(true);

    // save should have been called once (3 times total) for each bot to save to v4 migration dir
    const v4MigrationDir = Path.join('v4path', 'migration');
    const mockSaveCalls = mockCalls.filter(_call => _call.name === 'saveBot');
    expect(mockSaveCalls).toHaveLength(3);
    expect(
      mockSaveCalls.some(
        _call => _call.name === 'saveBot' && _call.args[0].path === Path.join(v4MigrationDir, 'bot1.bot')
      )
    ).toBe(true);

    // ShowPostMigrationDialog should be called
    const { ShowPostMigrationDialog } = SharedConstants.Commands.UI;
    expect(mockCalls.some(_call => _call.name === 'remoteCall' && _call.args[0] === ShowPostMigrationDialog)).toBe(
      true
    );

    // success
    expect(result).toBe(true);
  });
});
