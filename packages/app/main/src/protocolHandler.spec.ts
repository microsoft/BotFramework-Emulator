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
// Allows us to bypass all the setup required in ./main
//
// NOTE: A significant part of protocolHandler is not testable
// because of call to "jest.mock('./main', ...)" which is needed
// to bypass setup of all ./main dependencies. To test the remaineder
// of the protocol handler, we need to mock the CommandService which is
// a property of main. However, any mocks written for the CommandService
// will be overwritten due to the call to "jest.mock('./main', ...)"

import './fetchProxy';
import { SharedConstants, newBot, newEndpoint } from '@bfemulator/app-shared';
import { applyBotConfigOverrides, BotConfigWithPathImpl } from '@bfemulator/sdk-shared';

import { Protocol, ProtocolHandler, parseEndpointOverrides } from './protocolHandler';
import { TelemetryService } from './telemetry';

let mockCallsMade, mockRemoteCallsMade;
let mockOpenedBot;
const mockSharedConstants = SharedConstants;
jest.mock('./main', () => ({
  mainWindow: {
    commandService: {
      call: (commandName, ...args) => {
        mockCallsMade.push({ commandName, args });
        if (commandName === mockSharedConstants.Commands.Bot.Open) {
          return Promise.resolve(mockOpenedBot);
        }
      },
      remoteCall: (commandName, ...args) => {
        mockRemoteCallsMade.push({ commandName, args });
      },
    },
  },
}));
jest.mock('./globals', () => ({
  getGlobal: () => ({}),
  setGlobal: () => null,
}));

let mockNgrokPath;
jest.mock('./settingsData/store', () => ({
  getSettings: () => ({
    framework: {
      ngrokPath: mockNgrokPath,
    },
  }),
}));

let mockGetSpawnStatus: any = jest.fn(() => ({ triedToSpawn: true }));
const mockRecycle = jest.fn(() => null);
const mockEmulator = {
  ngrok: {
    getSpawnStatus: () => mockGetSpawnStatus(),
    recycle: () => mockRecycle(),
  },
};
jest.mock('./emulator', () => ({
  Emulator: {
    getInstance: () => mockEmulator,
  },
}));

let mockRunningStatus;
jest.mock('./ngrok', () => ({
  ngrokEmitter: {
    once: (_eventName, cb) => cb(),
  },
  running: () => mockRunningStatus,
}));

let mockSendNotificationToClient;
jest.mock('./utils/sendNotificationToClient', () => ({
  sendNotificationToClient: () => mockSendNotificationToClient(),
}));

let mockGotReturnValue;
jest.mock('got', () => {
  return jest.fn(() => Promise.resolve(mockGotReturnValue));
});

