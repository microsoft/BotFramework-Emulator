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

import { GenericActivity, ILogItem } from '@bfemulator/sdk-shared';

import { BotEmulator } from './botEmulator';
import ConsoleLogService from './facility/consoleLogService';
import registerAttachmentRoutes from './attachments/registerRoutes';
import registerBotStateRoutes from './botState/registerRoutes';
import registerConversationRoutes from './conversations/registerRoutes';
import registerDirectLineRoutes from './directLine/registerRoutes';
import registerEmulatorRoutes from './emulator/registerRoutes';
import registerSessionRoutes from './session/registerRoutes';
import registerUserTokenRoutes from './userToken/registerRoutes';
import stripEmptyBearerToken from './utils/stripEmptyBearerToken';

jest.mock('./attachments/registerRoutes', () => jest.fn(() => null));
jest.mock('./botState/registerRoutes', () => jest.fn(() => null));
jest.mock('./conversations/registerRoutes', () => jest.fn(() => null));
jest.mock('./directLine/registerRoutes', () => jest.fn(() => null));
jest.mock('./emulator/registerRoutes', () => jest.fn(() => null));
jest.mock('./session/registerRoutes', () => jest.fn(() => null));
jest.mock('./userToken/registerRoutes', () => jest.fn(() => null));
jest.mock('./utils/stripEmptyBearerToken', () => jest.fn(() => null));

const mockAcceptParser = jest.fn(_acceptable => null);
const mockDateParser = jest.fn(() => null);
const mockQueryParser = jest.fn(() => null);
jest.mock('restify', () => ({
  plugins: {
    get acceptParser() {
      return mockAcceptParser;
    },
    get dateParser() {
      return mockDateParser;
    },
    get queryParser() {
      return mockQueryParser;
    },
  },
}));

describe('BotEmulator', () => {
  it('should instantiate itself properly', async () => {
    const getServiceUrl = _url => Promise.resolve('serviceUrl');
    const customFetch = (_url, _options) => Promise.resolve();
    const customLogger = {
      logActivity: (_conversationId: string, _activity: GenericActivity, _role: string) => 'activityLogged',
      logMessage: (_conversationId: string, ..._items: ILogItem[]) => 'messageLogged',
      logException: (_conversationId: string, _err: Error) => 'exceptionLogged',
    };
    const customLogService = new ConsoleLogService();

    // with logger
    const options1 = {
      fetch: customFetch,
      loggerOrLogService: customLogger,
    };
    const botEmulator1 = new BotEmulator(getServiceUrl, options1);
    const serviceUrl = await botEmulator1.getServiceUrl('');

    expect(serviceUrl).toBe('serviceUrl');
    expect(botEmulator1.options).toEqual({ ...options1, stateSizeLimitKB: 64 });
    expect(botEmulator1.facilities.attachments).not.toBeFalsy();
    expect(botEmulator1.facilities.botState).not.toBeFalsy();
    expect(botEmulator1.facilities.conversations).not.toBeFalsy();
    expect(botEmulator1.facilities.endpoints).not.toBeFalsy();
    expect(botEmulator1.facilities.logger).not.toBeFalsy();
    expect(botEmulator1.facilities.users).not.toBeFalsy();
    expect(botEmulator1.facilities.botState.stateSizeLimitKB).toBe(64);
    expect(await botEmulator1.facilities.logger.logActivity('', null, '')).toBe('activityLogged');
    expect(await botEmulator1.facilities.logger.logException('', null)).toBe('exceptionLogged');
    expect(await botEmulator1.facilities.logger.logMessage('')).toBe('messageLogged');

    // with log service
    const options2 = {
      fetch: customFetch,
      loggerOrLogService: customLogService,
    };
    const botEmulator2 = new BotEmulator(getServiceUrl, options2);

    expect((botEmulator2.facilities.logger as any).logService).toEqual(customLogService);
  });

  it('should mount routes onto a restify server', () => {
    const getServiceUrl = _url => Promise.resolve('serviceUrl');
    const botEmulator = new BotEmulator(getServiceUrl);
    const restifyServer = { acceptable: true };
    const mockUses = [
      mockAcceptParser(restifyServer.acceptable),
      stripEmptyBearerToken(),
      mockDateParser(),
      mockQueryParser(),
    ];
    mockAcceptParser.mockClear();
    (stripEmptyBearerToken as any).mockClear();
    mockDateParser.mockClear();
    mockQueryParser.mockClear();

    const mountedEmulator = botEmulator.mount(restifyServer as any);

    expect(mountedEmulator).toEqual(botEmulator);
    expect(mockAcceptParser).toHaveBeenCalledWith(restifyServer.acceptable);
    expect(stripEmptyBearerToken).toHaveBeenCalled();
    expect(mockDateParser).toHaveBeenCalled();
    expect(mockQueryParser).toHaveBeenCalled();
    expect(registerAttachmentRoutes).toHaveBeenCalledWith(botEmulator, restifyServer, mockUses);
    expect(registerBotStateRoutes).toHaveBeenCalledWith(botEmulator, restifyServer, mockUses);
    expect(registerConversationRoutes).toHaveBeenCalledWith(botEmulator, restifyServer, mockUses);
    expect(registerDirectLineRoutes).toHaveBeenCalledWith(botEmulator, restifyServer, mockUses);
    expect(registerSessionRoutes).toHaveBeenCalledWith(botEmulator, restifyServer, mockUses);
    expect(registerUserTokenRoutes).toHaveBeenCalledWith(botEmulator, restifyServer, mockUses);
    expect(registerEmulatorRoutes).toHaveBeenCalledWith(botEmulator, restifyServer, mockUses);
  });
});
