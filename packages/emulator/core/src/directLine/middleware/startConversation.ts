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
import onErrorResumeNext from 'on-error-resume-next';
import * as Restify from 'restify';

import { BotEmulator } from '../../botEmulator';
import BotEndpoint from '../../facility/botEndpoint';
import uniqueId from '../../utils/uniqueId';

export default function startConversation(botEmulator: BotEmulator) {
  return async (req: Restify.Request, res: Restify.Response, next: Restify.Next): Promise<any> => {
    const auth = req.header('Authorization');

    // TODO: We should not use token as conversation ID
    const tokenMatch = /Bearer\s+(.+)/.exec(auth);
    const botEndpoint: BotEndpoint = (req as any).botEndpoint;
    const conversationId =
      onErrorResumeNext(() => {
        const optionsJson = new Buffer(tokenMatch[1], 'base64').toString('utf8');

        return JSON.parse(optionsJson).conversationId;
      }) || uniqueId();
    const { users, conversations } = botEmulator.facilities;
    const currentUser = users.usersById(users.currentUserId);

    let created = false;
    let conversation = conversations.conversationById(conversationId);

    if (!conversation) {
      conversation = conversations.newConversation(botEmulator, botEndpoint, currentUser, conversationId);
      // Sends "bot added to conversation"
      await conversation.sendConversationUpdate([{ id: botEndpoint.botId, name: 'Bot' }], undefined);
      // Sends "user added to conversation"
      await conversation.sendConversationUpdate([currentUser], undefined);
      created = true;
    } else {
      const botIsNotInConversation = conversation.members.findIndex(user => user.id === botEndpoint.botId) === -1;
      if (botEndpoint && botIsNotInConversation) {
        // Adds bot to conversation and sends "bot added to conversation"
        conversation.addMember(botEndpoint.botId, 'Bot');
      } else {
        // Sends "bot added to conversation"
        await conversation.sendConversationUpdate([{ id: botEndpoint.botId, name: 'Bot' }], undefined);
      }

      const userIsNotInConversation = conversation.members.findIndex(user => user.id === currentUser.id) === -1;
      if (userIsNotInConversation) {
        // Adds user to conversation and sends "user added to conversation"
        conversation.addMember(currentUser.id, currentUser.name);
      } else {
        // Sends "user added to conversation"
        await conversation.sendConversationUpdate([currentUser], undefined);
      }
    }

    (req as any).conversation = conversation;

    // TODO: We should issue a real token, rather than a conversation ID
    res.json(created ? HttpStatus.CREATED : HttpStatus.OK, {
      conversationId: conversation.conversationId,
      token: botEndpoint && botEndpoint.id,
      // eslint-disable-next-line typescript/camelcase
      expires_in: Math.pow(2, 31) - 1,
      streamUrl: '',
    });

    res.end();

    next();
  };
}
