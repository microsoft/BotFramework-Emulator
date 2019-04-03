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
import {
  ConversationsGetConversationsOptionalParams,
  ConversationsGetConversationsResponse,
} from 'botframework-connector/lib/connectorApi/models';

import { BotEmulator } from '../../botEmulator';
import { Conversation } from '../../index';
import sendErrorResponse from '../../utils/sendErrorResponse';

const skipWhileExpression = <T>(expression: (item: T) => boolean) => {
  let skipping = true;
  return item => {
    if (!skipping) {
      return true;
    }
    if (!expression(item)) {
      skipping = false;
    }
    return !skipping;
  };
};

export default function fetchConversation(botEmulator: BotEmulator) {
  return (req: Restify.Request, res: Restify.Response, next: Restify.Next): void => {
    const conversationParameters: ConversationsGetConversationsOptionalParams = req.params;
    const { continuationToken } = conversationParameters;
    const { conversations: api } = botEmulator.facilities;
    const conversations = api.getConversationIds().map(id => api.conversationById(id));
    const response = {} as ConversationsGetConversationsResponse;

    if (continuationToken) {
      response.conversations = conversations
        .filter(skipWhileExpression<Conversation>(a => a.conversationId !== continuationToken))
        .map(convo => ({ id: convo.conversationId, members: convo.members }));
    } else {
      response.conversations = conversations.map(convo => ({ id: convo.conversationId, members: convo.members }));
    }

    try {
      res.send(HttpStatus.OK, response);
      res.end();
    } catch (err) {
      sendErrorResponse(req, res, next, err);
    }

    next();
  };
}
