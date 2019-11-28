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

import { BotEndpoint } from '../../../../state/botEndpoint';
import { authentication, usGovernmentAuthentication } from '../../../../constants/authEndpoints';

import { createGetBotEndpointHandler } from './getBotEndpoint';

describe('getBotEndpoint handler', () => {
  it('should get the bot endpoint by app ID if included in the jwt token', () => {
    const mockEndpoint = {};
    const mockServerState: any = {
      endpoints: {
        getByAppId: jest.fn(() => mockEndpoint),
      },
    };
    const req: any = {
      jwt: {
        appid: 'someAppId',
      },
    };
    const res: any = {};
    const next = jest.fn();
    const handler = createGetBotEndpointHandler(mockServerState);
    handler(req, res, next);

    expect(req.botEndpoint).toEqual(mockEndpoint);
  });

  it('should create a new bot endpoint if it does not exist', () => {
    const mockServerState: any = {
      endpoints: {
        get: jest.fn(() => undefined),
        set: jest.fn((_id, endpoint) => endpoint),
      },
    };
    const req: any = {
      body: {
        bot: {
          id: 'someBotId',
        },
        botUrl: 'http://localhost:3978/api/messages',
        channelServiceType: 'public',
        msaAppId: 'someAppId',
        msaPassword: 'someAppPw',
      },
    };
    const { bot, botUrl, msaAppId, msaPassword } = req.body;
    const res: any = {};
    const next = jest.fn();

    const handler = createGetBotEndpointHandler(mockServerState);
    handler(req, res, next);

    expect(req.botEndpoint).toEqual(
      new BotEndpoint(bot.id, bot.id, botUrl, msaAppId, msaPassword, false, authentication.channelService)
    );
  });

  it('should create a new gov bot endpoint if it does not exist', () => {
    const mockServerState: any = {
      endpoints: {
        get: jest.fn(() => undefined),
        set: jest.fn((_id, endpoint) => endpoint),
      },
    };
    const req: any = {
      body: {
        bot: {
          id: 'someBotId',
        },
        botUrl: 'http://localhost:3978/api/messages',
        channelServiceType: 'azureusgovernment',
        msaAppId: 'someAppId',
        msaPassword: 'someAppPw',
      },
    };
    const { bot, botUrl, msaAppId, msaPassword } = req.body;
    const res: any = {};
    const next = jest.fn();

    const handler = createGetBotEndpointHandler(mockServerState);
    handler(req, res, next);

    expect(req.botEndpoint).toEqual(
      new BotEndpoint(bot.id, bot.id, botUrl, msaAppId, msaPassword, false, usGovernmentAuthentication.channelService)
    );
  });

  it('should get the bot endpoint and attach it to the request if it exists', () => {
    const mockEndpoint = {
      botUrl: 'http://localhost:3978/api/messages',
    };
    const mockServerState: any = {
      endpoints: {
        get: jest.fn(() => mockEndpoint),
      },
    };
    const req: any = {
      body: {
        msaAppId: 'someAppId',
        msaPassword: 'someAppPw',
      },
    };
    const res: any = {};
    const next = jest.fn();

    const handler = createGetBotEndpointHandler(mockServerState);
    handler(req, res, next);

    expect(req.botEndpoint).toEqual({
      ...mockEndpoint,
      ...req.body,
    });
  });
});
