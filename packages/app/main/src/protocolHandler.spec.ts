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
import { openBotViaUrlAction, openTranscript, SharedConstants } from '@bfemulator/app-shared';
import { applyBotConfigOverrides } from '@bfemulator/sdk-shared';
import { CommandServiceImpl, CommandServiceInstance } from '@bfemulator/sdk-shared';

import { parseEndpointOverrides, Protocol, ProtocolHandler } from './protocolHandler';
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
        return null;
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

const mockDispatch = jest.fn();
jest.mock('./state/store', () => ({
  store: {
    dispatch: action => mockDispatch(action),
  },
  getSettings: () => ({
    framework: {},
  }),
}));

const mockRecycle = jest.fn(() => null);
const mockEmulator = {
  framework: { serverUrl: 'http://[::]:8090' },
};
jest.mock('./emulator', () => ({
  Emulator: {
    getInstance: () => mockEmulator,
  },
}));

let mockSendNotificationToClient;
jest.mock('./utils/sendNotificationToClient', () => ({
  sendNotificationToClient: () => mockSendNotificationToClient(),
}));

let mockGotReturnValue;
jest.mock('got', () => {
  return jest.fn(() => Promise.resolve(mockGotReturnValue));
});

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

describe('Protocol handler tests', () => {
  let mockTrackEvent;
  const trackEventBackup = TelemetryService.trackEvent;

  let commandService: CommandServiceImpl;
  beforeAll(() => {
    const decorator = CommandServiceInstance();
    const descriptor = decorator({ descriptor: {} }, 'none') as any;
    commandService = descriptor.descriptor.get();
    commandService.call = (commandName, ...args) => {
      mockCallsMade.push({ commandName, args });
      if (commandName === mockSharedConstants.Commands.Bot.Open) {
        return Promise.resolve(mockOpenedBot);
      }
      return null;
    };

    commandService.remoteCall = (commandName, ...args) => {
      return Promise.resolve(mockRemoteCallsMade.push({ commandName, args }));
    };
  });

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
    mockSendNotificationToClient = jest.fn(() => null);
    mockGotReturnValue = {
      statusCode: 200,
      body: '["activity1", "activity2", "activity3"]',
    };
    mockRecycle.mockClear();
    mockDispatch.mockClear();
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
    let tmpPerformInspectorAction;

    beforeEach(() => {
      tmpPerformBotAction = ProtocolHandler.performBotAction;
      tmpPerformLiveChatAction = ProtocolHandler.performLiveChatAction;
      tmpPerformTranscriptAction = ProtocolHandler.performTranscriptAction;
      tmpPerformInspectorAction = ProtocolHandler.performInspectorAction;
    });

    afterEach(() => {
      ProtocolHandler.performBotAction = tmpPerformBotAction;
      ProtocolHandler.performLiveChatAction = tmpPerformLiveChatAction;
      ProtocolHandler.performTranscriptAction = tmpPerformTranscriptAction;
      ProtocolHandler.performInspectorAction = tmpPerformInspectorAction;
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
      const spy = jest.spyOn(ProtocolHandler, 'performLiveChatAction');
      ProtocolHandler.parseProtocolUrlAndDispatch(
        'bfemulator://livechat.open?botUrl=http://localhost/&msaAppId=id&msaAppPassword=pass'
      );

      expect(mockDispatch).toHaveBeenCalledWith(
        openBotViaUrlAction({
          endpoint: 'http://localhost/',
          appId: 'id',
          appPassword: 'pass',
          mode: 'livechat',
          channelService: undefined,
        })
      );
      expect(spy).toHaveBeenCalledWith({
        action: 'open',
        args: 'botUrl=http://localhost/&msaAppId=id&msaAppPassword=pass',
        domain: 'livechat',
        parsedArgs: {
          botUrl: 'http://localhost/',
          msaAppId: 'id',
          msaAppPassword: 'pass',
        },
      });
    });

    it('should dispatch a transcript action', () => {
      const spy = jest.spyOn(ProtocolHandler, 'performTranscriptAction');
      ProtocolHandler.parseProtocolUrlAndDispatch('bfemulator://transcript.open?url=http://localhost/myTranscript');
      expect(spy).toHaveBeenCalledWith({
        action: 'open',
        args: 'url=http://localhost/myTranscript',
        domain: 'transcript',
        parsedArgs: { url: 'http://localhost/myTranscript' },
      });
    });

    it('should dispatch an inspector action', () => {
      const spy = jest.spyOn(ProtocolHandler, 'performInspectorAction');
      ProtocolHandler.parseProtocolUrlAndDispatch(
        'bfemulator://inspector.open?botUrl=http://localhost/&msaAppId=id&msaAppPassword=pass&cloud=azureusgovernment'
      );

      expect(mockDispatch).toHaveBeenCalledWith(
        openBotViaUrlAction({
          endpoint: 'http://localhost/',
          appId: 'id',
          appPassword: 'pass',
          mode: 'debug',
          channelService: 'azureusgovernment' as any,
        })
      );
      expect(spy).toHaveBeenCalledWith({
        action: 'open',
        args: 'botUrl=http://localhost/&msaAppId=id&msaAppPassword=pass&cloud=azureusgovernment',
        domain: 'inspector',
        parsedArgs: {
          botUrl: 'http://localhost/',
          cloud: 'azureusgovernment',
          msaAppId: 'id',
          msaAppPassword: 'pass',
        },
      });
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

  it('should open a bot', async () => {
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
      source: 'path',
    });
  });

  it('should open a transcript from a url', async () => {
    const protocol = {
      parsedArgs: { url: 'https://www.test.com/convo1.transcript' },
    };
    await ProtocolHandler.openTranscript(protocol);

    expect(mockDispatch).toHaveBeenCalledWith(
      openTranscript('convo1.transcript', ['activity1', 'activity2', 'activity3'] as any)
    );
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
