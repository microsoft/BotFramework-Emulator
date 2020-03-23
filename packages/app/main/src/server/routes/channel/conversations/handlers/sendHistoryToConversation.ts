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

import { Activity } from 'botframework-schema';
import * as HttpStatus from 'http-status-codes';
import { Next, Request, Response } from 'restify';

import { createResourceResponse } from '../../../../utils/createResponse/createResourceResponse';
import { WebSocketServer } from '../../../../webSocketServer';
import { Conversation } from '../../../../state/conversation';

export function sendHistoryToConversation(req: Request, res: Response, next: Next): any {
  const { activities }: { activities: Activity[] } = req.body;
  let successCount = 0;
  let firstErrorMessage = '';
  const { conversation }: { conversation: Conversation } = req as any;
  for (const activity of activities) {
    try {
      const updatedActivity = conversation.prepActivityToBeSentToUser(conversation.user.id, activity);
      const payload = { activities: [updatedActivity] };
      const socket = WebSocketServer.getSocketByConversationId(conversation.conversationId);
      socket && socket.send(JSON.stringify(payload));
      successCount++;
    } catch (err) {
      if (firstErrorMessage === '') {
        firstErrorMessage = err;
      }
    }
  }
  const id = `Processed ${successCount} of ${activities.length} activities successfully.${firstErrorMessage}`;
  const response = createResourceResponse(id);
  res.send(HttpStatus.OK, response);
  res.end();
  next();
}
