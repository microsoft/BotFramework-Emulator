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

import { ErrorCodes } from '@bfemulator/sdk-shared';
import * as HttpStatus from 'http-status-codes';

import { createAPIException } from '../../../../utils/createResponse/createAPIException';

import { createGetConversationHandler } from './getConversation';

describe('getConversation handler', () => {
  it('should get a conversation and attach it to the conversation', () => {
    const state: any = {
      conversations: {
        conversationById: jest.fn(() => 'some conversation'),
      },
    };
    const req: any = {
      params: {
        conversationId: 'convo1',
      },
    };
    const res: any = {};
    const next = jest.fn();
    const getConversation = createGetConversationHandler(state);
    getConversation(req, res, next);

    expect(req.conversation).toEqual('some conversation');
    expect(next).toHaveBeenCalled();
  });

  it('should throw an exception if the conversation is not found', () => {
    const state: any = {
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
    const getConversation = createGetConversationHandler(state);

    try {
      getConversation(req, res, next);
      expect(true).toBe(false); // ensure that catch is hit
    } catch (e) {
      expect(e).toEqual(createAPIException(HttpStatus.NOT_FOUND, ErrorCodes.BadArgument, 'conversation not found'));
    }
  });
});
