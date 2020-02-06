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

import { createJsonBodyParserMiddleware } from '../../utils/jsonBodyParser';
import { EmulatorRestServer } from '../../restServer';

import { addUsers } from './handlers/addUsers';
import { contactAdded } from './handlers/contactAdded';
import { contactRemoved } from './handlers/contactRemoved';
import { deleteUserData } from './handlers/deleteUserData';
import { createGetConversationHandler } from './handlers/getConversation';
import { getUsers } from './handlers/getUsers';
import { ping } from './handlers/ping';
import { removeUsers } from './handlers/removeUsers';
import { sendTokenResponse } from './handlers/sendTokenResponse';
import { sendTyping } from './handlers/sendTyping';
import { createGetConversationEndpointHandler } from './handlers/getConversationEndpoint';
import { createUpdateConversationHandler } from './handlers/updateConversation';
import { createInitialReportHandler } from './handlers/initialReport';
import { createFeedActivitiesAsTranscriptHandler } from './handlers/feedActivitiesAsTranscript';
import { getWebSocketPort } from './handlers/getWebSocketPort';
import { createTrackActivityHandler } from './handlers/trackActivity';

export function mountEmulatorRoutes(emulatorServer: EmulatorRestServer) {
  const { server, state } = emulatorServer;
  const getConversation = createGetConversationHandler(state);
  const jsonBodyParser = createJsonBodyParserMiddleware();

  server.get('/emulator/:conversationId/endpoint', createGetConversationEndpointHandler(state));

  server.get('/emulator/:conversationId/users', getConversation, getUsers);

  server.post('/emulator/:conversationId/users', jsonBodyParser, getConversation, addUsers);

  server.del('/emulator/:conversationId/users', getConversation, removeUsers);

  server.post('/emulator/:conversationId/contacts', getConversation, contactAdded);

  server.del('/emulator/:conversationId/contacts', getConversation, contactRemoved);

  server.post('/emulator/:conversationId/typing', getConversation, sendTyping);

  server.post('/emulator/:conversationId/ping', getConversation, ping);

  server.del('/emulator/:conversationId/userdata', getConversation, deleteUserData);

  server.post('/emulator/:conversationId/invoke/sendTokenResponse', jsonBodyParser, sendTokenResponse);

  server.put('/emulator/:conversationId', jsonBodyParser, createUpdateConversationHandler(state));

  server.post(
    '/emulator/:conversationId/invoke/initialReport',
    jsonBodyParser,
    createInitialReportHandler(emulatorServer)
  );

  server.post(
    '/emulator/:conversationId/transcript',
    jsonBodyParser,
    createFeedActivitiesAsTranscriptHandler(emulatorServer)
  );

  server.get('/emulator/ws/port', getWebSocketPort);

  server.post('/emulator/:conversationId/activity/track', jsonBodyParser, createTrackActivityHandler(state));
}
