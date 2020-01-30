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
import * as path from 'path';

import { bot, SharedConstants } from '@bfemulator/app-shared';
import * as BotActions from '@bfemulator/app-shared/built/state/actions/botActions';
import {
  BotConfigWithPathImpl,
  CommandRegistry,
  CommandServiceImpl,
  CommandServiceInstance,
} from '@bfemulator/sdk-shared';
import { BotConfiguration } from 'botframework-config';
import { ServiceTypes } from 'botframework-config/lib/schema';
import { combineReducers, createStore } from 'redux';

import { RootState, store } from '../state/store';
import { BotHelpers } from '../botHelpers';
import { Emulator } from '../emulator';
import { botProjectFileWatcher, chatWatcher, transcriptsWatcher } from '../watchers';
import { TelemetryService } from '../telemetry';
import { CredentialManager } from '../credentialManager';

import { BotCommands } from './botCommands';

const mockBotConfig = BotConfiguration;
let mockStore;
(store as any).getStore = function() {
  return mockStore || (mockStore = createStore(combineReducers({ bot })));
};

const mockBot = BotConfigWithPathImpl.fromJSON({
  path: path.normalize('some/path.bot'),
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

jest.mock('../botHelpers', () => ({
  BotHelpers: {
    saveBot: async () => void 0,
    toSavableBot: () => mockBotConfig.fromJSON(mockBot),
    patchBotsJson: async () => true,
    pathExistsInRecentBots: () => true,
    getBotInfoByPath: () => ({ secret: 'secret' }),
    loadBotWithRetry: () => mockBot,
    getActiveBot: () => mockBot,
    removeBotFromList: async () => true,
  },
}));

jest.mock('electron', () => ({
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

jest.mock('../utils/ensureStoragePath', () => ({
  ensureStoragePath: () => '',
}));
const mockEmulator = {
  server: {
    state: {
      endpoints: {
        clear: jest.fn(),
        set: jest.fn(),
      },
    },
  },
};
jest.mock('../emulator', () => ({
  Emulator: {
    getInstance: () => mockEmulator,
  },
}));
jest.mock('../main', () => ({
  mainWindow: {
    commandService: {
      call: async () => true,
      remoteCall: async () => true,
    },
  },
  emulatorApplication: {
    mainBrowserWindow: {
      webContents: {
        send: () => null,
      },
    },
  },
}));

const mockOn = { on: () => mockOn, close: () => void 0 };
jest.mock('chokidar', () => ({
  watch: () => ({
    on: () => mockOn,
  }),
}));

const { Bot } = SharedConstants.Commands;
describe('The botCommands', () => {
  let mockTrackEvent;
  const trackEventBackup = TelemetryService.trackEvent;
  let registry: CommandRegistry;
  let commandService: CommandServiceImpl;

  beforeAll(() => {
    new BotCommands();
    const decorator = CommandServiceInstance();
    const descriptor = decorator({ descriptor: {} }, 'none') as any;
    commandService = descriptor.descriptor.get();
    commandService.remoteCall = () => Promise.resolve(true) as any;
    registry = commandService.registry;
  });

  beforeEach(() => {
    mockTrackEvent = jest.fn(() => Promise.resolve());
    TelemetryService.trackEvent = mockTrackEvent;
  });

  afterAll(() => {
    TelemetryService.trackEvent = trackEventBackup;
  });

  it('should create/save a new bot', async () => {
    const botToSave = BotConfigWithPathImpl.fromJSON(mockBot as any);
    const patchBotInfoSpy = jest.spyOn(BotHelpers, 'patchBotsJson');
    const saveBotSpy = jest.spyOn(BotHelpers, 'saveBot');
    const setPasswordSpy = jest.spyOn(CredentialManager, 'setPassword').mockResolvedValueOnce(null);

    const mockBotInfo = {
      path: path.normalize(botToSave.path),
      displayName: 'AuthBot',
      chatsPath: path.normalize('some/dialogs'),
      transcriptsPath: path.normalize('some/transcripts'),
    };
    const command = registry.getCommand(Bot.Create);
    const result = await command(botToSave, 'secret');
    expect(patchBotInfoSpy).toHaveBeenCalledWith(botToSave.path, mockBotInfo);
    expect(saveBotSpy).toHaveBeenCalledWith(botToSave, 'secret');
    expect(result).toEqual(botToSave);
    expect(mockTrackEvent).toHaveBeenCalledWith('bot_create', {
      path: mockBotInfo.path,
      hasSecret: true,
    });
    expect(setPasswordSpy).toHaveBeenCalledWith(mockBotInfo.path, 'secret');
  });

  it('should open a bot and set the default transcript and chat path if none exists', async () => {
    const mockBotInfo = {
      secret: 'secret',
      transcriptsPath: '',
      chatsPath: '',
    };
    const patchBotsJsonSpy = jest.spyOn(BotHelpers, 'patchBotsJson');
    const pathExistsInRecentBotsSpy = jest.spyOn(BotHelpers, 'pathExistsInRecentBots').mockReturnValue(true);
    const getBotInfoByPathSpy = jest.spyOn(BotHelpers, 'getBotInfoByPath').mockReturnValue(mockBotInfo);
    const loadBotWithRetrySpy = jest.spyOn(BotHelpers, 'loadBotWithRetry').mockResolvedValue(mockBot);
    const command = registry.getCommand(Bot.Open);
    const botPath = path.normalize('bot/path');
    const result = await command(botPath, 'secret');

    expect(pathExistsInRecentBotsSpy).toHaveBeenCalledWith(botPath);
    expect(getBotInfoByPathSpy).toHaveBeenCalledWith(botPath);
    expect(loadBotWithRetrySpy).toHaveBeenCalledWith(botPath, 'secret');
    expect(patchBotsJsonSpy).toHaveBeenCalledWith(botPath, {
      secret: 'secret',
      transcriptsPath: path.normalize('bot/transcripts'),
      chatsPath: path.normalize('bot/dialogs'),
    });
    expect(result).toEqual(mockBot);
    expect(mockBotInfo.transcriptsPath).toBe(path.normalize('bot/transcripts'));
    expect(mockBotInfo.chatsPath).toBe(path.normalize('bot/dialogs'));
  });

  it('should set the active bot', async () => {
    const botProjectFileWatcherSpy = jest.spyOn(botProjectFileWatcher, 'watch');
    const commandServiceSpy = jest.spyOn(commandService, 'call');
    const command = registry.getCommand(Bot.SetActive);
    const result = await command(mockBot);

    expect(botProjectFileWatcherSpy).toHaveBeenCalledWith(mockBot.path);
    expect(commandServiceSpy).toHaveBeenCalledWith(Bot.RestartEndpointService);
    const state: RootState = store.getState();
    expect(state.bot.activeBot).toEqual(mockBot);
    expect(state.bot.currentBotDirectory).toBe('some');
    expect(result).toEqual('some');
  });

  it('should restart the endpoint service', async () => {
    const emulator = Emulator.getInstance();
    store.dispatch(BotActions.setActive(mockBot));
    const clearSpy = jest.spyOn(emulator.server.state.endpoints, 'clear');
    const setSpy = jest.spyOn(emulator.server.state.endpoints, 'set');
    const command = registry.getCommand(Bot.RestartEndpointService);
    const result = await command();

    expect(clearSpy).toHaveBeenCalled();
    expect(setSpy).toHaveBeenCalled();
    expect(result).toBeUndefined();
  });

  it('should add or update the service as expected', async () => {
    const serviceToSave = mockBot.services[0];
    serviceToSave.name = 'A new Name';
    serviceToSave.id = '';
    const remoteCallSpy = jest.spyOn(commandService, 'remoteCall');
    const command = registry.getCommand(Bot.AddOrUpdateService);
    await command(serviceToSave.type, serviceToSave);
    const savedBot = mockBotConfig.fromJSON(store.getState().bot.activeBot);

    expect(savedBot.services[0]).toEqual(serviceToSave);
    expect(serviceToSave.id).not.toEqual('');
    expect(remoteCallSpy).toHaveBeenCalledWith(SharedConstants.Commands.Bot.SetActive, savedBot, savedBot.getPath());
  });

  it('should throw when updating a service fails', async () => {
    const serviceToUpdate = mockBot.services[0];
    jest.spyOn(store, 'dispatch').mockImplementationOnce(() => {
      throw new Error('');
    });
    const handler = registry.getCommand(Bot.AddOrUpdateService);
    let threw = false;
    try {
      await handler(serviceToUpdate.type, serviceToUpdate);
    } catch (e) {
      threw = true;
    }
    jest.restoreAllMocks();
    expect(threw).toBeTruthy();
  });

  it('should throw when saving a new service and the service types do not match', async () => {
    const serviceToSave = JSON.parse(JSON.stringify(mockBot.services[0]));
    serviceToSave.id = null;
    serviceToSave.type = ServiceTypes.AppInsights;
    const handler = registry.getCommand(Bot.AddOrUpdateService);
    let threw = false;
    try {
      await handler(ServiceTypes.Luis, serviceToSave);
    } catch (e) {
      threw = true;
      expect(e.message).toEqual('serviceType does not match');
    }
    expect(threw).toBeTruthy();
  });

  it('should remove a service as expected', async () => {
    const serviceToRemove = mockBot.services[0];
    const remoteCallSpy = jest.spyOn(commandService, 'remoteCall');
    const handler = registry.getCommand(Bot.RemoveService);
    await handler(serviceToRemove.type, serviceToRemove.id);
    const savedBot = mockBotConfig.fromJSON(store.getState().bot.activeBot);
    expect(savedBot.services.length).toBe(0);

    expect(remoteCallSpy).toHaveBeenCalledWith(SharedConstants.Commands.Bot.SetActive, savedBot, savedBot.getPath());
  });

  it('should throw when removing a service fails', async () => {
    const serviceToRemove = mockBot.services[0];
    jest.spyOn(store, 'dispatch').mockImplementationOnce(() => {
      throw new Error('');
    });
    const handler = registry.getCommand(Bot.RemoveService);
    let threw = false;
    try {
      await handler(serviceToRemove.type, serviceToRemove.id);
    } catch (e) {
      threw = true;
    }
    jest.restoreAllMocks();
    expect(threw).toBeTruthy();
  });

  it('should patch the bots list and watch for chat and transcript changes', async () => {
    const mockBotInfo = {
      path: path.normalize('this/is/my.json'),
      displayName: 'AuthBot',
      secret: 'secret',
    };
    const transcriptWatchSpy = jest.spyOn(transcriptsWatcher, 'watch');
    const chatWatcherSpy = jest.spyOn(chatWatcher, 'watch');

    const handler = registry.getCommand(SharedConstants.Commands.Bot.PatchBotList);
    await handler(mockBotInfo.path, mockBotInfo);
    expect(transcriptWatchSpy).toHaveBeenCalledWith(path.normalize('this/is/transcripts'));
    expect(chatWatcherSpy).toHaveBeenCalledWith(path.normalize('this/is/dialogs'));
  });

  it('should remove a bot from the list', async () => {
    const callSpy = jest.spyOn(commandService, 'call').mockResolvedValue(true);
    const handler = registry.getCommand(SharedConstants.Commands.Bot.RemoveFromBotList);
    const removeBotFromListSpy = jest.spyOn(BotHelpers, 'removeBotFromList').mockResolvedValue(true);
    await handler('some/bot/path.json');
    expect(callSpy).toHaveBeenCalledWith('shell:showExplorer-message-box', true, {
      buttons: ['Cancel', 'OK'],
      cancelId: 0,
      defaultId: 1,
      message: 'Remove Bot some/bot/path.json from bots list. Are you sure?',
      type: 'question',
    });
    expect(removeBotFromListSpy).toHaveBeenCalledWith('some/bot/path.json');
  });

  it('should close the bot', async () => {
    const handler = registry.getCommand(SharedConstants.Commands.Bot.Close);
    const dispatchSpy = jest.spyOn(store, 'dispatch');
    await handler();
    expect(dispatchSpy).toHaveBeenCalledWith(BotActions.closeBot());
  });
});
