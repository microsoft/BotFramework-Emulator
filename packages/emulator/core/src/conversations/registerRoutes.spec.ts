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
import createJsonBodyParser from '../utils/jsonBodyParser';

import registerRoutes from './registerRoutes';
import createConversation from './middleware/createConversation';
import deleteActivity from './middleware/deleteActivity';
import createFetchConversationMiddleware from './middleware/fetchConversation';
import getActivityMembers from './middleware/getActivityMembers';
import getBotEndpoint from './middleware/getBotEndpoint';
import getConversationMembers from './middleware/getConversationMembers';
import replyToActivity from './middleware/replyToActivity';
import sendActivityToConversation from './middleware/sendActivityToConversation';
import sendHistoryToConversation from './middleware/sendHistoryToConversation';
import updateActivity from './middleware/updateActivity';
import uploadAttachment from './middleware/uploadAttachment';

jest.mock('../middleware/getFacility', () => jest.fn(() => null));
jest.mock('../middleware/getRouteName', () => jest.fn(() => null));
jest.mock('../utils/botFrameworkAuthentication', () => jest.fn(() => null));
jest.mock('../utils/jsonBodyParser', () => jest.fn(() => null));
jest.mock('./middleware/createConversation', () => jest.fn(() => null));
jest.mock('./middleware/deleteActivity', () => jest.fn(() => null));
jest.mock('./middleware/fetchConversation', () => jest.fn(() => null));
jest.mock('./middleware/getActivityMembers', () => jest.fn(() => null));
jest.mock('./middleware/getBotEndpoint', () => jest.fn(() => null));
jest.mock('./middleware/getConversationMembers', () => jest.fn(() => null));
jest.mock('./middleware/replyToActivity', () => jest.fn(() => null));
jest.mock('./middleware/sendActivityToConversation', () => jest.fn(() => null));
jest.mock('./middleware/sendHistoryToConversation', () => jest.fn(() => null));
jest.mock('./middleware/updateActivity', () => jest.fn(() => null));
jest.mock('./middleware/uploadAttachment', () => jest.fn(() => null));

describe('registerRoutes', () => {
  it('should register routes', () => {
    const get = jest.fn(() => null);
    const post = jest.fn(() => null);
    const del = jest.fn(() => null);
    const put = jest.fn(() => null);
    const server: any = {
      get,
      post,
      del,
      put,
    };
    const uses = [];
    const emulator: any = {
      options: { fetch: () => null },
    };
    const verifyBotFramework = createBotFrameworkAuthenticationMiddleware(emulator.options.fetch);
    const botEndpoint = getBotEndpoint(emulator);
    const facility = getFacility('conversations');
    const jsonBodyParser = createJsonBodyParser();
    const fetchConversation = createFetchConversationMiddleware(emulator);
    registerRoutes(emulator, server, uses);

    expect(post).toHaveBeenCalledWith(
      '/v3/conversations',
      ...uses,
      verifyBotFramework,
      jsonBodyParser,
      botEndpoint,
      facility,
      getRouteName('createConversation'),
      createConversation(emulator)
    );

    expect(post).toHaveBeenCalledWith(
      '/v3/conversations/:conversationId/activities',
      ...uses,
      verifyBotFramework,
      jsonBodyParser,
      fetchConversation,
      facility,
      getRouteName('sendToConversation'),
      sendActivityToConversation(emulator)
    );

    expect(post).toHaveBeenCalledWith(
      '/v3/conversations/:conversationId/activities/history',
      ...uses,
      verifyBotFramework,
      jsonBodyParser,
      fetchConversation,
      facility,
      getRouteName('sendToConversation'),
      sendHistoryToConversation(emulator)
    );

    expect(post).toHaveBeenCalledWith(
      '/v3/conversations/:conversationId/activities/:activityId',
      ...uses,
      verifyBotFramework,
      jsonBodyParser,
      fetchConversation,
      facility,
      getRouteName('replyToActivity'),
      replyToActivity(emulator)
    );

    expect(put).toHaveBeenCalledWith(
      '/v3/conversations/:conversationId/activities/:activityId',
      ...uses,
      verifyBotFramework,
      jsonBodyParser,
      fetchConversation,
      facility,
      getRouteName('updateActivity'),
      updateActivity(emulator)
    );

    expect(del).toHaveBeenCalledWith(
      '/v3/conversations/:conversationId/activities/:activityId',
      ...uses,
      verifyBotFramework,
      fetchConversation,
      facility,
      getRouteName('deleteActivity'),
      deleteActivity(emulator)
    );

    expect(get).toHaveBeenCalledWith(
      '/v3/conversations/:conversationId/members',
      ...uses,
      verifyBotFramework,
      fetchConversation,
      facility,
      getRouteName('getConversationMembers'),
      getConversationMembers(emulator)
    );

    expect(get).toHaveBeenCalledWith(
      '/v3/conversations/:conversationId/activities/:activityId/members',
      ...uses,
      verifyBotFramework,
      fetchConversation,
      facility,
      getRouteName('getActivityMembers'),
      getActivityMembers(emulator)
    );

    expect(post).toHaveBeenCalledWith(
      '/v3/conversations/:conversationId/attachments',
      ...uses,
      verifyBotFramework,
      jsonBodyParser,
      facility,
      getRouteName('uploadAttachment'),
      uploadAttachment(emulator)
    );
  });
});
