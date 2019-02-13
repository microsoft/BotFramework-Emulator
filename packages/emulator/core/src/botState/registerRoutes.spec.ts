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

import getFacility from '../middleware/getFacility';
import getRouteName from '../middleware/getRouteName';
import createBotFrameworkAuthenticationMiddleware from '../utils/botFrameworkAuthentication';
import jsonBodyParser from '../utils/jsonBodyParser';

import registerRoutes from './registerRoutes';
import deleteStateForUser from './middleware/deleteStateForUser';
import createFetchBotDataMiddleware from './middleware/fetchBotData';
import getConversationData from './middleware/getConversationData';
import getPrivateConversationData from './middleware/getPrivateConversationData';
import getUserData from './middleware/getUserData';
import setConversationData from './middleware/setConversationData';
import setPrivateConversationData from './middleware/setPrivateConversationData';
import setUserData from './middleware/setUserData';

jest.mock('../middleware/getFacility', () => jest.fn(() => null));
jest.mock('../middleware/getRouteName', () => jest.fn(() => null));
jest.mock('../utils/botFrameworkAuthentication', () => jest.fn(() => null));
jest.mock('../utils/jsonBodyParser', () => jest.fn(() => null));
jest.mock('./middleware/deleteStateForUser', () => jest.fn(() => null));
jest.mock('./middleware/fetchBotData', () => jest.fn(() => null));
jest.mock('./middleware/getConversationData', () => jest.fn(() => null));
jest.mock('./middleware/getPrivateConversationData', () => jest.fn(() => null));
jest.mock('./middleware/getUserData', () => jest.fn(() => null));
jest.mock('./middleware/setConversationData', () => jest.fn(() => null));
jest.mock('./middleware/setPrivateConversationData', () => jest.fn(() => null));
jest.mock('./middleware/setUserData', () => jest.fn(() => null));

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
    const verifyBotFramework = createBotFrameworkAuthenticationMiddleware(emulator.options.fetch);
    const fetchBotDataMiddleware = createFetchBotDataMiddleware(emulator);
    const facility = getFacility('state');
    registerRoutes(emulator, server, uses);

    expect(get).toHaveBeenCalledWith(
      '/v3/botstate/:channelId/users/:userId',
      ...uses,
      verifyBotFramework,
      fetchBotDataMiddleware,
      facility,
      getRouteName('getUserData'),
      getUserData(emulator)
    );

    expect(get).toHaveBeenCalledWith(
      '/v3/botstate/:channelId/conversations/:conversationId',
      ...uses,
      verifyBotFramework,
      fetchBotDataMiddleware,
      facility,
      getRouteName('getConversationData'),
      getConversationData(emulator)
    );

    expect(get).toHaveBeenCalledWith(
      '/v3/botstate/:channelId/conversations/:conversationId/users/:userId',
      ...uses,
      verifyBotFramework,
      fetchBotDataMiddleware,
      facility,
      getRouteName('getPrivateConversationData'),
      getPrivateConversationData(emulator)
    );

    expect(post).toHaveBeenCalledWith(
      '/v3/botstate/:channelId/users/:userId',
      ...uses,
      verifyBotFramework,
      jsonBodyParser(),
      facility,
      getRouteName('setUserData'),
      setUserData(emulator)
    );

    expect(post).toHaveBeenCalledWith(
      '/v3/botstate/:channelId/conversations/:conversationId',
      ...uses,
      verifyBotFramework,
      jsonBodyParser(),
      facility,
      getRouteName('setConversationData'),
      setConversationData(emulator)
    );

    expect(post).toHaveBeenCalledWith(
      '/v3/botstate/:channelId/conversations/:conversationId/users/:userId',
      ...uses,
      verifyBotFramework,
      jsonBodyParser(),
      facility,
      getRouteName('setPrivateConversationData'),
      setPrivateConversationData(emulator)
    );

    expect(del).toHaveBeenCalledWith(
      '/v3/botstate/:channelId/users/:userId',
      ...uses,
      verifyBotFramework,
      facility,
      getRouteName('deleteStateForUser'),
      deleteStateForUser(emulator)
    );
  });
});
