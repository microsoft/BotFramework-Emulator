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
import * as validateCreateConversationRequest from './errorCondition/createConversationValidator';

const mockSendErrorResponse = jest.fn();
jest.mock('../../../../utils/sendErrorResponse', () => ({
  sendErrorResponse: (...args) => mockSendErrorResponse(...args),
}));

describe('createConversation handler', () => {
  beforeEach(() => {
    mockSendErrorResponse.mockClear();
  });

  it('should send a 200 with a create conversation response when the conversation does not exist', () => {
    const validateCreateConversationRequestSpy = jest
      .spyOn(validateCreateConversationRequest, 'validateCreateConversationRequest')
      .mockImplementation(() => false as any);
    const mockNewConversation = {
      conversationId: 'convo1',
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
        conversationId: 'convo1',
        members: [{ id: 'member1' }],
        mode: 'livechat',
      },
      botEndpoint: { botId: 'bot1' },
    };
    const res: any = {
      end: jest.fn(),
      send: jest.fn(),
    };
    const next = jest.fn();
    createConversation(req, res, next);

    expect(res.send).toHaveBeenCalledWith(HttpStatus.OK, { id: 'convo1' });
    expect(res.end).toHaveBeenCalled();
    expect(next).toHaveBeenCalled();

    validateCreateConversationRequestSpy.mockRestore();
  });

  it('should send an error response if the request is invalid', () => {
    const validateCreateConversationRequestSpy = jest
      .spyOn(validateCreateConversationRequest, 'validateCreateConversationRequest')
      .mockImplementation(() => ({ toAPIException: jest.fn(() => new Error('I am an error!')) } as any));
    const createConversation = createCreateConversationHandler({} as any);
    const req: any = {
      body: {},
    };
    const res: any = {};
    const next = jest.fn();
    createConversation(req, res, next);

    expect(mockSendErrorResponse).toHaveBeenCalledWith(req, res, next, new Error('I am an error!'));
    expect(next).toHaveBeenCalled();

    validateCreateConversationRequestSpy.mockRestore();
  });
});
