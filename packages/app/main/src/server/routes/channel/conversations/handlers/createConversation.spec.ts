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

import { createCreateConversationHandler } from './createConversation';

describe('createConversation handler', () => {
  it('should send a 201 with a create conversation response when the conversation does not exist', () => {
    const mockNewConversation = {
      id: 'convo1',
      conversationId: 'convo1',
      members: [],
      normalize: jest.fn(),
    };
    const emulatorServer: any = {
      postActivityToUser: jest.fn(() => ({ id: 'activity1' })),
      state: {
        conversations: {
          conversationById: jest.fn(() => undefined),
          newConversation: jest.fn(() => mockNewConversation),
        },
        users: {
          currentUserId: 'user1',
        },
      },
    };
    const createConversation = createCreateConversationHandler(emulatorServer);
    const req: any = {
      body: {
        bot: {},
        conversationId: 'convo1',
        members: [{ id: 'member1', role: 'user' }],
        mode: 'livechat',
      },
      botEndpoint: { botId: 'bot1', id: 'someEndpointId' },
    };
    const res: any = {
      end: jest.fn(),
      send: jest.fn(),
    };
    const next = jest.fn();
    createConversation(req, res, next);

    expect(res.send).toHaveBeenCalledWith(HttpStatus.CREATED, {
      conversationId: mockNewConversation.conversationId,
      endpointId: req.botEndpoint.id,
      members: mockNewConversation.members,
      id: mockNewConversation.conversationId,
    });
    expect(res.end).toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  it('should send an error response if the request is invalid (missing bot)', () => {
    const createConversation = createCreateConversationHandler({} as any);
    const req: any = {
      body: {},
    };
    const res: any = {
      end: jest.fn(),
      send: jest.fn(),
    };
    const next = jest.fn();
    createConversation(req, res, next);

    expect(res.send).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST, new Error('Missing bot object in request.'));
    expect(res.end).toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  it('should send an error response if the request is invalid (missing botEndpoint)', () => {
    const createConversation = createCreateConversationHandler({} as any);
    const req: any = {
      body: {
        bot: {},
      },
    };
    const res: any = {
      end: jest.fn(),
      send: jest.fn(),
    };
    const next = jest.fn();
    createConversation(req, res, next);

    expect(res.send).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST, new Error('Missing botEndpoint object in request.'));
    expect(res.end).toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  it('should send an error response if the request is invalid (missing user)', () => {
    const createConversation = createCreateConversationHandler({} as any);
    const req: any = {
      body: {
        bot: {},
        members: [],
      },
      botEndpoint: {},
    };
    const res: any = {
      end: jest.fn(),
      send: jest.fn(),
    };
    const next = jest.fn();
    createConversation(req, res, next);

    expect(res.send).toHaveBeenCalledWith(
      HttpStatus.BAD_REQUEST,
      new Error('Missing user inside of members array in request.')
    );
    expect(res.end).toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });
});
