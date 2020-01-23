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
import { NOT_FOUND, OK } from 'http-status-codes';

import { createUpdateConversationHandler } from './updateConversation';

describe('updateConversation handler', () => {
  it('should return a 404 when the conversation does not exist', () => {
    const mockState: any = {
      conversations: {
        conversationById: () => undefined,
      },
    };
    const req: any = {
      body: {},
      params: {},
    };
    const res: any = {
      send: jest.fn(),
    };
    const next = jest.fn();
    const handler = createUpdateConversationHandler(mockState);
    handler(req, res, next);

    expect(res.send).toHaveBeenCalledWith(NOT_FOUND);
    expect(next).toHaveBeenCalled();
  });

  it('should return a 500 when the user is missing from the conversation members array', () => {
    const mockConversation = {
      members: [],
      user: {},
    };
    const mockState: any = {
      conversations: {
        conversationById: () => mockConversation,
        conversations: {},
        deleteConversation: jest.fn(),
      },
    };
    const req: any = {
      body: {
        conversationId: 'convoId2',
        userId: 'someUserId',
      },
      params: {
        conversationId: 'convoId1',
      },
    };
    const res: any = {};
    const next = jest.fn();
    const handler = createUpdateConversationHandler(mockState);
    handler(req, res, next);

    expect(next).toHaveBeenCalledWith(new Error('Conversation convoId1 is missing the user in the members array.'));
  });

  it('should return a 200 when the conversation is updated', () => {
    const mockConversation = {
      botEndpoint: 'http://localhost:3978/api/messages',
      conversationId: 'convoId1',
      members: [{ name: 'User' }, { name: 'Bot' }],
      mode: 'livechat',
      normalize: jest.fn(),
      user: {},
    };
    const mockState: any = {
      conversations: {
        conversationById: () => mockConversation,
        conversations: {},
        deleteConversation: jest.fn(),
      },
    };
    const req: any = {
      body: {
        conversationId: 'convoId2',
        userId: 'someUserId',
      },
      params: {
        conversationId: 'convoId1',
      },
    };
    const res: any = {
      send: jest.fn(),
    };
    const next = jest.fn();
    const handler = createUpdateConversationHandler(mockState);
    handler(req, res, next);

    expect(res.send).toHaveBeenCalledWith(OK, {
      botEndpoint: mockConversation.botEndpoint,
      conversationId: 'convoId2',
      user: {
        id: 'someUserId',
      },
      mode: mockConversation.mode,
      members: [
        {
          ...mockConversation.members[0],
          id: 'someUserId',
        },
        mockConversation.members[1],
      ],
      nextWatermark: 0,
    });
    expect(next).toHaveBeenCalled();
  });
});
