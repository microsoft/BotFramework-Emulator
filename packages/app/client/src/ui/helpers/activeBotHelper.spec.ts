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
import { BotConfigWithPath } from '@bfemulator/sdk-shared';
import { IEndpointService, ServiceTypes } from 'botframework-config/lib/schema';
import { CommandServiceImpl, CommandServiceInstance } from '@bfemulator/sdk-shared';

import * as botHelpers from '../../state/helpers/botHelpers';
import * as editorHelpers from '../../state/helpers/editorHelpers';
import { store } from '../../state/store';

import { ActiveBotHelper } from './activeBotHelper';

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

describe('ActiveBotHelper tests', () => {
  let commandService: CommandServiceImpl;

  beforeAll(() => {
    const decorator = CommandServiceInstance();
    const descriptor = decorator({ descriptor: {} }, 'none') as any;
    commandService = descriptor.descriptor.get();
  });

  it('confirmSwitchBot() functionality', async () => {
    (editorHelpers as any).hasNonGlobalTabs = jest
      .fn()
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);
    commandService.remoteCall = jest.fn().mockResolvedValue('done');

    const result1 = await ActiveBotHelper.confirmSwitchBot();
    expect(result1).toBe('done');

    const result2 = await ActiveBotHelper.confirmSwitchBot();
    expect(result2).toBe(true);
  });

  it('confirmCloseBot() functionality', async () => {
    (editorHelpers as any).hasNonGlobalTabs = jest
      .fn()
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);

    commandService.remoteCall = jest.fn().mockResolvedValue('done');

    const result1 = await ActiveBotHelper.confirmCloseBot();
    expect(result1).toBe('done');

    const result2 = await ActiveBotHelper.confirmCloseBot();
    expect(result2).toBe(true);
  });

  it('closeActiveBot() functionality', async () => {
    const mockDispatch = jest.fn();
    const mockRemoteCall1 = jest.fn().mockResolvedValue(true);
    commandService.remoteCall = mockRemoteCall1;
    (store as any).dispatch = mockDispatch;

    await ActiveBotHelper.closeActiveBot();
    expect(mockRemoteCall1).toHaveBeenCalledTimes(2);

    const mockRemoteCall2 = jest.fn().mockRejectedValue('err');
    commandService.remoteCall = mockRemoteCall2;

    await ActiveBotHelper.closeActiveBot();
    expect(mockDispatch).toBeCalledTimes(2);

    expect(mockDispatch).toBeCalledWith({
      payload: {},
      type: 'BOT/CLOSE',
    });
    expect(mockDispatch).toBeCalledWith({
      payload: {
        notification: {
          buttons: [],
          id: expect.any(String),
          message: 'Error while closing active bot: err',
          read: false,
          timestamp: expect.any(Number),
          type: 0,
        },
        read: false,
      },
      type: 'NOTIFICATION/BEGIN_ADD',
    });
  });

  it('botAlreadyOpen() functionality', async () => {
    const mockRemoteCall = jest.fn().mockResolvedValue(true);
    commandService.remoteCall = mockRemoteCall;

    await ActiveBotHelper.botAlreadyOpen();

    expect(mockRemoteCall).toHaveBeenCalledTimes(1);
  });

  it('browseForBotFile() functionality', async () => {
    const mockRemoteCall = jest.fn().mockResolvedValue(true);
    commandService.remoteCall = mockRemoteCall;

    await ActiveBotHelper.browseForBotFile();

    expect(mockRemoteCall).toHaveBeenCalledTimes(1);
  });

  it('confirmAndCloseBot() functionality', async () => {
    const backupConfirmCloseBot = ActiveBotHelper.confirmCloseBot;
    const backupCloseActiveBot = ActiveBotHelper.closeActiveBot;

    (botHelpers as any).getActiveBot = jest
      .fn()
      .mockReturnValueOnce(null)
      .mockReturnValue({});
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
    expect(ActiveBotHelper.confirmAndCloseBot()).rejects.toThrow(new Error('Error while closing active bot: err'));

    ActiveBotHelper.confirmCloseBot = backupConfirmCloseBot;
    ActiveBotHelper.closeActiveBot = backupCloseActiveBot;
  });

  it('setActiveBot() functionality', async () => {
    const bot: BotConfigWithPath = {
      name: 'someBot',
      description: '',
      path: 'somePath',
      padlock: null,
      services: [],
      version: '0.1',
    };

    const mockDispatch = jest.fn((...args: any[]) => null);
    (store as any).dispatch = mockDispatch;

    let mockRemoteCall = jest.fn().mockResolvedValue({});
    commandService.remoteCall = mockRemoteCall;

    await ActiveBotHelper.setActiveBot(bot);
    expect(mockDispatch).toHaveBeenCalledTimes(2);
    expect(mockRemoteCall).toHaveBeenCalledTimes(3);
    expect(mockRemoteCall).toHaveBeenCalledWith(SharedConstants.Commands.Bot.SetActive, bot);

    mockRemoteCall = jest.fn().mockRejectedValueOnce('error');
    commandService.remoteCall = mockRemoteCall;
    expect(ActiveBotHelper.setActiveBot(bot)).rejects.toThrow(new Error('Error while setting active bot: error'));
  });

  it('confirmAndCreateBot() functionality', async () => {
    const backupConfirmSwitchBot = ActiveBotHelper.confirmSwitchBot;
    ActiveBotHelper.confirmSwitchBot = () => new Promise((resolve, reject) => resolve(true));

    const backupSetActiveBot = ActiveBotHelper.setActiveBot;
    ActiveBotHelper.setActiveBot = (activeBot: any) => new Promise((resolve, reject) => resolve());

    const mockDispatch = jest.fn().mockReturnValue(null);
    (store as any).dispatch = mockDispatch;
    const endpoint: IEndpointService = {
      appId: 'someAppId',
      appPassword: '',
      type: ServiceTypes.Endpoint,
      endpoint: 'someEndpoint',
      id: 'someEndpoint',
      name: 'myEndpoint',
    };
    const bot: BotConfigWithPath = {
      name: 'someBot',
      description: '',
      padlock: null,
      path: 'somePath',
      services: [endpoint],
      version: '0.1',
    };
    let mockRemoteCall = jest.fn().mockResolvedValue(bot);
    const mockCall = jest.fn().mockResolvedValue(null);
    commandService.remoteCall = mockRemoteCall;
    commandService.call = mockCall;

    await ActiveBotHelper.confirmAndCreateBot(bot, 'someSecret');
    expect(mockDispatch).toHaveBeenCalledTimes(3);
    expect(mockCall).toHaveBeenCalledWith(SharedConstants.Commands.Emulator.NewLiveChat, endpoint);
    expect(mockRemoteCall).toHaveBeenCalledWith(SharedConstants.Commands.Bot.Create, bot, 'someSecret');

    mockRemoteCall = jest.fn().mockRejectedValue('err');
    commandService.remoteCall = mockRemoteCall;
    commandService.call = mockCall;

    expect(ActiveBotHelper.confirmAndCreateBot(bot, 'someSecret')).rejects.toThrow(
      new Error('Error during bot create: err')
    );

    ActiveBotHelper.confirmSwitchBot = backupConfirmSwitchBot;
    ActiveBotHelper.setActiveBot = backupSetActiveBot;
  });

  it('confirmAndOpenBotFromFile() functionality', async () => {
    const backupGetState = store.getState;
    const backupBrowseForBotFile = ActiveBotHelper.browseForBotFile;
    const backupBotAlreadyOpen = ActiveBotHelper.botAlreadyOpen;
    const backupConfirmSwitchBot = ActiveBotHelper.confirmSwitchBot;

    const bot: BotConfigWithPath = {
      name: 'someBot',
      description: '',
      padlock: null,
      path: 'somePath',
      services: [],
      version: '0.1',
    };

    const mockDispatch = jest.fn().mockReturnValue(null);
    (store as any).dispatch = mockDispatch;

    // opening a bot that's already open
    ActiveBotHelper.browseForBotFile = () => new Promise((resolve, reject) => resolve('somePath'));
    (botHelpers as any).getActiveBot = () => bot;
    ActiveBotHelper.botAlreadyOpen = () => null;

    await ActiveBotHelper.confirmAndOpenBotFromFile();
    expect(mockDispatch).not.toHaveBeenCalled();

    // opening a bot that isn't already open
    ActiveBotHelper.browseForBotFile = () => new Promise((resolve, reject) => resolve('someOtherPath'));
    ActiveBotHelper.confirmSwitchBot = () => new Promise((resolve, reject) => resolve(true));

    const mockRemoteCall = jest
      .fn()
      .mockResolvedValueOnce(bot)
      .mockResolvedValue(null);
    const mockCall = jest.fn().mockResolvedValue(null);
    commandService.remoteCall = mockRemoteCall;
    commandService.call = mockCall;

    await ActiveBotHelper.confirmAndOpenBotFromFile();
    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(mockCall).toHaveBeenCalledWith(SharedConstants.Commands.Bot.Load, bot);
    expect(mockRemoteCall).toHaveBeenCalledWith(SharedConstants.Commands.Bot.Open, 'someOtherPath');
    expect(mockRemoteCall).toHaveBeenCalledWith(SharedConstants.Commands.Bot.SetActive, bot);
    expect(mockRemoteCall).toHaveBeenCalledWith(SharedConstants.Commands.Telemetry.TrackEvent, 'bot_open', {
      method: 'file_browse',
      numOfServices: 0,
      source: 'path',
    });

    ActiveBotHelper.browseForBotFile = backupBrowseForBotFile;
    ActiveBotHelper.botAlreadyOpen = backupBotAlreadyOpen;
    ActiveBotHelper.confirmSwitchBot = backupConfirmSwitchBot;
    store.getState = backupGetState;
  });

  it('should throw an error when confirmAndOpenBotFromFile fails', async () => {
    jest.spyOn(ActiveBotHelper, 'browseForBotFile').mockRejectedValueOnce('oh noes!');
    try {
      await ActiveBotHelper.confirmAndOpenBotFromFile('');
      expect(false);
    } catch (e) {
      expect(e).not.toBeNull();
    }
  });

  it('should throw when confirmAndSwitchBots fails', async () => {
    jest.spyOn(commandService, 'call').mockRejectedValueOnce('oh noes!');
    jest.spyOn(botHelpers, 'getActiveBot').mockReturnValueOnce({ path: '' });
    try {
      await ActiveBotHelper.confirmAndSwitchBots('');
      expect(false);
    } catch (e) {
      expect(e).not.toBeNull();
    }
    jest.resetAllMocks();
  });

  it('confirmAndSwitchBots() functionality', async () => {
    const backupBotAlreadyOpen = ActiveBotHelper.botAlreadyOpen;
    const backupConfirmSwitchBot = ActiveBotHelper.confirmSwitchBot;
    const backupSetActiveBot = ActiveBotHelper.setActiveBot;

    const endpoint: IEndpointService = {
      appId: 'someAppId',
      appPassword: '',
      type: ServiceTypes.Endpoint,
      endpoint: 'someEndpoint',
      id: 'someEndpoint',
      name: 'myEndpoint',
    };
    const bot: BotConfigWithPath = {
      name: 'someBot',
      description: '',
      padlock: null,
      path: 'somePath',
      services: [endpoint],
      version: '0.1',
    };
    const otherBot: BotConfigWithPath = { ...bot, path: 'someOtherPath' };

    const mockDispatch = jest.fn(() => null);
    (store as any).dispatch = mockDispatch;

    // switching to a bot that's already open
    (botHelpers.getActiveBot as any) = () => bot;
    ActiveBotHelper.botAlreadyOpen = () => new Promise((resolve, reject) => resolve(null));

    await ActiveBotHelper.confirmAndSwitchBots(bot);

    // switching to a bot that's not open with an endpoint
    (botHelpers.getActiveBot as any) = () => otherBot;
    const mockRemoteCall = jest.fn().mockResolvedValue(bot);
    const mockCall = jest.fn().mockResolvedValue(null);
    commandService.call = mockCall;
    commandService.remoteCall = mockRemoteCall;
    ActiveBotHelper.confirmSwitchBot = () => new Promise((resolve, reject) => resolve(true));
    ActiveBotHelper.setActiveBot = (arg: any) => new Promise((resolve, reject) => resolve(null));

    await ActiveBotHelper.confirmAndSwitchBots(bot);
    expect(mockCall).toHaveBeenCalledWith(SharedConstants.Commands.Emulator.NewLiveChat, endpoint);
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
        endpoint: 'someOverride',
      },
    };
    await ActiveBotHelper.confirmAndSwitchBots(bot);
    expect(mockCall).toHaveBeenCalledWith(SharedConstants.Commands.Emulator.NewLiveChat, {
      ...endpoint,
      endpoint: 'someOverride',
    });
    mockCall.mockClear();

    // switching to a bot with multiple endpoints, with endpoint overrides including an endpoint id
    const secondEndpoint: IEndpointService = {
      ...endpoint,
      id: 'someOtherEndpoint',
    };
    bot.services.push(secondEndpoint);
    bot.overrides = {
      endpoint: {
        endpoint: 'someOtherOverride',
        id: 'someOtherEndpoint',
      },
    };
    await ActiveBotHelper.confirmAndSwitchBots(bot);
    expect(mockCall).toHaveBeenCalledWith(SharedConstants.Commands.Emulator.NewLiveChat, {
      ...secondEndpoint,
      endpoint: 'someOtherOverride',
    });

    ActiveBotHelper.botAlreadyOpen = backupBotAlreadyOpen;
    ActiveBotHelper.confirmSwitchBot = backupConfirmSwitchBot;
    ActiveBotHelper.setActiveBot = backupSetActiveBot;
  });
});