describe('Protocol handler tests', () => {
  let mockTrackEvent;
  const trackEventBackup = TelemetryService.trackEvent;

  beforeEach(() => {
    mockTrackEvent = jest.fn(() => null);
    TelemetryService.trackEvent = mockTrackEvent;
    mockCallsMade = [];
    mockRemoteCallsMade = [];
    mockOpenedBot = {
      name: 'someBot',
      description: '',
      path: 'path/to/bot.bot',
      services: [
        {
          appId: 'someAppId',
          appPassword: 'somePw',
          endpoint: 'https://www.myendpoint.com',
        },
      ],
    };
    mockRunningStatus = true;
    mockNgrokPath = 'path/to/ngrok.exe';
    mockSendNotificationToClient = jest.fn(() => null);
    mockGotReturnValue = {
      statusCode: 200,
      body: '["activity1", "activity2", "activity3"]',
    };
    mockRecycle.mockClear();
    mockGetSpawnStatus.mockClear();
  });

  afterAll(() => {
    TelemetryService.trackEvent = trackEventBackup;
  });

  describe('parseProtocolUrl() functionality', () => {
    it('should return an info object about the parsed URL', () => {
      const info: Protocol = ProtocolHandler.parseProtocolUrl('bfemulator://bot.open?path=somePath');
      expect(info.domain).toBe('bot');
      expect(info.action).toBe('open');
      expect(info.args).toEqual('path=somePath');
      expect(info.parsedArgs).toEqual({ path: 'somePath' });
    });

    it('should throw on an invalid protocol url', () => {
      expect(() => ProtocolHandler.parseProtocolUrl('invalidProtocolUrl://blah')).toThrow();
    });
  });

  it('should dispatch the result of parseProtocolUrl', () => {
    // preserve functions that will be mocked
    const tmpParseProtocolUrl = ProtocolHandler.parseProtocolUrl;
    const tmpDispatchProtocolAction = ProtocolHandler.dispatchProtocolAction;

    // mock functions
    const mockParseProtocolUrl = jest.fn(() => ({}));
    const mockDispatchProtocolAction = jest.fn(() => null);

    ProtocolHandler.parseProtocolUrl = mockParseProtocolUrl;
    ProtocolHandler.dispatchProtocolAction = mockDispatchProtocolAction;

    ProtocolHandler.parseProtocolUrlAndDispatch('someUrl');
    expect(mockParseProtocolUrl).toHaveBeenCalledTimes(1);
    expect(mockDispatchProtocolAction).toHaveBeenCalledTimes(1);

    // restore functions to original form
    ProtocolHandler.parseProtocolUrl = tmpParseProtocolUrl;
    ProtocolHandler.dispatchProtocolAction = tmpDispatchProtocolAction;
  });

  describe('dispatching protocol actions', () => {
    let tmpPerformBotAction;
    let tmpPerformLiveChatAction;
    let tmpPerformTranscriptAction;

    beforeEach(() => {
      tmpPerformBotAction = ProtocolHandler.performBotAction;
      tmpPerformLiveChatAction = ProtocolHandler.performLiveChatAction;
      tmpPerformTranscriptAction = ProtocolHandler.performTranscriptAction;
    });

    afterEach(() => {
      ProtocolHandler.performBotAction = tmpPerformBotAction;
      ProtocolHandler.performLiveChatAction = tmpPerformLiveChatAction;
      ProtocolHandler.performTranscriptAction = tmpPerformTranscriptAction;
    });

    it("shouldn't do anything on an unrecognized action", () => {
      const mockPerformBotAction = jest.fn(() => null);
      ProtocolHandler.performBotAction = mockPerformBotAction;
      const mockPerformLiveChatAction = jest.fn(() => null);
      ProtocolHandler.performLiveChatAction = mockPerformLiveChatAction;
      const mockPerformTranscriptAction = jest.fn(() => null);
      ProtocolHandler.performTranscriptAction = mockPerformTranscriptAction;

      ProtocolHandler.dispatchProtocolAction({ domain: 'invalidDomain' });

      expect(mockPerformBotAction).not.toHaveBeenCalled();
      expect(mockPerformLiveChatAction).not.toHaveBeenCalled();
      expect(mockPerformTranscriptAction).not.toHaveBeenCalled();
    });

    it('should dispatch a bot action', () => {
      const mockPerformBotAction = jest.fn(() => null);
      ProtocolHandler.performBotAction = mockPerformBotAction;

      ProtocolHandler.dispatchProtocolAction({ domain: 'bot' });

      expect(mockPerformBotAction).toHaveBeenCalledTimes(1);
    });

    it('should dispatch a livechat action', () => {
      const mockPerformLiveChatAction = jest.fn(() => null);
      ProtocolHandler.performLiveChatAction = mockPerformLiveChatAction;

      ProtocolHandler.dispatchProtocolAction({ domain: 'livechat' });

      expect(mockPerformLiveChatAction).toHaveBeenCalledTimes(1);
    });

    it('should dispatch a transcript action', () => {
      const mockPerformTranscriptAction = jest.fn(() => null);
      ProtocolHandler.performTranscriptAction = mockPerformTranscriptAction;

      ProtocolHandler.dispatchProtocolAction({ domain: 'transcript' });

      expect(mockPerformTranscriptAction).toHaveBeenCalledTimes(1);
    });
  });

  describe('parseEndpointOverrides() functionality', () => {
    it('should return null when passed a falsy object', () => {
      const result = parseEndpointOverrides(null);
      expect(result).toBe(null);
    });

    it('should return null when passed an empty object', () => {
      const result = parseEndpointOverrides({});
      expect(result).toBe(null);
    });

    it('should return an endpoint object with overrides', () => {
      const parsedArgs = {
        appId: 'someAppId',
        appPassword: 'someAppPw',
        endpoint: 'someEndpoint',
        someOtherArg: 'someOtherArg',
      };

      const overrides = parseEndpointOverrides(parsedArgs);
      expect(Object.keys(overrides).length).toBe(3);
      expect(overrides.appId).toBe('someAppId');
      expect(overrides.appPassword).toBe('someAppPw');
      expect(overrides.endpoint).toBe('someEndpoint');
    });

    it('should return null if no overrides were parsed', () => {
      const parsedArgs = {
        notAnOverride: 'testing',
        notAnOverrideEither: 'testing',
      };

      const overrides = parseEndpointOverrides(parsedArgs);
      expect(overrides).toBe(null);
    });
  });

  it('should open a bot when ngrok is running', async () => {
    const protocol = {
      parsedArgs: {
        id: 'someIdOverride',
        path: 'path/to/bot.bot',
        secret: 'someSecret',
      },
    };
    const overrides = { endpoint: parseEndpointOverrides(protocol.parsedArgs) };
    const overriddenBot = applyBotConfigOverrides(mockOpenedBot, overrides);

    // ngrok should be kick-started if it hasn't tried to spawn yet
    mockGetSpawnStatus = jest.fn(() => ({ triedToSpawn: false }));

    await ProtocolHandler.openBot(protocol);

    expect(mockRecycle).toHaveBeenCalled();
    expect(mockCallsMade).toHaveLength(2);
    expect(mockCallsMade[0].commandName).toBe(SharedConstants.Commands.Bot.Open);
    expect(mockCallsMade[0].args).toEqual(['path/to/bot.bot', 'someSecret']);
    expect(mockCallsMade[1].commandName).toBe(SharedConstants.Commands.Bot.SetActive);
    expect(mockCallsMade[1].args).toEqual([overriddenBot]);
    expect(mockRemoteCallsMade).toHaveLength(1);
    expect(mockRemoteCallsMade[0].commandName).toBe(SharedConstants.Commands.Bot.Load);
    expect(mockRemoteCallsMade[0].args).toEqual([overriddenBot]);
    expect(mockTrackEvent).toHaveBeenCalledWith('bot_open', {
      method: 'protocol',
      numOfServices: 1,
    });
  });

  it('should open a bot when ngrok is configured but not running', async () => {
    mockRunningStatus = false;
    const protocol = {
      parsedArgs: {
        id: 'someIdOverride',
        path: 'path/to/bot.bot',
        secret: 'someSecret',
      },
    };
    const overrides = { endpoint: parseEndpointOverrides(protocol.parsedArgs) };
    const overriddenBot = applyBotConfigOverrides(mockOpenedBot, overrides);

    await ProtocolHandler.openBot(protocol);

    expect(mockCallsMade).toHaveLength(2);
    expect(mockCallsMade[0].commandName).toBe(SharedConstants.Commands.Bot.Open);
    expect(mockCallsMade[0].args).toEqual(['path/to/bot.bot', 'someSecret']);
    expect(mockCallsMade[1].commandName).toBe(SharedConstants.Commands.Bot.SetActive);
    expect(mockCallsMade[1].args).toEqual([overriddenBot]);
    expect(mockRemoteCallsMade).toHaveLength(1);
    expect(mockRemoteCallsMade[0].commandName).toBe(SharedConstants.Commands.Bot.Load);
    expect(mockRemoteCallsMade[0].args).toEqual([overriddenBot]);
    expect(mockTrackEvent).toHaveBeenCalledWith('bot_open', {
      method: 'protocol',
      numOfServices: 1,
    });
  });

  it('should open a bot when ngrok is not configured', async () => {
    mockNgrokPath = undefined;
    const protocol = {
      parsedArgs: {
        id: 'someIdOverride',
        path: 'path/to/bot.bot',
        secret: 'someSecret',
      },
    };
    const overrides = { endpoint: parseEndpointOverrides(protocol.parsedArgs) };
    const overriddenBot = applyBotConfigOverrides(mockOpenedBot, overrides);

    await ProtocolHandler.openBot(protocol);

    expect(mockCallsMade).toHaveLength(2);
    expect(mockCallsMade[0].commandName).toBe(SharedConstants.Commands.Bot.Open);
    expect(mockCallsMade[0].args).toEqual(['path/to/bot.bot', 'someSecret']);
    expect(mockCallsMade[1].commandName).toBe(SharedConstants.Commands.Bot.SetActive);
    expect(mockCallsMade[1].args).toEqual([overriddenBot]);
    expect(mockRemoteCallsMade).toHaveLength(1);
    expect(mockRemoteCallsMade[0].commandName).toBe(SharedConstants.Commands.Bot.Load);
    expect(mockRemoteCallsMade[0].args).toEqual([overriddenBot]);
    expect(mockTrackEvent).toHaveBeenCalledWith('bot_open', {
      method: 'protocol',
      numOfServices: 1,
    });
  });

  it('should throw if ngrok failed to spawn while opening a bot', async () => {
    try {
      const protocol = {
        parsedArgs: {
          id: 'someIdOverride',
          path: 'path/to/bot.bot',
          secret: 'someSecret',
        },
      };
      mockGetSpawnStatus = jest.fn(() => ({ triedToSpawn: true, err: 'Some ngrok error' }));
      await ProtocolHandler.openBot(protocol);
    } catch (e) {
      expect(e).toEqual(new Error('Error while trying to spawn ngrok instance: Some ngrok error'));
    }
  });

  it('should open a livechat if ngrok is running', async () => {
    const protocol = {
      parsedArgs: {
        botUrl: 'someUrl',
        msaAppId: 'someAppId',
        msaPassword: 'somePw',
      },
    };
    const mockedBot = BotConfigWithPathImpl.fromJSON(newBot());
    mockedBot.name = '';
    mockedBot.path = SharedConstants.TEMP_BOT_IN_MEMORY_PATH;

    const mockEndpoint = newEndpoint();
    mockEndpoint.appId = protocol.parsedArgs.msaAppId;
    mockEndpoint.appPassword = protocol.parsedArgs.msaPassword;
    mockEndpoint.id = mockEndpoint.endpoint = protocol.parsedArgs.botUrl;
    mockEndpoint.name = 'New livechat';
    mockedBot.services.push(mockEndpoint);

    // ngrok should be kick-started if it hasn't tried to spawn yet
    mockGetSpawnStatus = jest.fn(() => ({ triedToSpawn: false }));

    await ProtocolHandler.openLiveChat(protocol);

    expect(mockRecycle).toHaveBeenCalled();
    expect(mockCallsMade).toHaveLength(1);
    expect(mockCallsMade[0].commandName).toBe(SharedConstants.Commands.Bot.RestartEndpointService);
    expect(mockCallsMade[0].args).toEqual([]);
    expect(mockRemoteCallsMade).toHaveLength(2);
    expect(mockRemoteCallsMade[0].commandName).toBe(SharedConstants.Commands.Bot.SetActive);
    expect(mockRemoteCallsMade[0].args).toEqual([mockedBot, '']);
    expect(mockRemoteCallsMade[1].commandName).toBe(SharedConstants.Commands.Emulator.NewLiveChat);
    expect(mockRemoteCallsMade[1].args).toEqual([mockEndpoint]);
  });

  it('should open a livechat if ngrok is configured but not running', async () => {
    mockRunningStatus = false;
    const protocol = {
      parsedArgs: {
        botUrl: 'someUrl',
        msaAppId: 'someAppId',
        msaPassword: 'somePw',
      },
    };
    const mockedBot = BotConfigWithPathImpl.fromJSON(newBot());
    mockedBot.name = '';
    mockedBot.path = SharedConstants.TEMP_BOT_IN_MEMORY_PATH;

    const mockEndpoint = newEndpoint();
    mockEndpoint.appId = protocol.parsedArgs.msaAppId;
    mockEndpoint.appPassword = protocol.parsedArgs.msaPassword;
    mockEndpoint.id = mockEndpoint.endpoint = protocol.parsedArgs.botUrl;
    mockEndpoint.name = 'New livechat';
    mockedBot.services.push(mockEndpoint);

    await ProtocolHandler.openLiveChat(protocol);

    expect(mockCallsMade).toHaveLength(1);
    expect(mockCallsMade[0].commandName).toBe(SharedConstants.Commands.Bot.RestartEndpointService);
    expect(mockCallsMade[0].args).toEqual([]);
    expect(mockRemoteCallsMade).toHaveLength(2);
    expect(mockRemoteCallsMade[0].commandName).toBe(SharedConstants.Commands.Bot.SetActive);
    expect(mockRemoteCallsMade[0].args).toEqual([mockedBot, '']);
    expect(mockRemoteCallsMade[1].commandName).toBe(SharedConstants.Commands.Emulator.NewLiveChat);
    expect(mockRemoteCallsMade[1].args).toEqual([mockEndpoint]);
  });

  it('should open a livechat if ngrok is not configured', async () => {
    mockNgrokPath = undefined;
    const protocol = {
      parsedArgs: {
        botUrl: 'someUrl',
        msaAppId: 'someAppId',
        msaPassword: 'somePw',
      },
    };
    const mockedBot = BotConfigWithPathImpl.fromJSON(newBot());
    mockedBot.name = '';
    mockedBot.path = SharedConstants.TEMP_BOT_IN_MEMORY_PATH;

    const mockEndpoint = newEndpoint();
    mockEndpoint.appId = protocol.parsedArgs.msaAppId;
    mockEndpoint.appPassword = protocol.parsedArgs.msaPassword;
    mockEndpoint.id = mockEndpoint.endpoint = protocol.parsedArgs.botUrl;
    mockEndpoint.name = 'New livechat';
    mockedBot.services.push(mockEndpoint);

    await ProtocolHandler.openLiveChat(protocol);

    expect(mockCallsMade).toHaveLength(0);
    expect(mockRemoteCallsMade).toHaveLength(1);
    expect(mockRemoteCallsMade[0].commandName).toBe(SharedConstants.Commands.Emulator.NewLiveChat);
    expect(mockRemoteCallsMade[0].args).toEqual([mockEndpoint]);
  });

  it('should throw if ngrok failed to spawn while opening a livechat', async () => {
    try {
      const protocol = {
        parsedArgs: {
          botUrl: 'someUrl',
          msaAppId: 'someAppId',
          msaPassword: 'somePw',
        },
      };
      mockGetSpawnStatus = jest.fn(() => ({ triedToSpawn: true, err: 'Some ngrok error' }));
      await ProtocolHandler.openBot(protocol);
    } catch (e) {
      expect(e).toEqual(new Error('Error while trying to spawn ngrok instance: Some ngrok error'));
    }
  });

  it('should open a transcript from a url', async () => {
    const protocol = {
      parsedArgs: { url: 'https://www.test.com/convo1.transcript' },
    };

    await ProtocolHandler.openTranscript(protocol);

    expect(mockRemoteCallsMade).toHaveLength(1);
    expect(mockRemoteCallsMade[0].commandName).toBe(SharedConstants.Commands.Emulator.OpenTranscript);
    expect(mockRemoteCallsMade[0].args).toEqual([
      'deepLinkedTranscript',
      {
        activities: ['activity1', 'activity2', 'activity3'],
        inMemory: true,
        fileName: 'convo1.transcript',
      },
    ]);
  });

  it('should send a notification if trying to open a transcript from a url results in a 401 or 404', async () => {
    const protocol = {
      parsedArgs: { url: 'https://www.test.com/convo1.transcript' },
    };
    mockGotReturnValue = { statusCode: 401 };

    await ProtocolHandler.openTranscript(protocol);

    expect(mockRemoteCallsMade).toHaveLength(0);
    expect(mockSendNotificationToClient).toHaveBeenCalledTimes(1);

    mockGotReturnValue = { statusCode: 404 };

    await ProtocolHandler.openTranscript(protocol);

    expect(mockRemoteCallsMade).toHaveLength(0);
    expect(mockSendNotificationToClient).toHaveBeenCalledTimes(2);
  });
});
