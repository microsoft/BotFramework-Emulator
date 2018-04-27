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

import Bot from '../../bot';
import uniqueId from '../../utils/uniqueId';

export default function startConversation(bot: Bot) {
  const { logRequest, logResponse } = bot.facilities.logger;

  return (req: Restify.Request, res: Restify.Response, next: Restify.Next): any => {
    const auth = req.header('Authorization');

    // TODO: We should not use token as conversation ID
    const tokenMatch = /Bearer\s+(.+)/.exec(auth);
    let options;
    if (!tokenMatch || tokenMatch[1] === 'null') {
      options = {
        conversationId: uniqueId()
      }
    } else {
      const data = tokenMatch[1];
      const buffer = new Buffer(data, 'base64');
      const json = buffer.toString('utf8');
      options = JSON.parse(json);
    }

    const currentUser = bot.facilities.users.usersById(bot.facilities.users.currentUserId);

    const conversationId = options.conversationId;

    logRequest(conversationId, 'user', req);

    let created = false;
    let conversation = bot.facilities.conversations.conversationById(conversationId);

    if (!conversation) {
      conversation = bot.facilities.conversations.newConversation(bot, currentUser, conversationId);
      // Send "bot added to conversation"
      conversation.sendConversationUpdate([{ id: bot.botId, name: 'Bot' }], undefined);
      // Send "user added to conversation"
      conversation.sendConversationUpdate([currentUser], undefined);
      created = true;
    } else {
      if (conversation.members.findIndex(user => user.id === bot.botId) === -1) {
        // Sends "bot added to conversation"
        conversation.addMember(bot.botId, 'Bot');
      }

      if (conversation.members.findIndex(user => user.id === currentUser.id) === -1) {
        // Sends "user added to conversation"
        conversation.addMember(currentUser.id, currentUser.name);
      }
    }

    // TODO: We should issue a real token, rather than a conversation ID
    res.json(created ? HttpStatus.CREATED : HttpStatus.OK, {
      conversationId: conversation.conversationId,
      token: conversation.conversationId,
      expires_in: (2 ^ 31) - 1,
      streamUrl: ''
    });

    res.end();

    logResponse(conversationId, 'user', res);
  };
}
