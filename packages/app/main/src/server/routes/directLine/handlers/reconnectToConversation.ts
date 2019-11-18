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

import { LogLevel, textItem } from '@bfemulator/sdk-shared';
import * as HttpStatus from 'http-status-codes';
import { Next, Request, Response } from 'restify';

import { Conversation } from '../../../state/conversation';
import { EmulatorRestServer } from '../../../restServer';

export function createReconnectToConversationHandler(emulatorServer: EmulatorRestServer) {
  const { logMessage } = emulatorServer.logger;

  return (req: Request, res: Response, next: Next): any => {
    const conversation: Conversation = (req as any).conversation;

    if (conversation) {
      res.json(HttpStatus.OK, {
        conversationId: conversation.conversationId,
        token: conversation.conversationId,
        // eslint-disable-next-line typescript/camelcase
        expires_in: Math.pow(2, 31) - 1,
        streamUrl: '',
      });
    } else {
      res.send(HttpStatus.NOT_FOUND, 'conversation not found');
      logMessage(
        req.params.conversationId,
        textItem(LogLevel.Error, 'Cannot reconnect to conversation. Conversation not found.')
      );
    }

    res.end();

    next();
  };
}
