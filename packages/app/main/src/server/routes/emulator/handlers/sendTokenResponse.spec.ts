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

import { sendTokenResponse } from './sendTokenResponse';

jest.mock('../../../../telemetry', () => ({
  TelemetryService: {
    trackEvent: jest.fn(),
  },
}));

describe('sendTokenResponse handler', () => {
  it('should send a 200 if the result of sending the token was a 200', async () => {
    const req: any = {
      body: [{ token: 'someToken', connectionName: 'conn1' }],
      conversation: {
        sendTokenResponse: jest.fn().mockResolvedValueOnce({ statusCode: HttpStatus.OK }),
      },
    };
    const res: any = {
      end: jest.fn(),
      send: jest.fn(),
    };
    const next = jest.fn();
    await sendTokenResponse(req, res);

    const body = req.body[0];
    expect(req.conversation.sendTokenResponse).toHaveBeenCalledWith(body.connectionName, body.token, true);
    expect(res.send).toHaveBeenCalledWith(HttpStatus.OK, body);
    expect(res.end).toHaveBeenCalled();
  });

  it('should send the status code if the result of sending the token was not a 200', async () => {
    const req: any = {
      body: [{ token: 'someToken', connectionName: 'conn1' }],
      conversation: {
        sendTokenResponse: jest.fn().mockResolvedValueOnce({ statusCode: HttpStatus.BAD_REQUEST }),
      },
    };
    const res: any = {
      end: jest.fn(),
      send: jest.fn(),
    };
    const next = jest.fn();
    await sendTokenResponse(req, res);

    const body = req.body[0];
    expect(req.conversation.sendTokenResponse).toHaveBeenCalledWith(body.connectionName, body.token, true);
    expect(res.send).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(res.end).toHaveBeenCalled();
  });
});
