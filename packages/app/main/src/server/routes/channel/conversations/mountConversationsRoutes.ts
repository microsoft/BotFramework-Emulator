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

import { createBotFrameworkAuthenticationMiddleware } from '../../handlers/botFrameworkAuthentication';
import { createJsonBodyParserMiddleware } from '../../../utils/jsonBodyParser';
import { EmulatorRestServer } from '../../../restServer';

import { createCreateConversationHandler } from './handlers/createConversation';
import { deleteActivity } from './handlers/deleteActivity';
import { createGetConversationHandler } from './handlers/getConversation';
import { getActivityMembers } from './handlers/getActivityMembers';
import { getConversationMembers } from './handlers/getConversationMembers';
import { createReplyToActivityHandler } from './handlers/replyToActivity';
import { sendActivityToConversation } from './handlers/sendActivityToConversation';
import { sendHistoryToConversation } from './handlers/sendHistoryToConversation';
import { updateActivity } from './handlers/updateActivity';
import { createUploadAttachmentHandler } from './handlers/uploadAttachment';
import { createGetConversationsHandler } from './handlers/getConversations';
import { createGetBotEndpointHandler } from './handlers/getBotEndpoint';
import { getActivitiesForConversation } from './handlers/getActivitiesForConversation';

export function mountConversationsRoutes(emulatorServer: EmulatorRestServer) {
  const { server, state } = emulatorServer;
  const verifyBotFramework = createBotFrameworkAuthenticationMiddleware(emulatorServer.options.fetch, state);
  const jsonBodyParser = createJsonBodyParserMiddleware();
  const fetchConversation = createGetConversationHandler(state);

  server.post(
    '/v3/conversations',
    verifyBotFramework,
    jsonBodyParser,
    createGetBotEndpointHandler(state),
    createCreateConversationHandler(emulatorServer)
  );

  server.post(
    '/v3/conversations/:conversationId/activities',
    verifyBotFramework,
    jsonBodyParser,
    fetchConversation,
    sendActivityToConversation
  );

  server.post(
    '/v3/conversations/:conversationId/activities/history',
    verifyBotFramework,
    jsonBodyParser,
    fetchConversation,
    sendHistoryToConversation
  );

  server.post(
    '/v3/conversations/:conversationId/activities/:activityId',
    verifyBotFramework,
    jsonBodyParser,
    fetchConversation,
    createReplyToActivityHandler(emulatorServer)
  );

  server.put(
    '/v3/conversations/:conversationId/activities/:activityId',
    verifyBotFramework,
    jsonBodyParser,
    fetchConversation,
    updateActivity
  );

  server.del(
    '/v3/conversations/:conversationId/activities/:activityId',
    verifyBotFramework,
    fetchConversation,
    deleteActivity
  );

  server.get('/v3/conversations', verifyBotFramework, createGetConversationsHandler(state));

  server.get(
    '/v3/conversations/:conversationId/members',
    verifyBotFramework,
    fetchConversation,
    getConversationMembers
  );

  server.get(
    '/v3/conversations/:conversationId/activities/:activityId/members',
    verifyBotFramework,
    fetchConversation,
    getActivityMembers
  );

  server.post(
    '/v3/conversations/:conversationId/attachments',
    verifyBotFramework,
    jsonBodyParser,
    createUploadAttachmentHandler(state)
  );

  server.get(
    '/v3/conversations/:conversationId/activities',
    verifyBotFramework,
    jsonBodyParser,
    getActivitiesForConversation(state)
  );
}
