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

import { createGetBotEndpointMiddleware } from '../../handlers/getBotEndpoint';
import { createBotFrameworkAuthenticationMiddleware } from '../../handlers/botFrameworkAuthentication';
import { createJsonBodyParserMiddleware } from '../../../utils/jsonBodyParser';

import { mountUserTokenRoutes } from './mountUserTokenRoutes';
import { emulateOAuthCards } from './handlers/emulateOAuthCards';
import { getToken } from './handlers/getToken';
import { signOut } from './handlers/signOut';
import { createTokenResponseHandler } from './handlers/tokenResponse';

jest.mock('../../handlers/getBotEndpoint', () => ({
  createGetBotEndpointMiddleware: jest.fn(),
}));
jest.mock('../../handlers/botFrameworkAuthentication', () => ({
  createBotFrameworkAuthenticationMiddleware: jest.fn(),
}));
jest.mock('../../../utils/jsonBodyParser', () => ({
  createJsonBodyParserMiddleware: jest.fn(),
}));
jest.mock('./handlers/tokenResponse', () => ({
  createTokenResponseHandler: jest.fn(),
}));

describe('mountUserTokenRoutes', () => {
  it('should mount the routes', () => {
    const emulatorServer: any = {
      options: { fetch: jest.fn() },
      server: {
        del: jest.fn(),
        get: jest.fn(),
        post: jest.fn(),
      },
      state: {},
    };
    const jsonBodyParser = createJsonBodyParserMiddleware();
    const botFrameworkAuthentication = createBotFrameworkAuthenticationMiddleware(emulatorServer.server.state);
    const getBotEndpoint = createGetBotEndpointMiddleware(emulatorServer.server.state);
    mountUserTokenRoutes(emulatorServer);

    expect(emulatorServer.server.get).toHaveBeenCalledWith(
      '/api/usertoken/GetToken',
      botFrameworkAuthentication,
      getBotEndpoint,
      getToken
    );

    expect(emulatorServer.server.post).toHaveBeenCalledWith(
      '/api/usertoken/emulateOAuthCards',
      botFrameworkAuthentication,
      emulateOAuthCards
    );

    expect(emulatorServer.server.del).toHaveBeenCalledWith(
      '/api/usertoken/SignOut',
      botFrameworkAuthentication,
      getBotEndpoint,
      signOut
    );

    expect(emulatorServer.server.post).toHaveBeenCalledWith(
      '/api/usertoken/tokenResponse',
      jsonBodyParser,
      createTokenResponseHandler(emulatorServer)
    );
  });
});
