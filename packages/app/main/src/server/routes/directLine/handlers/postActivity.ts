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
import { Activity } from 'botframework-schema';
import * as HttpStatus from 'http-status-codes';
import { Request, Response } from 'restify';

import { Conversation } from '../../../state/conversation';
import { sendErrorResponse } from '../../../utils/sendErrorResponse';
import { statusCodeFamily } from '../../../utils/statusCodeFamily';
import { EmulatorRestServer } from '../../../restServer';
import { WebSocketServer } from '../../../webSocketServer';

export function createPostActivityHandler(emulatorServer: EmulatorRestServer) {
  const { logMessage } = emulatorServer.logger;

  return async (req: Request, res: Response) => {
    const conversation: Conversation = (req as any).conversation;

    if (!conversation) {
      res.send(HttpStatus.NOT_FOUND, 'conversation not found');
      res.end();

      logMessage(req.params.conversationId, textItem(LogLevel.Error, 'Cannot post activity. Conversation not found.'));
      return;
    }

    let activity = req.body as Activity;

    try {
      const { updatedActivity, response, statusCode } = await conversation.postActivityToBot(activity, true);
      activity = updatedActivity;

      if (!statusCodeFamily(statusCode, 200)) {
        if (statusCode === HttpStatus.UNAUTHORIZED || statusCode === HttpStatus.FORBIDDEN) {
          logMessage(req.params.conversationId, textItem(LogLevel.Error, 'Cannot post activity. Unauthorized.'));
        }
        let err;
        if (response.text) {
          err = await response.text();
        } else {
          err = {
            message: response.message,
            status: response.status,
          };
        }
        res.send(statusCode || HttpStatus.INTERNAL_SERVER_ERROR, err);
      } else {
        res.send(statusCode, { id: activity.id });

        // (filter out the /INSPECT open command because it doesn't originate from Web Chat)
        if (activity.type === 'message' && activity.text === '/INSPECT open') {
          res.end();
          return;
        }
        WebSocketServer.sendToSubscribers(conversation.conversationId, activity);
      }
    } catch (err) {
      sendErrorResponse(req, res, null, err);
    }

    res.end();
  };
}
