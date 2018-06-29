import { ActiveBotHelper } from './activeBotHelper';
import { CommandServiceImpl } from '../../platform/commands/commandServiceImpl';
import { hasNonGlobalTabs } from '../../data/editorHelpers';
import store from '../../data/store';
import { getActiveBot } from '../../data/botHelpers';
import { BotConfigWithPath } from '@bfemulator/sdk-shared';
import { IEndpointService, ServiceType } from 'msbot/bin/schema';
import { SharedConstants } from '@bfemulator/app-shared';

describe('ActiveBotHelper tests', () => {
  let backupCommandServiceImpl;
  let backupHasNonGlobalTabs;
  let backupStore;
  let backupGetActiveBot;

  let preserveImports = () => {
    backupCommandServiceImpl = CommandServiceImpl;
    backupHasNonGlobalTabs = hasNonGlobalTabs;
    backupStore = store;
    backupGetActiveBot = getActiveBot;
  };

  let restoreImports = () => {
    (CommandServiceImpl as any) = backupCommandServiceImpl;
    (hasNonGlobalTabs as any) = backupHasNonGlobalTabs;
    (store as any) = backupStore;
    (getActiveBot as any) = backupGetActiveBot;
  };

  beforeEach(preserveImports);
  afterEach(restoreImports);

  it('confirmSwitchBot() functionality', async () => {
    
    (hasNonGlobalTabs as any) = jest.fn().mockReturnValueOnce(true).mockReturnValueOnce(false);
    (CommandServiceImpl as any) = ({ remoteCall: jest.fn().mockResolvedValue('done') });

    const result1 = await ActiveBotHelper.confirmSwitchBot();
    expect(result1).toBe('done');

    const result2 = await ActiveBotHelper.confirmSwitchBot();
    expect(result2).toBe(true);
  });

  it('confirmCloseBot() functionality', async () => {

    (hasNonGlobalTabs as any) = jest.fn().mockReturnValueOnce(true).mockReturnValueOnce(false);

    (CommandServiceImpl as any) = ({ remoteCall: jest.fn().mockResolvedValue('done') });

    const result1 = await ActiveBotHelper.confirmCloseBot();
    expect(result1).toBe('done');

    const result2 = await ActiveBotHelper.confirmCloseBot();
    expect(result2).toBe(true);
  });

  it('closeActiveBot() functionality', async () => {

    const mockRemoteCall1 = jest.fn().mockResolvedValue(true);
    (CommandServiceImpl as any) = ({ remoteCall: mockRemoteCall1 });
    (store as any) = ({ dispatch: () => null });

    await ActiveBotHelper.closeActiveBot();
    expect(mockRemoteCall1).toHaveBeenCalledTimes(2);

    const mockRemoteCall2 = jest.fn().mockRejectedValue('err');
    (CommandServiceImpl as any) = ({ remoteCall: mockRemoteCall2 });

    expect(ActiveBotHelper.closeActiveBot()).rejects.toEqual(new Error('Error while closing active bot: err'));
  });

  it('botAlreadyOpen() functionality', async () => {

    const mockRemoteCall = jest.fn().mockResolvedValue(true);
    (CommandServiceImpl as any) = ({ remoteCall: mockRemoteCall });

    await ActiveBotHelper.botAlreadyOpen();

    expect(mockRemoteCall).toHaveBeenCalledTimes(1);
  });

  it('browseForBotFile() functionality', async () => {

    const mockRemoteCall = jest.fn().mockResolvedValue(true);
    (CommandServiceImpl as any) = ({ remoteCall: mockRemoteCall });

    await ActiveBotHelper.browseForBotFile();

    expect(mockRemoteCall).toHaveBeenCalledTimes(1);
  });

  it('confirmAndCloseBot() functionality', async () => {

    let backupConfirmCloseBot = ActiveBotHelper.confirmCloseBot;
    let backupCloseActiveBot = ActiveBotHelper.closeActiveBot;

    (getActiveBot as any) = jest.fn().mockReturnValueOnce(null).mockReturnValue({});
    ActiveBotHelper.confirmCloseBot = jest.fn().mockResolvedValue({});
    ActiveBotHelper.closeActiveBot = jest.fn().mockResolvedValue(null);

    // test short-circuit if no active bot
    await ActiveBotHelper.confirmAndCloseBot();
    expect(ActiveBotHelper.confirmCloseBot).not.toBeCalled();

    await ActiveBotHelper.confirmAndCloseBot();
    expect(ActiveBotHelper.confirmCloseBot).toHaveBeenCalled();
    expect(ActiveBotHelper.closeActiveBot).toHaveBeenCalled();

    // test catch on promise
    ActiveBotHelper.confirmCloseBot = jest.fn().mockRejectedValue('err');
    expect(ActiveBotHelper.confirmAndCloseBot()).rejects.toEqual(new Error('Error while closing active bot: err'));

    ActiveBotHelper.confirmCloseBot = backupConfirmCloseBot;
    ActiveBotHelper.closeActiveBot = backupCloseActiveBot;
  });

  it('setActiveBot() functionality', async () => {
    const bot: BotConfigWithPath = {
      name: 'someBot',
      description: '',
      path: 'somePath',
      secretKey: null,
      services: []
    };

    const mockDispatch = jest.fn((...args: any[]) => null);
    (store as any) = ({ dispatch: mockDispatch });

    let mockRemoteCall = jest.fn().mockResolvedValue({});
    (CommandServiceImpl as any) = ({ remoteCall: mockRemoteCall });

    await ActiveBotHelper.setActiveBot(bot);
    expect(mockDispatch).toHaveBeenCalledTimes(2);
    expect(mockRemoteCall).toHaveBeenCalledTimes(3);
    expect(mockRemoteCall).toHaveBeenCalledWith(SharedConstants.Commands.Bot.SetActive, bot);

    mockRemoteCall = jest.fn().mockRejectedValueOnce('error');
    (CommandServiceImpl as any) = ({ remoteCall: mockRemoteCall });
    expect(ActiveBotHelper.setActiveBot(bot)).rejects.toEqual( new Error('Error while setting active bot: error'));
  });

  it('confirmAndCreateBot() functionality', async () => {
    const backupConfirmSwitchBot = ActiveBotHelper.confirmSwitchBot;
    ActiveBotHelper.confirmSwitchBot = () => new Promise((resolve, reject) => resolve(true));

    const backupSetActiveBot = ActiveBotHelper.setActiveBot;
    ActiveBotHelper.setActiveBot = (activeBot: any) => new Promise((resolve, reject) => resolve());

    const mockDispatch = jest.fn().mockReturnValue(null);
    (store as any) = ({ dispatch: mockDispatch });

    const endpoint: IEndpointService = {
      appId: 'someAppId',
      appPassword: '',
      type: ServiceType.Endpoint,
      endpoint: 'someEndpoint',
      id: 'someEndpoint',
      name: 'myEndpoint'
    };
    const bot: BotConfigWithPath = {
      name: 'someBot',
      description: '',
      secretKey: null,
      path: 'somePath',
      services: [endpoint]
    };
    let mockRemoteCall = jest.fn().mockResolvedValue(bot);
    const mockCall = jest.fn().mockResolvedValue(null);
    (CommandServiceImpl as any) = ({ remoteCall: mockRemoteCall, call: mockCall });

    await ActiveBotHelper.confirmAndCreateBot(bot, 'someSecret');
    expect(mockDispatch).toHaveBeenCalledTimes(4);
    expect(mockCall).toHaveBeenCalledWith('livechat:new', endpoint);
    expect(mockRemoteCall).toHaveBeenCalledWith(SharedConstants.Commands.Bot.Create, bot, 'someSecret');

    mockRemoteCall = jest.fn().mockRejectedValue('err');
    (CommandServiceImpl as any) = ({ remoteCall: mockRemoteCall, call: mockCall });

    expect(ActiveBotHelper.confirmAndCreateBot(bot, 'someSecret'))
      .rejects.toEqual(new Error('Error during bot create: err'));

    ActiveBotHelper.confirmSwitchBot = backupConfirmSwitchBot;
    ActiveBotHelper.setActiveBot = backupSetActiveBot;
  });

  it('confirmAndOpenBotFromFile() functionality', async () => {
    const backupBrowseForBotFile = ActiveBotHelper.browseForBotFile;
    const backupBotAlreadyOpen = ActiveBotHelper.botAlreadyOpen;
    const backupConfirmSwitchBot = ActiveBotHelper.confirmSwitchBot;

    const bot: BotConfigWithPath = {
      name: 'someBot',
      description: '',
      secretKey: null,
      path: 'somePath',
      services: []
    };

    const mockDispatch = jest.fn().mockReturnValue(null);
    (store as any) = ({ dispatch: mockDispatch });

    // opening a bot that's already open
    ActiveBotHelper.browseForBotFile = () => new Promise((resolve, reject) => resolve('somePath'));
    (getActiveBot as any) = () => bot;
    ActiveBotHelper.botAlreadyOpen = () => null;

    await ActiveBotHelper.confirmAndOpenBotFromFile();
    expect(mockDispatch).not.toHaveBeenCalled();

    // opening a bot that isn't already open
    ActiveBotHelper.browseForBotFile = () => new Promise((resolve, reject) => resolve('someOtherPath'));
    ActiveBotHelper.confirmSwitchBot = () => new Promise((resolve, reject) => resolve(true));

    const mockRemoteCall = jest.fn().mockResolvedValueOnce(bot).mockResolvedValue(null);
    const mockCall = jest.fn().mockResolvedValue(null);
    (CommandServiceImpl as any) = ({ remoteCall: mockRemoteCall, call: mockCall });

    await ActiveBotHelper.confirmAndOpenBotFromFile();
    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(mockCall).toHaveBeenCalledWith('bot:load', bot);
    expect(mockRemoteCall).toHaveBeenCalledWith(SharedConstants.Commands.Bot.Open, 'someOtherPath');
    expect(mockRemoteCall).toHaveBeenCalledWith(SharedConstants.Commands.Bot.SetActive, bot);

    ActiveBotHelper.browseForBotFile = backupBrowseForBotFile;
    ActiveBotHelper.botAlreadyOpen = backupBotAlreadyOpen;
    ActiveBotHelper.confirmSwitchBot = backupConfirmSwitchBot;
  });

  it('confirmAndSwitchBots() functionality', async () => {
    const backupBotAlreadyOpen = ActiveBotHelper.botAlreadyOpen;
    const backupConfirmSwitchBot = ActiveBotHelper.confirmSwitchBot;
    const backupSetActiveBot = ActiveBotHelper.setActiveBot;

    const endpoint: IEndpointService = {
      appId: 'someAppId',
      appPassword: '',
      type: ServiceType.Endpoint,
      endpoint: 'someEndpoint',
      id: 'someEndpoint',
      name: 'myEndpoint'
    };
    const bot: BotConfigWithPath = {
      name: 'someBot',
      description: '',
      secretKey: null,
      path: 'somePath',
      services: [endpoint]
    };
    const otherBot: BotConfigWithPath = { ...bot, path: 'someOtherPath' };

    const mockDispatch = jest.fn(() => null);
    (store as any) = ({ dispatch: mockDispatch });

    // switching to a bot that's already open
    (getActiveBot as any) = () => bot;
    ActiveBotHelper.botAlreadyOpen = () => new Promise((resolve, reject) => resolve(null));

    await ActiveBotHelper.confirmAndSwitchBots(bot);
    expect(mockDispatch).not.toHaveBeenCalled();

    // switching to a bot that's not open with an endpoint
    (getActiveBot as any) = () => otherBot;
    const mockRemoteCall = jest.fn().mockResolvedValue(bot);
    const mockCall = jest.fn().mockResolvedValue(null);
    (CommandServiceImpl as any) = ({ call: mockCall, remoteCall: mockRemoteCall });
    ActiveBotHelper.confirmSwitchBot = () => new Promise((resolve, reject) => resolve(true));
    ActiveBotHelper.setActiveBot = (arg: any) => new Promise((resolve, reject) => resolve(null));

    await ActiveBotHelper.confirmAndSwitchBots(bot);
    expect(mockCall).toHaveBeenCalledWith('livechat:new', endpoint);
    expect(mockDispatch).toHaveBeenCalledTimes(3);
    mockDispatch.mockClear();
    mockCall.mockClear();

    // switching to a bot with only the bot path available
    await ActiveBotHelper.confirmAndSwitchBots('someBotPath');
    expect(mockRemoteCall).toHaveBeenCalledWith(SharedConstants.Commands.Bot.Open, 'someBotPath');
    mockCall.mockClear();
    mockDispatch.mockClear();

    // switching to a bot with an endpoint with endpoint overrides
    bot.overrides = {
      endpoint: {
        endpoint: 'someOverride'
      }
    };
    await ActiveBotHelper.confirmAndSwitchBots(bot);
    expect(mockCall).toHaveBeenCalledWith('livechat:new', { ...endpoint, endpoint: 'someOverride' });
    mockCall.mockClear();

    // switching to a bot with multiple endpoints, with endpoint overrides including an endpoint id
    const secondEndpoint: IEndpointService = { ...endpoint, id: 'someOtherEndpoint' };
    bot.services.push(secondEndpoint);
    bot.overrides = {
      endpoint: {
        endpoint: 'someOtherOverride',
        id: 'someOtherEndpoint'
      }
    };
    await ActiveBotHelper.confirmAndSwitchBots(bot);
    expect(mockCall).toHaveBeenCalledWith('livechat:new', { ...secondEndpoint, endpoint: 'someOtherOverride', });

    ActiveBotHelper.botAlreadyOpen = backupBotAlreadyOpen;
    ActiveBotHelper.confirmSwitchBot = backupConfirmSwitchBot;
    ActiveBotHelper.setActiveBot = backupSetActiveBot;
  });
});
