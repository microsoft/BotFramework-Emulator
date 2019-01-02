import { SharedConstants } from '@bfemulator/app-shared';
import { BotConfigWithPathImpl, CommandRegistryImpl } from '@bfemulator/sdk-shared';
import * as BotActions from '../data/action/botActions';
import { bot } from '../data/reducer/bot';
import { resources } from '../data/reducer/resourcesReducer';
import { CommandServiceImpl } from '../platform/commands/commandServiceImpl';
import { ActiveBotHelper } from '../ui/helpers/activeBotHelper';
import { registerCommands } from './botCommands';
import { combineReducers, createStore } from 'redux';

const mockBotInfo = {
  path: 'some/path.bot',
  displayName: 'MyBot',
  secret: 'secret'
};

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

let mockStore = createStore(combineReducers({ bot, resources }), {
  bot: { botFiles: [mockBotInfo] }
});

jest.mock('../data/store', () => ({
  get store() {
    return mockStore;
  }
}));
jest.mock('../ui/dialogs/', () => ({}));

describe('The bot commands', () => {
  let registry: CommandRegistryImpl;
  beforeAll(() => {
    registry = new CommandRegistryImpl();
    registerCommands(registry);
  });

  it('should make the appropriate calls to switch bots', () => {
    const spy = jest.spyOn(ActiveBotHelper, 'switchBots');
    const { handler } = registry.getCommand(SharedConstants.Commands.Bot.Switch);
    handler({});
    expect(spy).toHaveBeenCalledWith({});
  });

  it('should make the appropriate calls to close a bot', () => {
    const spy = jest.spyOn(ActiveBotHelper, 'confirmAndCloseBot');
    const { handler } = registry.getCommand(SharedConstants.Commands.Bot.Close);
    handler();
    expect(spy).toHaveBeenCalled();
  });

  it('should make the appropriate calls to load a bot when the bot does not yet exist', () => {
    const createSpy = jest.spyOn(ActiveBotHelper, 'confirmAndCreateBot');
    const { handler } = registry.getCommand(SharedConstants.Commands.Bot.Load);
    handler({});

    expect(createSpy).toHaveBeenCalledWith({}, '');
  });

  it('should make the appropriate calls to load a bot when the bot exists', () => {
    const switchSpy = jest.spyOn(ActiveBotHelper, 'switchBots');
    const { handler } = registry.getCommand(SharedConstants.Commands.Bot.Load);
    handler({ path: 'some/path.bot' });

    expect(switchSpy).toHaveBeenCalledWith({ path: 'some/path.bot' });
  });

  it('should make the appropriate calls to sync the bot list', () => {
    const dispatchSpy = jest.spyOn(mockStore, 'dispatch');
    const remoteCallSpy = jest.spyOn(CommandServiceImpl, 'remoteCall');
    const { handler } = registry.getCommand(SharedConstants.Commands.Bot.SyncBotList);
    handler([{}]);

    expect(dispatchSpy).toHaveBeenCalledWith(BotActions.load([{}]));
    expect(remoteCallSpy).toHaveBeenCalledWith(SharedConstants.Commands.Electron.UpdateFileMenu);
  });

  it('should make the appropriate call when setting the active bot', async () => {
    const remoteCallArgs = [];
    CommandServiceImpl.remoteCall = async (...args: any[]) => {
      remoteCallArgs.push(args);
      return true;
    };
    const { handler } = registry.getCommand(SharedConstants.Commands.Bot.SetActive);
    await handler(mockBot, mockBotInfo.path);
    const state: any = mockStore.getState();
    expect(state.bot.activeBot).toEqual(mockBot);
    expect(remoteCallArgs[0]).toEqual(['menu:update-file-menu']);
    expect(remoteCallArgs[1]).toEqual(['electron:set-title-bar', 'AuthBot']);
  });

  it('should dispatch the appropriate actions when updating the list of transcript files on disc', () => {
    const { handler: transcriptFilesUpdated } = registry.getCommand(SharedConstants.Commands.Bot.TranscriptFilesUpdated);
    const { handler: transcriptPathUpdated } = registry.getCommand(SharedConstants.Commands.Bot.TranscriptsPathUpdated);
    transcriptFilesUpdated([{ path: 'transcript/path.transcript' }]);
    transcriptPathUpdated('transcript/');
    const state: any = mockStore.getState();
    expect(state.resources.transcripts).toEqual([{ path: 'transcript/path.transcript' }]);
    expect(state.resources.transcriptsPath).toBe('transcript/');
  });

  it('should dispatch the appropriate actions when updating the list of chat files on disc', () => {
    const { handler: chatFilesUpdated } = registry.getCommand(SharedConstants.Commands.Bot.ChatFilesUpdated);
    const { handler: chatPathUpdated } = registry.getCommand(SharedConstants.Commands.Bot.ChatsPathUpdated);
    chatFilesUpdated([{ path: 'chat/path.chat' }]);
    chatPathUpdated('chat/');
    const state: any = mockStore.getState();
    expect(state.resources.chats).toEqual([{ path: 'chat/path.chat' }]);
    expect(state.resources.chatsPath).toBe('chat/');
  });

});
