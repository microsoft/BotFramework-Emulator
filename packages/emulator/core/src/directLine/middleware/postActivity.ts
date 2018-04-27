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
import * as Restify from 'restify';

import BotEmulator from '../../botEmulator';
import Conversation from '../../facility/conversation';
import IGenericActivity from '../../types/activity/generic';
import statusCodeFamily from '../../utils/statusCodeFamily';

export default function postActivity(botEmulator: BotEmulator) {
  const { logError, logRequest, logResponse } = botEmulator.facilities.logger;

  return async (req: Restify.Request, res: Restify.Response, next: Restify.Next) => {
    logRequest(req.params.conversationId, 'user', req);

    // const conversation = botEmulator.facilities.conversations.conversationById(req.params.conversationId);
    const conversation: Conversation = req['conversation'];

    if (!conversation) {
      res.send(HttpStatus.NOT_FOUND, 'conversation not found');
      res.end();

      logError(req.params.conversationId, 'Cannot post activity. Conversation not found.');
      logResponse(req.params.conversationId, 'user', res);

      return;
    }

    const activity = <IGenericActivity>req.body;

    try {
      const { activityId, response, statusCode } = await conversation.postActivityToBot(activity, true);

      //logNetwork(conversation.conversationId, req, res, `[${activity.type}]`);
      if (!statusCodeFamily(statusCode, 200)) {
        res.send(statusCode || HttpStatus.INTERNAL_SERVER_ERROR);

        logResponse(req.params.conversationId, 'user', res);
        logError(req.params.conversationId, { message: await response.text(), statusCode });
      } else {
        res.send(statusCode, { id: activityId });

        logResponse(req.params.conversationId, 'user', res);
      }
    } catch (err) {
      logError(req.params.conversationId, err);
      res.send(HttpStatus.INTERNAL_SERVER_ERROR);
    }

    res.end();
  };
}
