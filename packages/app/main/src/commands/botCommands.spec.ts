import { SharedConstants } from '@bfemulator/app-shared';
import { BotConfigWithPathImpl } from '@bfemulator/sdk-shared';
import { CommandRegistryImpl } from '@bfemulator/sdk-shared/built';
import { BotConfiguration } from 'botframework-config';
import * as path from 'path';
import { combineReducers, createStore } from 'redux';
import { setActive } from '../botData/actions/botActions';
import { bot } from '../botData/reducers/bot';
import { State } from '../botData/state';
import * as store from '../botData/store';
import * as helpers from '../botHelpers';
import { emulator } from '../emulator';
import { mainWindow } from '../main';
import { botProjectFileWatcher } from '../watchers';
import { registerCommands } from './botCommands';

const mockBotConfig = BotConfiguration;
let mockStore;
(store as any).getStore = function () {
  return mockStore || (mockStore = createStore(combineReducers({ bot })));
};

jest.mock('../botHelpers', () => ({
    saveBot: async () => void(0),
    toSavableBot: () => mockBotConfig.fromJSON(mockBot),
    patchBotsJson: async () => true,
    pathExistsInRecentBots: () => true,
    getBotInfoByPath: () => ({ secret: 'secret' }),
    loadBotWithRetry: () => mockBot,
    getActiveBot: () => mockBot
  }
));
jest.mock('../utils/ensureStoragePath', () => ({
  ensureStoragePath: () => ''
}));
jest.mock('../emulator', () => ({
  emulator: {
    framework: {
      server: {
        botEmulator: {
          facilities: {
            endpoints: {
              reset: () => null,
              push: () => null
            }
          }
        }
      }
    }
  }
}));
const mockCommandRegistry = new CommandRegistryImpl();
const mockBot = BotConfigWithPathImpl.fromJSON({
  'path': 'some/path',
  'name': 'AuthBot',
  'description': '',
  'padlock': '',
  'services': [
    {
      'appId': '4f8fde3f-48d3-4d8a-a954-393efe39809e',
      'id': 'cded37c0-83f2-11e8-ac6d-b7172cd24b28',
      'type': 'endpoint',
      'appPassword': 'REDACTED',
      'endpoint': 'http://localhost:55697/api/messages',
      'name': 'authsample'
    }
  ]
} as any);
registerCommands(mockCommandRegistry);
jest.mock('../main', () => ({
  mainWindow: {
    commandService: {
      call: async () => true,
      remoteCall: async () => true
    }
  }
}));

const mockOn = { on: () => mockOn };
jest.mock('chokidar', () => ({
  watch: () => ({
    on: () => mockOn
  })
}));

const { Bot } = SharedConstants.Commands;
describe('The botCommands', () => {

  it('should create/save a new bot', async () => {
    const botToSave = BotConfigWithPathImpl.fromJSON(mockBot as any);
    const patchBotInfoSpy = jest.spyOn((helpers as any).default, 'patchBotsJson');
    const saveBotSpy = jest.spyOn((helpers as any).default, 'saveBot');

    const mockBotInfo = {
      path: botToSave.path,
      displayName: 'AuthBot',
      secret: 'secret',
      chatsPath: path.normalize('some/dialogs'),
      transcriptsPath: path.normalize('some/transcripts')
    };
    const command = mockCommandRegistry.getCommand(Bot.Create);
    const result = await command.handler(botToSave, 'secret');
    expect(patchBotInfoSpy).toHaveBeenCalledWith(botToSave.path, mockBotInfo);
    expect(saveBotSpy).toHaveBeenCalledWith(botToSave);
    expect(result).toEqual(botToSave);
  });

  it('should open a bot and set the default transcript and chat path if none exists', async () => {
    const mockBotInfo = { secret: 'secret', transcriptsPath: '', chatsPath: '' };
    const syncWithClientSpy = jest.spyOn(mainWindow.commandService, 'remoteCall');
    const pathExistsInRecentBotsSpy = jest
      .spyOn((helpers as any).default, 'pathExistsInRecentBots').mockReturnValue(true);
    const getBotInfoByPathSpy = jest.spyOn((helpers as any).default, 'getBotInfoByPath').mockReturnValue(mockBotInfo);
    const loadBotWithRetrySpy = jest.spyOn((helpers as any).default, 'loadBotWithRetry').mockResolvedValue(mockBot);
    const command = mockCommandRegistry.getCommand(Bot.Open);
    const result = await command.handler('bot/path', 'secret');

    expect(pathExistsInRecentBotsSpy).toHaveBeenCalledWith('bot/path');
    expect(getBotInfoByPathSpy).toHaveBeenCalledWith('bot/path');
    expect(loadBotWithRetrySpy).toHaveBeenCalledWith('bot/path', 'secret');
    expect(result).toEqual(mockBot);
    expect(mockBotInfo.transcriptsPath).toBe(path.normalize('bot/transcripts'));
    expect(mockBotInfo.chatsPath).toBe(path.normalize('bot/dialogs'));
    expect(syncWithClientSpy).toHaveBeenCalled();
  });

  it('should set the active bot', async () => {
    const botProjectFileWatcherSpy = jest.spyOn(botProjectFileWatcher, 'watch');
    const commandServiceSpy = jest.spyOn(mainWindow.commandService, 'call');
    const command = mockCommandRegistry.getCommand(Bot.SetActive);
    const result = await command.handler(mockBot);

    expect(botProjectFileWatcherSpy).toHaveBeenCalledWith(mockBot.path);
    expect(commandServiceSpy).toHaveBeenCalledWith(Bot.RestartEndpointService);
    const state: State = store.getStore().getState() as State;
    expect(state.bot.activeBot).toEqual(mockBot);
    expect(state.bot.currentBotDirectory).toBe('some');
    expect(result).toEqual('some');
  });

  it('should restart the endpoint service', async () => {
    store.getStore().dispatch(setActive(mockBot));
    const resetSpy = jest.spyOn(emulator.framework.server.botEmulator.facilities.endpoints, 'reset');
    const pushSpy = jest.spyOn(emulator.framework.server.botEmulator.facilities.endpoints, 'push');
    const command = mockCommandRegistry.getCommand(Bot.RestartEndpointService);
    const result = await command.handler();

    expect(resetSpy).toHaveBeenCalled();
    expect(pushSpy).toHaveBeenCalled();
    expect(result).toBeUndefined();
  });

  it('should add or update the service as expected', async () => {
    const serviceToSave = mockBot.services[0];
    serviceToSave.name = 'A new Name';
    serviceToSave.id = '';
    const remoteCallSpy = jest.spyOn(mainWindow.commandService, 'remoteCall');
    const command = mockCommandRegistry.getCommand(Bot.AddOrUpdateService).handler;
    await command(serviceToSave.type, serviceToSave);
    const savedBot = mockBotConfig.fromJSON(store.getStore().getState().bot.activeBot);

    expect(savedBot.services[0]).toEqual(serviceToSave);
    expect(serviceToSave.id).not.toEqual('');
    expect(remoteCallSpy).toHaveBeenCalledWith(SharedConstants.Commands.Bot.SetActive,
      savedBot,
      savedBot.getPath());
  });
});
