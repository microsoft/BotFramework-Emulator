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

import { WebSocketServer } from './webSocketServer';

const mockWSServer = {
  handleUpgrade: jest.fn(),
  on: jest.fn(),
};
jest.mock('ws', () => ({
  Server: jest.fn().mockImplementation(() => mockWSServer),
}));

const mockCreateServer = jest.fn();
jest.mock('restify', () => ({
  createServer: (...args) => mockCreateServer(...args),
}));

describe('WebSocketServer', () => {
  beforeEach(() => {
    mockCreateServer.mockClear();
    mockWSServer.handleUpgrade.mockClear();
    mockWSServer.on.mockClear();
  });

  it('should return the corresponding socket for a conversation id', () => {
    const conversationId = 'convoId1';
    const mockSocket = {};
    (WebSocketServer as any)._sockets = {
      [conversationId]: mockSocket,
    };
    const socket = WebSocketServer.getSocketByConversationId(conversationId);

    expect(socket).toEqual(mockSocket);
  });

  it('should initialize the server', async () => {
    const cleanupSpy = jest.spyOn(WebSocketServer, 'cleanup').mockImplementationOnce(() => null);
    (WebSocketServer as any)._restServer = {};
    (WebSocketServer as any)._servers = {};
    (WebSocketServer as any)._sockets = {};
    const mockRestServer = {
      address: () => ({ port: 56273 }),
      get: jest.fn(),
      listen: jest.fn((_port, cb) => {
        cb();
      }),
      once: jest.fn(),
    };
    mockCreateServer.mockReturnValueOnce(mockRestServer);
    const port = await WebSocketServer.init();

    expect(port).toBe(56273);
    expect(mockRestServer.get).toHaveBeenCalledWith('/ws/:conversationId', jasmine.any(Function));
    expect((WebSocketServer as any)._restServer).toEqual(mockRestServer);
    expect(cleanupSpy).toHaveBeenCalled();
    cleanupSpy.mockRestore();
  });

  it('should clean up the rest server, web sockets, and web socket servers', () => {
    const conversationId = 'convoId1';
    const mockRestServer = {
      close: jest.fn(),
    };
    const mockServer = {
      close: jest.fn(),
    };
    const mockSocket = {
      close: jest.fn(),
    };
    (WebSocketServer as any)._restServer = mockRestServer;
    (WebSocketServer as any)._servers = {
      [conversationId]: mockServer,
    };
    (WebSocketServer as any)._sockets = {
      [conversationId]: mockSocket,
    };
    WebSocketServer.cleanup();

    expect(mockRestServer.close).toHaveBeenCalled();
    expect(mockServer.close).toHaveBeenCalled();
    expect(mockSocket.close).toHaveBeenCalled();
  });

  it('should make sure that only a single WebSocket is created per conversation id', async () => {
    const registeredRoutes = {};
    const mockRestServer = {
      address: () => ({ port: 55523 }),
      get: (route, handler) => {
        registeredRoutes[route] = handler;
      },
      listen: jest.fn((_port, cb) => {
        cb();
      }),
      once: jest.fn(),
    };
    (WebSocketServer as any)._restServer = undefined;
    (WebSocketServer as any)._servers = {};
    (WebSocketServer as any)._sockets = {};
    mockCreateServer.mockReturnValueOnce(mockRestServer);
    await WebSocketServer.init();

    const mockConversationId = 'convo1';
    const getHandler = registeredRoutes['/ws/:conversationId'];
    const req = {
      params: {
        conversationId: mockConversationId,
      },
    };
    const res = {
      claimUpgrade: () => ({ head: {}, socket: {} }),
    };
    const next = jest.fn();

    // first request to generate a new WS connection
    getHandler(req, res, next);

    expect(Object.keys((WebSocketServer as any)._servers)).toEqual([mockConversationId]);

    // second request to generate a new WS connection
    getHandler(req, res, next);

    expect(Object.keys((WebSocketServer as any)._servers)).toEqual([mockConversationId]);
    expect(mockWSServer.handleUpgrade).toHaveBeenCalledTimes(1);
  });
});
