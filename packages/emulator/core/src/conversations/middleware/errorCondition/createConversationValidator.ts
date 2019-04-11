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
import { APIException, ErrorCodes } from '@bfemulator/sdk-shared';
import * as HttpStatus from 'http-status-codes';
import { ConversationParameters } from 'botframework-schema';

import BotEndpoint from '../../../facility/botEndpoint';
import createAPIException from '../../../utils/createResponse/apiException';

class CreateConversationError {
  public static TOO_MANY_MEMBERS = new CreateConversationError(
    ErrorCodes.BadSyntax,
    'The Emulator only supports creating conversation with 1 member.'
  );

  public static BOT_MISSING = new CreateConversationError(
    ErrorCodes.MissingProperty,
    'The "Bot" parameter is required'
  );

  public static APP_ID_MISSING = new CreateConversationError(
    ErrorCodes.MissingProperty,
    'The Emulator only supports bot-created conversation with AppID-bearing bot'
  );

  constructor(public errorCode: ErrorCodes, public message: string) {
    if (Object.isFrozen(CreateConversationError)) {
      throw new Error('The CreateConversationError cannot be constructed');
    }
    Object.assign(this, { errorCode, message });
    Object.freeze(this);
  }

  public toAPIException(): APIException {
    return createAPIException(HttpStatus.BAD_REQUEST, this.errorCode, this.message);
  }
}

Object.freeze(CreateConversationError);

function validateCreateConversationRequest(
  params: ConversationParameters,
  endpoint: BotEndpoint
): CreateConversationError | void {
  if (params.members && params.members.length > 1) {
    return CreateConversationError.TOO_MANY_MEMBERS;
  }

  if (!params.bot) {
    return CreateConversationError.BOT_MISSING;
  }

  if (!endpoint) {
    return CreateConversationError.APP_ID_MISSING;
  }
}

export { CreateConversationError, validateCreateConversationRequest };
