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
  azureAuthSettings,
  bot,
  framework,
  savedBotUrls,
  windowState,
  SettingsImpl,
  SharedConstants,
} from '@bfemulator/app-shared';
import {
  BotConfigWithPathImpl,
  CommandRegistry,
  CommandServiceImpl,
  CommandServiceInstance,
} from '@bfemulator/sdk-shared';
import { combineReducers, createStore } from 'redux';

import * as store from '../state/store';

import { ClientInitCommands } from './clientInitCommands';

const mockSettingsStore = createStore(
  combineReducers({
    settings: combineReducers({
      azure: azureAuthSettings,
      framework,
      savedBotUrls,
      windowState,
    }),
  })
);
const mockSettingsImpl = SettingsImpl;
jest.mock('../state/store', () => ({
  get store() {
    return mockSettingsStore;
  },
  getSettings: () => new mockSettingsImpl(mockSettingsStore.getState().settings),
  dispatch: action => mockSettingsStore.dispatch(action),
}));

// had to mock to fix some very strange import error that was happening downstream
jest.mock('../appMenuBuilder', () => ({
  AppMenuBuilder: {},
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
  setGlobal: () => void 0,
}));

jest.mock('electron', () => ({
  app: {
    getPath: () => './',
  },
  dialog: {
    showErrorBox: () => void 0,
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

const mockParseProtocolUrlAndDispatch = jest.fn();
jest.mock('../protocolHandler', () => ({
  ProtocolHandler: {
    parseProtocolUrlAndDispatch: (...args) => mockParseProtocolUrlAndDispatch(...args),
  },
}));

const mockOpenFileFromCommandLine = jest.fn();
jest.mock('../utils/openFileFromCommandLine', () => ({
  openFileFromCommandLine: async (...args) => mockOpenFileFromCommandLine(...args),
}));

let mockStore;
(store as any).getStore = function() {
  return mockStore || (mockStore = createStore(combineReducers({ bot })));
};

describe('The clientInitCommands', () => {
  let registry: CommandRegistry;
  let commandService: CommandServiceImpl;

  beforeAll(() => {
    new ClientInitCommands();
    const decorator = CommandServiceInstance();
    const descriptor = decorator({ descriptor: {} }, 'none') as any;
    commandService = descriptor.descriptor.get();
    registry = commandService.registry;
    mockParseProtocolUrlAndDispatch.mockClear();
    mockOpenFileFromCommandLine.mockClear();
  });

  it('should retrieve the bots from disk when the client is done loading', async () => {
    const command = registry.getCommand(SharedConstants.Commands.ClientInit.Loaded);

    const commands = [];
    (commandService as any).call = (...args) => {
      commands.push({ type: 'local', args });
    };
    (commandService as any).remoteCall = (...args) => {
      commands.push({ type: 'remote', args });
    };

    await command();
    expect(commands).toMatchInlineSnapshot(`
      [
        {
          "args": [
            "electron:set-title-bar",
          ],
          "type": "local",
        },
        {
          "args": [
            "shell:toggle-full-screen",
            false,
            false,
          ],
          "type": "remote",
        },
      ]
    `);
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
    const dispatchSpy = jest.spyOn(mockSettingsStore, 'dispatch');

    const remoteCommandArgs = [];
    const localCommandArgs = [];
    (commandService as any).remoteCall = (...args) => {
      remoteCommandArgs.push(args);
    };
    (commandService as any).call = (...args: any[]) => {
      localCommandArgs.push(args);
      if (args[0] === SharedConstants.Commands.Bot.Open) {
        return mockBot;
      }
      return null;
    };

    const command = registry.getCommand(SharedConstants.Commands.ClientInit.PostWelcomeScreen);
    await command();
    expect(localCommandArgs).toEqual([['menu:update-file-menu']]);

    expect(remoteCommandArgs).toEqual([[SharedConstants.Commands.UI.ShowDataCollectionDialog]]);

    expect(mockOpenFileFromCommandLine).toHaveBeenCalledWith('/path/to/transcript.transcript', commandService);
    expect(mockParseProtocolUrlAndDispatch).toHaveBeenCalledWith('bfemulator://bot.open?path=path/to/bot.bot');

    expect(dispatchSpy).toHaveBeenCalled();
  });
});
