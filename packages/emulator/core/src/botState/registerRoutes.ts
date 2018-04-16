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
import jsonBodyParser from '../utils/jsonBodyParser';

import createFetchBotDataMiddleware from './middleware/fetchBotData';
import getConversationData from './middleware/getConversationData';
import getPrivateConversationData from './middleware/getPrivateConversationData';
import getUserData from './middleware/getUserData';
import setUserData from './middleware/setUserData';
import setConversationData from './middleware/setConversationData';
import setPrivateConversationData from './middleware/setPrivateConversationData';
import deleteStateForUser from './middleware/deleteStateForUser';

export default function registerRoutes(bot: Bot, server: Server, uses: RequestHandler[]) {
  const verifyBotFramework = bot.msaAppId ? createBotFrameworkAuthenticationMiddleware(bot.botId, bot.options.fetch) : [];
  const fetchBotDataMiddleware = createFetchBotDataMiddleware(bot);

  server.get(
    '/v3/botstate/:channelId/users/:userId',
    ...uses,
    verifyBotFramework,
    fetchBotDataMiddleware,
    getUserData(bot)
  );

  server.get(
    '/v3/botstate/:channelId/conversations/:conversationId',
    ...uses,
    verifyBotFramework,
    fetchBotDataMiddleware,
    getConversationData(bot)
  );

  server.get(
    '/v3/botstate/:channelId/conversations/:conversationId/users/:userId',
    ...uses,
    verifyBotFramework,
    fetchBotDataMiddleware,
    getPrivateConversationData(bot)
  );

  server.post(
    '/v3/botstate/:channelId/users/:userId',
    ...uses,
    verifyBotFramework,
    jsonBodyParser(),
    setUserData(bot)
  );

  server.post(
    '/v3/botstate/:channelId/conversations/:conversationId',
    ...uses,
    verifyBotFramework,
    jsonBodyParser(),
    setConversationData(bot)
  );

  server.post(
    '/v3/botstate/:channelId/conversations/:conversationId/users/:userId',
    ...uses,
    verifyBotFramework,
    jsonBodyParser(),
    setPrivateConversationData(bot)
  );

  server.del(
    '/v3/botstate/:channelId/users/:userId',
    ...uses,
    verifyBotFramework,
    deleteStateForUser(bot)
  );
}
