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

import { createGetBotEndpointMiddleware } from '../handlers/getBotEndpoint';
import { createJsonBodyParserMiddleware } from '../../utils/jsonBodyParser';
import { EmulatorRestServer } from '../../restServer';

import { getActivities } from './handlers/getActivities';
import { createGetConversationHandler } from './handlers/getConversation';
import { options } from './handlers/options';
import { createPostActivityHandler } from './handlers/postActivity';
import { createReconnectToConversationHandler } from './handlers/reconnectToConversation';
import { createStartConversationHandler } from './handlers/startConversation';
import { stream } from './handlers/stream';
import { createUploadHandler } from './handlers/upload';

export function mountDirectLineRoutes(emulatorServer: EmulatorRestServer) {
  const { server, state } = emulatorServer;
  const jsonBodyParser = createJsonBodyParserMiddleware();
  const getBotEndpoint = createGetBotEndpointMiddleware(state);
  const getConversation = createGetConversationHandler(state);

  server.opts('/v3/directline', options);

  server.post(
    '/v3/directline/conversations',
    getBotEndpoint,
    jsonBodyParser,
    createStartConversationHandler(emulatorServer)
  );

  server.get(
    '/v3/directline/conversations/:conversationId',
    getBotEndpoint,
    getConversation,
    createReconnectToConversationHandler(emulatorServer)
  );

  server.get('/v3/directline/conversations/:conversationId/activities', getBotEndpoint, getConversation, getActivities);

  server.post(
    '/v3/directline/conversations/:conversationId/activities',
    jsonBodyParser,
    getBotEndpoint,
    getConversation,
    createPostActivityHandler(emulatorServer)
  );

  server.post(
    '/v3/directline/conversations/:conversationId/upload',
    getBotEndpoint,
    getConversation,
    createUploadHandler(emulatorServer)
  );

  server.get('/v3/directline/conversations/:conversationId/stream', stream);
}
