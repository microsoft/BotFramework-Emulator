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

import getBotEndpoint from '../middleware/getBotEndpoint';
import getFacility from '../middleware/getFacility';
import getRouteName from '../middleware/getRouteName';
import createBotFrameworkAuthenticationMiddleware from '../utils/botFrameworkAuthentication';
import createJsonBodyParserMiddleware from '../utils/jsonBodyParser';

import emulateOAuthCards from './middleware/emulateOAuthCards';
import getToken from './middleware/getToken';
import signOut from './middleware/signOut';
import tokenResponse from './middleware/tokenResponse';
import registerRoutes from './registerRoutes';

jest.mock('../middleware/getBotEndpoint', () => jest.fn(() => null));
jest.mock('../middleware/getFacility', () => jest.fn(() => null));
jest.mock('../middleware/getRouteName', () => jest.fn(() => null));
jest.mock('../utils/botFrameworkAuthentication', () => jest.fn(() => null));
jest.mock('../utils/jsonBodyParser', () => jest.fn(() => null));
jest.mock('./middleware/emulateOAuthCards', () => jest.fn(() => null));
jest.mock('./middleware/getToken', () => jest.fn(() => null));
jest.mock('./middleware/signOut', () => jest.fn(() => null));
jest.mock('./middleware/tokenResponse', () => jest.fn(() => null));

describe('registerRoutes', () => {
  it('should register routes', () => {
    const get = jest.fn(() => null);
    const post = jest.fn(() => null);
    const del = jest.fn(() => null);
    const server: any = {
      get,
      post,
      del,
    };
    const uses = [];
    const emulator: any = {
      options: { fetch: () => null },
    };
    const jsonBodyParser = createJsonBodyParserMiddleware();
    const verifyBotFramework = createBotFrameworkAuthenticationMiddleware(emulator.options.fetch);
    const botEndpoint = getBotEndpoint(emulator);
    const facility = getFacility('api');
    registerRoutes(emulator, server, uses);

    expect(get).toHaveBeenCalledWith(
      '/api/usertoken/GetToken',
      verifyBotFramework,
      botEndpoint,
      facility,
      getRouteName('getToken'),
      getToken(emulator)
    );

    expect(post).toHaveBeenCalledWith(
      '/api/usertoken/emulateOAuthCards',
      verifyBotFramework,
      facility,
      getRouteName('emulateOAuthCards'),
      emulateOAuthCards(emulator)
    );

    expect(del).toHaveBeenCalledWith(
      '/api/usertoken/SignOut',
      verifyBotFramework,
      botEndpoint,
      facility,
      getRouteName('signOut'),
      signOut(emulator)
    );

    expect(post).toHaveBeenCalledWith(
      '/api/usertoken/tokenResponse',
      ...uses,
      jsonBodyParser,
      facility,
      getRouteName('tokenResponse'),
      tokenResponse(emulator)
    );
  });
});
