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

import { createAPIException } from '../../../../../utils/createResponse/createAPIException';

import { validateCreateConversationRequest, CreateConversationError } from './createConversationValidator';

describe('validateCreateConversationRequest', () => {
  it('should validate against a conversation being created with more than one member', () => {
    const result = validateCreateConversationRequest(
      { members: [{ name: 'user1' }, { name: 'user2' }] } as any,
      undefined
    ) as CreateConversationError;

    expect(result.errorCode).toBe(ErrorCodes.BadSyntax);
    expect(result.message).toBe('The Emulator only supports creating conversation with 1 member.');
  });

  it('should validate against a conversation being created without a bot', () => {
    const result = validateCreateConversationRequest(
      { members: [{ name: 'user1' }] } as any,
      undefined
    ) as CreateConversationError;

    expect(result.errorCode).toBe(ErrorCodes.MissingProperty);
    expect(result.message).toBe('The "Bot" parameter is required');
  });

  it('should validate against a conversation being created without an endpoint', () => {
    const result = validateCreateConversationRequest(
      { bot: {}, members: [{ name: 'user1' }] } as any,
      undefined
    ) as CreateConversationError;

    expect(result.errorCode).toBe(ErrorCodes.MissingProperty);
    expect(result.message).toBe('The Emulator only supports bot-created conversation with AppID-bearing bot');
  });

  it('should create a conversation error that can convert itself into an API exception', () => {
    const result = validateCreateConversationRequest(
      { members: [{ name: 'user1' }, { name: 'user2' }] } as any,
      undefined
    ) as CreateConversationError; // too many members error

    expect(result.toAPIException()).toEqual(
      createAPIException(
        HttpStatus.BAD_REQUEST,
        ErrorCodes.BadSyntax,
        'The Emulator only supports creating conversation with 1 member.'
      )
    );
  });
});
