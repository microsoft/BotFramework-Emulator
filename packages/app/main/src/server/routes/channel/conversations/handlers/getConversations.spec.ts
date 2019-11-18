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

import { createGetConversationsHandler } from './getConversations';

const mockSendErrorResponse = jest.fn();
jest.mock('../../../../utils/sendErrorResponse', () => ({
  sendErrorResponse: (...args) => mockSendErrorResponse(...args),
}));

describe('getConversations handler', () => {
  beforeEach(() => {
    mockSendErrorResponse.mockClear();
  });

  it('should send a 200 with the conversations matching the conversation id and after the first matching id', () => {
    const mockConversations = [
      { conversationId: 'convo0', members: [] },
      { conversationId: 'convo1', members: [] },
      { conversationId: 'convo2', members: [] },
    ];
    const state: any = {
      conversations: {
        getConversations: jest.fn(() => mockConversations),
      },
    };
    const req: any = {
      params: {
        continuationToken: 'convo1',
      },
    };
    const res: any = {
      end: jest.fn(),
      send: jest.fn(),
    };
    const next = jest.fn();
    const getConversations = createGetConversationsHandler(state);
    getConversations(req, res, next);

    expect(res.send).toHaveBeenCalledWith(HttpStatus.OK, {
      conversations: [
        { id: mockConversations[1].conversationId, members: mockConversations[1].members },
        { id: mockConversations[2].conversationId, members: mockConversations[2].members },
      ],
    });
    expect(res.end).toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  it('should send a 200 with all conversations if no id is specified', () => {
    const mockConversations = [
      { conversationId: 'convo0', members: [] },
      { conversationId: 'convo1', members: [] },
      { conversationId: 'convo2', members: [] },
    ];
    const state: any = {
      conversations: {
        getConversations: jest.fn(() => mockConversations),
      },
    };
    const req: any = {
      params: {},
    };
    const res: any = {
      end: jest.fn(),
      send: jest.fn(),
    };
    const next = jest.fn();
    const getConversations = createGetConversationsHandler(state);
    getConversations(req, res, next);

    expect(res.send).toHaveBeenCalledWith(HttpStatus.OK, {
      conversations: mockConversations.map(convo => ({
        id: convo.conversationId,
        members: convo.members,
      })),
    });
    expect(res.end).toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  it('should send an error response if something goes wrong', () => {
    const mockConversations = [];
    const state: any = {
      conversations: {
        getConversations: jest.fn(() => mockConversations),
      },
    };
    const req: any = {
      params: {},
    };
    const res: any = {
      end: jest.fn(),
      send: jest.fn(() => {
        throw new Error('Something went wrong.');
      }),
    };
    const next = jest.fn();
    const getConversations = createGetConversationsHandler(state);
    getConversations(req, res, next);

    expect(mockSendErrorResponse).toHaveBeenCalledWith(req, res, next, new Error('Something went wrong.'));
    expect(next).toHaveBeenCalled();
  });
});
