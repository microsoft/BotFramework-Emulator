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

import { ConversationParameters, ChannelAccount, ConversationAccount } from 'botframework-schema';
import * as HttpStatus from 'http-status-codes';
import * as Restify from 'restify';

import { BotEmulator } from '../../botEmulator';
import BotEndpoint from '../../facility/botEndpoint';
import Conversation from '../../facility/conversation';
import createConversationResponse from '../../utils/createResponse/conversation';
import sendErrorResponse from '../../utils/sendErrorResponse';
import uniqueId from '../../utils/uniqueId';

import { validateCreateConversationRequest } from './errorCondition/createConversationValidator';

export default function createConversation(botEmulator: BotEmulator) {
  return (req: Restify.Request, res: Restify.Response, next: Restify.Next): any => {
    const botEndpoint: BotEndpoint = (req as any).botEndpoint;
    const conversationParameters = req.body;
    const error = validateCreateConversationRequest(conversationParameters, botEndpoint);

    if (error) {
      sendErrorResponse(req, res, next, error.toAPIException());
      next();
      return;
    }

    const newConversation: Conversation = getConversation(conversationParameters, botEmulator, botEndpoint);
    const activityId = getActivityId(conversationParameters, botEndpoint, newConversation);
    const response = createConversationResponse(newConversation.conversationId, activityId);

    res.send(HttpStatus.OK, response);
    res.end();
    next();
  };
}

function getConversation(
  params: { conversationId: string; members: any[] },
  emulator: BotEmulator,
  endpoint: BotEndpoint
): Conversation {
  let conversation: Conversation;

  if (params.conversationId) {
    conversation = emulator.facilities.conversations.conversationById(params.conversationId);
  }

  if (!conversation) {
    const { members = [] } = params;
    const [member] = members;
    const { id = uniqueId(), name = 'User' } = member || {};
    conversation = emulator.facilities.conversations.newConversation(
      emulator,
      endpoint,
      { id, name },
      params.conversationId
    );
  }

  return conversation;
}

function getActivityId(
  params: ConversationParameters,
  endpoint: BotEndpoint,
  conversation: Conversation
): string | null {
  const { activity, members } = params;
  if (activity) {
    // set routing information for new conversation
    activity.conversation = { id: conversation.conversationId } as ConversationAccount;
    activity.from = { id: endpoint.botId } as ChannelAccount;
    activity.recipient = { id: members[0].id } as ChannelAccount;

    const response = conversation.postActivityToUser(activity);

    return response.id;
  }

  return null;
}
