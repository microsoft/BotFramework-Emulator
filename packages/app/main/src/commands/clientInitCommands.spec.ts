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
import { SettingsImpl, SharedConstants } from '@bfemulator/app-shared';
import { BotConfigWithPathImpl, CommandRegistryImpl } from '@bfemulator/sdk-shared';
import { combineReducers, createStore } from 'redux';

import { bot } from '../botData/reducers/bot';
import * as store from '../botData/store';
import { mainWindow } from '../main';
import reducers from '../settingsData/reducers';

import { registerCommands } from './clientInitCommands';

let mockSettingsStore;
const mockCreateStore = () => createStore(reducers);
const mockSettingsImpl = SettingsImpl;
jest.mock('../settingsData/store', () => ({
  getStore: function() {
    return mockSettingsStore || (mockSettingsStore = mockCreateStore());
  },
  getSettings: function() {
    return new mockSettingsImpl(mockSettingsStore.getState());
  },
  get dispatch() {
    return mockSettingsStore.dispatch;
  },
}));

jest.mock('../emulator', () => ({
  emulator: {
    framework: {
      serverUrl: 'http://localhost:3000',
      locale: 'en-us',
      server: {
        botEmulator: {
          facilities: {
            endpoints: {
              reset: () => null,
              push: () => null,
            },
          },
        },
      },
    },
  },
}));

jest.mock('../globals', () => ({
  getGlobal: () => ({ storagepath: '' }),
}));

jest.mock('electron', () => ({
  app: {
    getPath: () => './',
  },
}));

jest.mock('mkdirp', () => ({
  sync: () => void 0,
}));
const mockReadFileSyncResponses = [`{"bots":[]}`, '[]'];
jest.mock('../utils/readFileSync', () => ({
  readFileSync: file => {
    if (file.includes('.transcript')) {
      return '[]';
    }
    if (file.includes('bots.json')) {
      return `{"bots":[]}`;
    }
    return mockReadFileSyncResponses.shift();
  },
}));

let mockStore;
(store as any).getStore = function() {
  return mockStore || (mockStore = createStore(combineReducers({ bot })));
};

jest.mock('../main', () => ({
  mainWindow: {
    commandService: {
      call: async () => true,
      remoteCall: async () => true,
    },
  },
}));

describe('The clientInitCommands', () => {
  let registry: CommandRegistryImpl;
  beforeAll(() => {
    registry = new CommandRegistryImpl();
    registerCommands(registry);
  });

  it('should retrieve the bots from disk and do other things when the client is done loading', async () => {
    const command = registry.getCommand(SharedConstants.Commands.ClientInit.Loaded).handler;

    const remoteCommandArgs = [];
    const localCommandArgs = [];
    (mainWindow.commandService as any).remoteCall = (...args) => {
      remoteCommandArgs.push(args);
    };
    (mainWindow.commandService as any).call = (...args) => {
      localCommandArgs.push(args);
    };

    await command();
    expect(localCommandArgs).toEqual([['electron:set-title-bar'], ['electron:set-fullscreen', false]]);
    expect(remoteCommandArgs).toEqual([
      [
        'receive-global-settings',
        {
          cwd: jasmine.any(String),
          locale: '',
          serverUrl: 'http://localhost:3000',
          users: {},
        },
      ],
    ]);
  });

  it('should push client aware settings', async () => {
    const command = registry.getCommand(SharedConstants.Commands.Settings.PushClientAwareSettings).handler;
    const remoteCommandArgs = [];
    (mainWindow.commandService as any).remoteCall = (...args) => {
      remoteCommandArgs.push(args);
    };
    await command();
    expect(remoteCommandArgs).toEqual([
      [
        'receive-global-settings',
        {
          cwd: jasmine.any(String),
          locale: '',
          serverUrl: 'http://localhost:3000',
          users: {},
        },
      ],
    ]);
  });

  it('should open a bot and/or transcript file from the command line when the welcome screen is rendered', async () => {
    const mockBot = BotConfigWithPathImpl.fromJSON({
      path: 'some/path',
      name: 'AuthBot',
      description: '',
      padlock: '',
      services: [
        {
          appId: '4f8fde3f-48d3-4d8a-a954-393efe39809e',
          id: 'cded37c0-83f2-11e8-ac6d-b7172cd24b28',
          type: 'endpoint',
          appPassword: 'REDACTED',
          endpoint: 'http://localhost:55697/api/messages',
          name: 'authsample',
        },
      ],
    } as any);
    process.argv.push('/path/to/transcript.transcript');
    process.argv.push('bfemulator://bot.open?path=path/to/bot.bot');

    const remoteCommandArgs = [];
    const localCommandArgs = [];
    (mainWindow.commandService as any).remoteCall = (...args) => {
      remoteCommandArgs.push(args);
    };
    (mainWindow.commandService as any).call = (...args: any[]) => {
      localCommandArgs.push(args);
      if (args[0] === SharedConstants.Commands.Bot.Open) {
        return mockBot;
      }
      return null;
    };

    const command = registry.getCommand(SharedConstants.Commands.ClientInit.PostWelcomeScreen).handler;
    await command();
    expect(localCommandArgs).toEqual([
      ['menu:update-file-menu'],
      ['bot:open', 'pathtobot.bot', undefined],
      [
        'bot:set-active',
        {
          description: '',
          name: 'AuthBot',
          overrides: null,
          padlock: '',
          path: 'some/path',
          services: [
            {
              appId: '4f8fde3f-48d3-4d8a-a954-393efe39809e',
              appPassword: 'REDACTED',
              endpoint: 'http://localhost:55697/api/messages',
              id: 'cded37c0-83f2-11e8-ac6d-b7172cd24b28',
              name: 'authsample',
              type: 'endpoint',
            },
          ],
          version: '2.0',
        },
      ],
    ]);

    expect(remoteCommandArgs).toEqual([
      [
        'transcript:open',
        '/path/to/transcript.transcript',
        'transcript.transcript',
        {
          activities: [],
          inMemory: true,
        },
      ],
      [
        'bot:load',
        {
          description: '',
          name: 'AuthBot',
          overrides: null,
          padlock: '',
          path: 'some/path',
          services: [
            {
              appId: '4f8fde3f-48d3-4d8a-a954-393efe39809e',
              appPassword: 'REDACTED',
              endpoint: 'http://localhost:55697/api/messages',
              id: 'cded37c0-83f2-11e8-ac6d-b7172cd24b28',
              name: 'authsample',
              type: 'endpoint',
            },
          ],
          version: '2.0',
        },
      ],
    ]);
  });
});
