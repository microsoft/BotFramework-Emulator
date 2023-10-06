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

import { INTERNAL_SERVER_ERROR, OK } from 'http-status-codes';

import { getWebSocketPort } from './getWebSocketPort';

const mockWebSocketServer = {
  init: jest.fn(async () => 56627),
  port: 56626,
};
jest.mock('../../../webSocketServer', () => ({
  get WebSocketServer() {
    return mockWebSocketServer;
  },
}));

describe('getWebSocketPort handler', () => {
  it('should return a 200 with the WS server port', async () => {
    const req: any = {};
    const res: any = {
      end: jest.fn(),
      send: jest.fn(),
    };
    const next = jest.fn();
    await getWebSocketPort(req, res);

    expect(res.send).toHaveBeenCalledWith(OK, 56626);
    expect(res.end).toHaveBeenCalled();
  });

  it('should start the WS server and return a 200 with the server port', async () => {
    const req: any = {};
    const res: any = {
      end: jest.fn(),
      send: jest.fn(),
    };
    const next = jest.fn();
    mockWebSocketServer.port = undefined;
    await getWebSocketPort(req, res);

    expect(res.send).toHaveBeenCalledWith(OK, 56627);
    expect(res.end).toHaveBeenCalled();
  });

  it('should return a 500 and an error', async () => {
    const req: any = {};
    const res: any = {
      end: jest.fn(),
      send: jest.fn(),
    };
    const next = jest.fn();
    mockWebSocketServer.init.mockRejectedValueOnce(new Error('Failed to init WS server.'));
    await getWebSocketPort(req, res);

    expect(res.send).toHaveBeenCalledWith(INTERNAL_SERVER_ERROR, new Error('Failed to init WS server.'));
    expect(res.end).toHaveBeenCalled();
  });
});
