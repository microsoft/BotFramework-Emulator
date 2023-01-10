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

import { createReconnectToConversationHandler } from './reconnectToConversation';

describe('reconnectToConversation handler', () => {
  it('should send a 200 with the conversation info', () => {
    const mockEmulatorServer: any = {
      logger: {
        logMessage: jest.fn(),
      },
    };
    const req: any = {
      conversation: {
        conversationId: 'convo1',
      },
    };
    const res: any = {
      end: jest.fn(),
      json: jest.fn(),
    };
    const next = jest.fn();
    const reconnectToConversation = createReconnectToConversationHandler(mockEmulatorServer);
    reconnectToConversation(req, res, next);

    expect(res.json).toHaveBeenCalledWith(HttpStatus.OK, {
      conversationId: req.conversation.conversationId,
      token: req.conversation.conversationId,
      expires_in: expect.any(Number),
      streamUrl: '',
    });
    expect(res.end).toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  it('should send a 404 and log a message if the conversation is not found', () => {
    const mockEmulatorServer: any = {
      logger: {
        logMessage: jest.fn(),
      },
    };
    const req: any = {
      conversation: undefined,
      params: {
        conversationId: 'convo1',
      },
    };
    const res: any = {
      end: jest.fn(),
      send: jest.fn(),
    };
    const next = jest.fn();
    const reconnectToConversation = createReconnectToConversationHandler(mockEmulatorServer);
    reconnectToConversation(req, res, next);

    expect(res.send).toHaveBeenCalledWith(HttpStatus.NOT_FOUND, 'conversation not found');
    expect(mockEmulatorServer.logger.logMessage).toHaveBeenCalled();
    expect(res.end).toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });
});
