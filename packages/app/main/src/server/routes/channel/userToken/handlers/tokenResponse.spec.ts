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

import * as HttpStatus from 'http-status-codes';

import { createTokenResponseHandler } from './tokenResponse';

const mockSendErrorResponse = jest.fn();
jest.mock('../../../../utils/sendErrorResponse', () => ({
  sendErrorResponse: (...args) => mockSendErrorResponse(...args),
}));

describe('tokenResponseHandler', () => {
  beforeEach(() => {
    mockSendErrorResponse.mockClear();
  });

  it('should return a 200 and the request body if successful', async () => {
    const req: any = {
      body: { connectionName: 'conn1', token: 'myToken' },
      query: { conversationId: 'convo1' },
    };
    const res: any = {
      end: jest.fn(),
      send: jest.fn(),
    };
    const mockSendTokenResponse = jest.fn().mockResolvedValue({ statusCode: HttpStatus.OK });
    const emulatorServer: any = {
      shutDownOAuthNgrokInstance: jest.fn(),
      state: {
        conversations: {
          conversationById: jest.fn(() => ({
            sendTokenResponse: mockSendTokenResponse,
          })),
        },
      },
    };
    const tokenResponse = createTokenResponseHandler(emulatorServer);
    await tokenResponse(req, res);

    expect(mockSendTokenResponse).toHaveBeenCalledWith(req.body.connectionName, req.body.token, false);
    expect(res.send).toHaveBeenCalledWith(HttpStatus.OK, req.body);
    expect(emulatorServer.shutDownOAuthNgrokInstance).toHaveBeenCalled();
  });

  it('should return the status code of sending the token response if it is not 200', async () => {
    const req: any = {
      body: { connectionName: 'conn1', token: 'myToken' },
      query: { conversationId: 'convo1' },
    };
    const res: any = {
      end: jest.fn(),
      send: jest.fn(),
    };
    const mockSendTokenResponse = jest.fn().mockResolvedValue({ statusCode: HttpStatus.BAD_REQUEST });
    const emulatorServer: any = {
      shutDownOAuthNgrokInstance: jest.fn(),
      state: {
        conversations: {
          conversationById: jest.fn(() => ({
            sendTokenResponse: mockSendTokenResponse,
          })),
        },
      },
    };
    const tokenResponse = createTokenResponseHandler(emulatorServer);
    await tokenResponse(req, res);

    expect(mockSendTokenResponse).toHaveBeenCalledWith(req.body.connectionName, req.body.token, false);
    expect(res.send).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(emulatorServer.shutDownOAuthNgrokInstance).toHaveBeenCalled();
  });

  it('should send an error response if something goes wrong', async () => {
    const req: any = {
      body: {},
      query: {},
    };
    const res: any = {
      end: jest.fn(),
      send: jest.fn(),
    };
    const emulatorServer: any = {
      shutDownOAuthNgrokInstance: jest.fn(),
      state: {
        conversations: {
          conversationById: jest.fn(() => ({
            sendTokenResponse: jest.fn().mockRejectedValue(new Error('Could not send token response.')),
          })),
        },
      },
    };
    const tokenResponse = createTokenResponseHandler(emulatorServer);
    await tokenResponse(req, res);

    expect(mockSendErrorResponse).toHaveBeenCalledWith(req, res, null, new Error('Could not send token response.'));
    expect(emulatorServer.shutDownOAuthNgrokInstance).toHaveBeenCalled();
  });
});
