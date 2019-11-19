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

import { getActivities } from './handlers/getActivities';
import { createGetConversationHandler } from './handlers/getConversation';
import { options } from './handlers/options';
import { createPostActivityHandler } from './handlers/postActivity';
import { createReconnectToConversationHandler } from './handlers/reconnectToConversation';
import { createStartConversationHandler } from './handlers/startConversation';
import { stream } from './handlers/stream';
import { createUploadHandler } from './handlers/upload';
import { mountDirectLineRoutes } from './mountDirectLineRoutes';

jest.mock('../handlers/getBotEndpoint', () => ({ createGetBotEndpointMiddleware: jest.fn(() => null) }));
jest.mock('../../utils/jsonBodyParser', () => ({ createJsonBodyParserMiddleware: jest.fn(() => null) }));
jest.mock('./handlers/getActivities', () => ({ getActivities: jest.fn(() => null) }));
jest.mock('./handlers/getConversation', () => ({ createGetConversationHandler: jest.fn(() => null) }));
jest.mock('./handlers/options', () => ({ options: jest.fn(() => null) }));
jest.mock('./handlers/postActivity', () => ({ createPostActivityHandler: jest.fn(() => null) }));
jest.mock('./handlers/reconnectToConversation', () => ({ createReconnectToConversationHandler: jest.fn(() => null) }));
jest.mock('./handlers/startConversation', () => ({ createStartConversationHandler: jest.fn(() => null) }));
jest.mock('./handlers/stream', () => ({ stream: jest.fn(() => null) }));
jest.mock('./handlers/upload', () => ({ createUploadHandler: jest.fn(() => null) }));

describe('registerRoutes', () => {
  it('should register routes', () => {
    const get = jest.fn(() => null);
    const post = jest.fn(() => null);
    const opts = jest.fn(() => null);
    const server: any = {
      get,
      post,
      opts,
    };
    const emulatorServer: any = {
      options: { fetch: () => null },
      server,
      state: {},
    };
    const jsonBodyParser = createJsonBodyParserMiddleware();
    const botEndpoint = createGetBotEndpointMiddleware(emulatorServer.state);
    const conversation = createGetConversationHandler(emulatorServer.state);
    mountDirectLineRoutes(emulatorServer);

    expect(opts).toHaveBeenCalledWith('/v3/directline', options);

    expect(post).toHaveBeenCalledWith(
      '/v3/directline/conversations',
      botEndpoint,
      jsonBodyParser,
      createStartConversationHandler(emulatorServer)
    );

    expect(get).toHaveBeenCalledWith(
      '/v3/directline/conversations/:conversationId',
      botEndpoint,
      conversation,
      createReconnectToConversationHandler(emulatorServer)
    );

    expect(get).toHaveBeenCalledWith(
      '/v3/directline/conversations/:conversationId/activities',
      botEndpoint,
      conversation,
      getActivities
    );

    expect(post).toHaveBeenCalledWith(
      '/v3/directline/conversations/:conversationId/activities',
      jsonBodyParser,
      botEndpoint,
      conversation,
      createPostActivityHandler(emulatorServer)
    );

    expect(post).toHaveBeenCalledWith(
      '/v3/directline/conversations/:conversationId/upload',
      botEndpoint,
      conversation,
      createUploadHandler(emulatorServer)
    );

    expect(get).toHaveBeenCalledWith('/v3/directline/conversations/:conversationId/stream', stream);
  });
});
