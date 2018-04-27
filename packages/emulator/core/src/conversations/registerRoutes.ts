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

import { RequestHandler, Server } from 'restify';

import Bot from '../bot';
import createBotFrameworkAuthenticationMiddleware from '../utils/botFrameworkAuthentication';
import IUser from '../types/user';
import createJsonBodyParser from '../utils/jsonBodyParser';

import createConversation from './middleware/createConversation';
import createFetchConversationMiddleware from './middleware/fetchConversation';
import deleteActivity from './middleware/deleteActivity';
import getActivityMembers from './middleware/getActivityMembers';
import getConversationMembers from './middleware/getConversationMembers';
import replyToActivity from './middleware/replyToActivity';
import sendToConversation from './middleware/sendToConversation';
import updateActivity from './middleware/updateActivity';
import uploadAttachment from './middleware/uploadAttachment';

export default function registerRoutes(bot: Bot, server: Server, uses: RequestHandler[]) {
  const verifyBotFramework = bot.msaAppId ? createBotFrameworkAuthenticationMiddleware(bot.botId, bot.options.fetch) : [];
  const jsonBodyParser = createJsonBodyParser();
  const fetchConversation = createFetchConversationMiddleware(bot);

  server.post(
    '/v3/conversations',
    ...uses,
    verifyBotFramework,
    jsonBodyParser,
    createConversation(bot)
  );

  server.post(
    '/v3/conversations/:conversationId/activities',
    ...uses,
    verifyBotFramework,
    jsonBodyParser,
    fetchConversation,
    sendToConversation(bot)
  );

  server.post(
    '/v3/conversations/:conversationId/activities/:activityId',
    ...uses,
    verifyBotFramework,
    jsonBodyParser,
    fetchConversation,
    replyToActivity(bot)
  );

  server.put(
    '/v3/conversations/:conversationId/activities/:activityId',
    ...uses,
    verifyBotFramework,
    jsonBodyParser,
    fetchConversation,
    updateActivity(bot)
  );

  server.del(
    '/v3/conversations/:conversationId/activities/:activityId',
    ...uses,
    verifyBotFramework,
    fetchConversation,
    deleteActivity(bot)
  );

  server.get(
    '/v3/conversations/:conversationId/members',
    ...uses,
    verifyBotFramework,
    fetchConversation,
    getConversationMembers(bot)
  );

  server.get(
    '/v3/conversations/:conversationId/activities/:activityId/members',
    ...uses,
    verifyBotFramework,
    fetchConversation,
    getActivityMembers(bot)
  );

  server.post(
    '/v3/conversations/:conversationId/attachments',
    ...uses,
    verifyBotFramework,
    jsonBodyParser,
    uploadAttachment(bot)
  );
}
