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
import { ErrorCodes } from '@bfemulator/app-shared';

import { createAPIException } from '../../../utils/createResponse/createAPIException';

import { createGetConversationEndpointHandler } from './getConversationEndpoint';

const mockSendErrorResponse = jest.fn();
jest.mock('../../../utils/sendErrorResponse', () => ({
  sendErrorResponse: (...args) => mockSendErrorResponse(...args),
}));

describe('getConversationEndpoint handler', () => {
  beforeEach(() => {
    mockSendErrorResponse.mockClear();
  });

  it('should throw an exception if the conversation is not found', () => {
    const mockServerState: any = {
      conversations: {
        conversationById: jest.fn(() => undefined),
      },
    };
    const req: any = {
      params: {
        conversationId: 'convo1',
      },
    };
    const res: any = {};
    const next = jest.fn();
    const getConversationEndpoint = createGetConversationEndpointHandler(mockServerState);

    try {
      getConversationEndpoint(req, res, next);
      expect(true).toBe(false); // ensure catch is hit
    } catch (e) {
      expect(e).toEqual(createAPIException(HttpStatus.NOT_FOUND, ErrorCodes.BadArgument, 'conversation not found'));
    }
    expect(next).not.toHaveBeenCalled();
  });

  it('should send a 200 with the bot endpoint', () => {
    const mockConversation = {
      botEndpoint: {
        url: 'http://some.url.com/api/messages',
      },
    };
    const mockServerState: any = {
      conversations: {
        conversationById: jest.fn(() => mockConversation),
      },
    };
    const req: any = {
      params: {
        conversationId: 'convo1',
      },
    };
    const res: any = {
      end: jest.fn(),
      json: jest.fn(),
    };
    const next = jest.fn();
    const getConversationEndpoint = createGetConversationEndpointHandler(mockServerState);
    getConversationEndpoint(req, res, next);

    expect(res.json).toHaveBeenCalledWith(HttpStatus.OK, mockConversation.botEndpoint);
    expect(res.end).toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  it('should send an error response if something goes wrong', () => {
    const mockConversation = {
      botEndpoint: {
        url: 'http://some.url.com/api/messages',
      },
    };
    const mockServerState: any = {
      conversations: {
        conversationById: jest.fn(() => mockConversation),
      },
    };
    const req: any = {
      params: {
        conversationId: 'convo1',
      },
    };
    const res: any = {
      end: jest.fn(),
      json: jest.fn(() => {
        throw new Error('Something went wrong.');
      }),
    };
    const next = jest.fn();
    const getConversationEndpoint = createGetConversationEndpointHandler(mockServerState);
    getConversationEndpoint(req, res, next);

    expect(mockSendErrorResponse).toHaveBeenCalledWith(req, res, next, new Error('Something went wrong.'));
    expect(next).toHaveBeenCalled();
  });
});
