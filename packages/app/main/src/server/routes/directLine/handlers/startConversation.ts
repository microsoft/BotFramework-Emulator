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
import { Request, Response } from 'restify';
import { uniqueIdv4 } from '@bfemulator/sdk-shared';

import { BotEndpoint } from '../../../state/botEndpoint';
import { uniqueId } from '../../../utils/uniqueId';
import { EmulatorRestServer } from '../../../restServer';

// TODO: Remove?
// Not called anymore because of WebSocket flow
export function createStartConversationHandler(emulatorServer: EmulatorRestServer) {
  return async (req: Request, res: Response): Promise<any> => {
    const auth = req.header('Authorization');

    // TODO: We should not use token as conversation ID
    const tokenMatch = /Bearer\s+(.+)/.exec(auth);
    const botEndpoint: BotEndpoint = (req as any).botEndpoint;
    const conversationId =
      onErrorResumeNext(() => {
        const optionsJson = Buffer.from(tokenMatch[1], 'base64').toString('utf8');

        return JSON.parse(optionsJson).conversationId;
      }) || uniqueId();
    const { conversations } = emulatorServer.state;
    let currentUser = { id: uniqueIdv4(), name: 'User' };

    let created = false;
    let conversation = conversations.conversationById(conversationId);

    if (!conversation) {
      conversation = conversations.newConversation(emulatorServer, botEndpoint, currentUser, conversationId);

      // Send a ConversationUpdate activity adding the bot and user to the conversation
      await conversation.sendConversationUpdate([currentUser, { id: botEndpoint.botId, name: 'Bot' }], undefined);
      created = true;
    } else if (botEndpoint && !conversationId.endsWith('transcript')) {
      currentUser = conversation.user;
      const membersToAddInConversationUpdate = [];

      const userIsNotInConversation = conversation.members.findIndex(user => user.id === currentUser.id) === -1;
      if (userIsNotInConversation) {
        // Adds user to conversation and sends "user added to conversation"
        conversation.addMember(currentUser.id, currentUser.name);
      } else {
        // Sends "user added to conversation"
        membersToAddInConversationUpdate.push(currentUser);
      }

      const botIsNotInConversation = conversation.members.findIndex(user => user.id === botEndpoint.botId) === -1;
      if (botIsNotInConversation) {
        // Adds bot to conversation and sends "bot added to conversation"
        conversation.addMember(botEndpoint.botId, 'Bot');
      } else {
        // Sends "bot added to conversation"
        membersToAddInConversationUpdate.push({ id: botEndpoint.botId, name: 'Bot' });
      }

      if (membersToAddInConversationUpdate.length) {
        await conversation.sendConversationUpdate(membersToAddInConversationUpdate, undefined);
      }
    }

    (req as any).conversation = conversation;

    // TODO: We should issue a real token, rather than a conversation ID
    res.json(created ? HttpStatus.CREATED : HttpStatus.OK, {
      conversationId: conversation.conversationId,
      token: botEndpoint && botEndpoint.id,
      expires_in: Math.pow(2, 31) - 1,
      streamUrl: '',
    });

    res.end();
  };
}
