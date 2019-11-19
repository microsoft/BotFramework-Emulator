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

import { createGetBotEndpointHandler } from './getBotEndpoint';

describe('getBotEndpoint handler', () => {
  it('should get the bot endpoint and attach it to the request if headers are present and the endpoint exists', () => {
    const req: any = {
      headers: {
        'x-emulator-appid': 'someAppId',
        'x-emulator-apppassword': 'someAppPw',
        'x-emulator-botendpoint': 'someBotUrl',
        'x-emulator-channelservice': 'azureusgovernment',
      },
    };
    const mockEndpoint = {};
    const state: any = {
      endpoints: {
        get: jest.fn(() => mockEndpoint),
      },
    };
    const res: any = {};
    const next = jest.fn();
    const getBotEndpoint = createGetBotEndpointHandler(state);
    getBotEndpoint(req, res, next);

    expect(req.botEndpoint).toEqual({
      ...mockEndpoint,
      msaAppId: 'someAppId',
      msaPassword: 'someAppPw',
    });
    expect(next).toHaveBeenCalled();
  });

  it('should get the bot endpoint and attach it to the request if headers are present and the endpoint exists', () => {
    const req: any = {
      body: {
        bot: {
          id: 'bot1',
        },
      },
      headers: {
        'x-emulator-appid': 'someAppId',
        'x-emulator-apppassword': 'someAppPw',
        'x-emulator-botendpoint': 'someBotUrl',
        'x-emulator-channelservice': 'not gov',
      },
    };
    const state: any = {
      endpoints: {
        get: jest.fn(() => undefined),
        set: jest.fn((_id, endpoint) => endpoint),
      },
    };
    const res: any = {};
    const next = jest.fn();
    const getBotEndpoint = createGetBotEndpointHandler(state);
    getBotEndpoint(req, res, next);

    const params = req.body;
    expect(req.botEndpoint).toEqual(
      new BotEndpoint(params.bot.id, params.bot.id, 'someBotUrl', 'someAppId', 'someAppPw', false, undefined)
    );
    expect(next).toHaveBeenCalled();
  });

  it('should get the bot endpoint and attach it to the request if no headers are present', () => {
    const req: any = {
      jwt: {
        appid: 'someAppId',
      },
    };
    const mockEndpoint = {};
    const state: any = {
      endpoints: {
        getByAppId: jest.fn(() => mockEndpoint),
      },
    };
    const res: any = {};
    const next = jest.fn();
    const getBotEndpoint = createGetBotEndpointHandler(state);
    getBotEndpoint(req, res, next);

    expect(req.botEndpoint).toEqual(mockEndpoint);
    expect(next).toHaveBeenCalled();
  });
});
