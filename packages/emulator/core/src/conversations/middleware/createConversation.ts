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
import BotEndpoint from '../../facility/botEndpoint';
import Conversation from '../../facility/conversation';
import createAPIException from '../../utils/createResponse/apiException';
import createConversationResponse from '../../utils/createResponse/conversation';
import ErrorCodes from '../../types/errorCodes';
import ConversationParameters from '../../types/activity/conversationParameters';
import sendErrorResponse from '../../utils/sendErrorResponse';

export default function createConversation(botEmulator: BotEmulator) {
  return (req: Restify.Request, res: Restify.Response, next: Restify.Next): any => {
    const botEndpoint: BotEndpoint = (req as any).botEndpoint;
    const conversationParameters = req.body as ConversationParameters;

    try {
      if (conversationParameters.members === null) {
        throw createAPIException(HttpStatus.BAD_REQUEST, ErrorCodes.MissingProperty, 'members missing');
      }

      if (conversationParameters.members.length !== 1) {
        throw createAPIException(HttpStatus.BAD_REQUEST, ErrorCodes.BadSyntax,
          'emulator only supports creating conversation with 1 user');
      }

      if (conversationParameters.members[0].id !== botEmulator.facilities.users.currentUserId) {
        throw createAPIException(HttpStatus.BAD_REQUEST, ErrorCodes.BadSyntax,
          'Emulator only supports creating conversation with the current user');
      }

      if (conversationParameters.bot === null) {
        throw createAPIException(HttpStatus.BAD_REQUEST, ErrorCodes.MissingProperty, 'missing Bot property');
      }

      if (conversationParameters.bot.id !== this.botId) {
        throw createAPIException(HttpStatus.BAD_REQUEST, ErrorCodes.BadArgument,
          'conversationParameters.bot.id doesn\'t match security bot id');
      }

      if (!botEndpoint) {
        throw createAPIException(HttpStatus.BAD_REQUEST, ErrorCodes.MissingProperty,
          'Emulator only supports bot-created conversation with AppID-bearing bot');
      }

      // let newUsers: User[] = [];

      // // merge users in
      // for (let key in conversationParameters.members) {
      //   newUsers.push({
      //     id: conversationParameters.members[key].id,
      //     name: conversationParameters.members[key].name
      //   });
      // }
      // getStore().dispatch({
      //   type: "Users_AddUsers",
      //   state: { users: newUsers }
      // });

      let newConversation: Conversation;

      if (conversationParameters.conversationId) {
        newConversation = botEmulator.facilities.conversations.conversationById(conversationParameters.conversationId);
      }

      if (!newConversation) {
        newConversation = botEmulator.facilities.conversations.newConversation(
          botEmulator,
          botEndpoint,
          {
            id: conversationParameters.members[0].id,
            name: conversationParameters.members[0].name
          },
          conversationParameters.conversationId
        );
      }

      let activityId: string = null;

      if (conversationParameters.activity !== null) {
        // set routing information for new conversation
        conversationParameters.activity.conversation = { id: newConversation.conversationId };
        conversationParameters.activity.from = { id: botEndpoint.botId };
        conversationParameters.activity.recipient = { id: conversationParameters.members[0].id };

        const response1 = newConversation.postActivityToUser(conversationParameters.activity);

        activityId = response1.id;
      }

      const response = createConversationResponse(newConversation.conversationId, activityId);

      res.send(HttpStatus.OK, response);
      res.end();
    } catch (err) {
      sendErrorResponse(req, res, next, err);
    }

    next();
  };
}
