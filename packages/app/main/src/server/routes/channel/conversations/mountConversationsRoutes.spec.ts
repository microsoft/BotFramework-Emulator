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

import { mountConversationsRoutes } from './mountConversationsRoutes';
import { createCreateConversationHandler } from './handlers/createConversation';
import { deleteActivity } from './handlers/deleteActivity';
import { createGetConversationHandler } from './handlers/getConversation';
import { getActivityMembers } from './handlers/getActivityMembers';
import { createGetBotEndpointHandler } from './handlers/getBotEndpoint';
import { getConversationMembers } from './handlers/getConversationMembers';
import { createReplyToActivityHandler } from './handlers/replyToActivity';
import { sendActivityToConversation } from './handlers/sendActivityToConversation';
import { sendHistoryToConversation } from './handlers/sendHistoryToConversation';
import { updateActivity } from './handlers/updateActivity';
import { createUploadAttachmentHandler } from './handlers/uploadAttachment';
import { getActivitiesForConversation } from './handlers/getActivitiesForConversation';

jest.mock('../../handlers/botFrameworkAuthentication', () => ({
  createBotFrameworkAuthenticationMiddleware: jest.fn(),
}));
jest.mock('../../../utils/jsonBodyParser', () => ({ createJsonBodyParserMiddleware: jest.fn() }));
jest.mock('./handlers/createConversation', () => ({
  createCreateConversationHandler: jest.fn(),
}));
jest.mock('./handlers/deleteActivity', () => ({
  deleteActivity: jest.fn(),
}));
jest.mock('./handlers/getConversation', () => ({
  createGetConversationHandler: jest.fn(),
}));
jest.mock('./handlers/getActivityMembers', () => ({
  getActivityMembers: jest.fn(),
}));
jest.mock('./handlers/getBotEndpoint', () => ({
  createGetBotEndpointHandler: jest.fn(),
}));
jest.mock('./handlers/getConversationMembers', () => ({
  getConversationMembers: jest.fn(),
}));
jest.mock('./handlers/replyToActivity', () => ({
  createReplyToActivityHandler: jest.fn(),
}));
jest.mock('./handlers/sendActivityToConversation', () => ({
  sendActivityToConversation: jest.fn(),
}));
jest.mock('./handlers/sendHistoryToConversation', () => ({
  sendHistoryToConversation: jest.fn(),
}));
jest.mock('./handlers/updateActivity', () => ({
  updateActivity: jest.fn(),
}));
jest.mock('./handlers/uploadAttachment', () => ({
  createUploadAttachmentHandler: jest.fn(),
}));
jest.mock('./handlers/getActivitiesForConversation', () => ({
  getActivitiesForConversation: jest.fn(),
}));

describe('mountConversationsRoutes', () => {
  it('should mount the routes', () => {
    const get = jest.fn();
    const post = jest.fn();
    const del = jest.fn();
    const put = jest.fn();
    const server: any = {
      get,
      post,
      del,
      put,
    };
    const emulatorServer: any = {
      options: { fetch: jest.fn() },
      server,
      state: {},
    };
    const verifyBotFramework = createBotFrameworkAuthenticationMiddleware(emulatorServer.options.fetch);
    const botEndpoint = createGetBotEndpointHandler(emulatorServer.state);
    const jsonBodyParser = createJsonBodyParserMiddleware();
    const fetchConversation = createGetConversationHandler(emulatorServer.state);
    mountConversationsRoutes(emulatorServer);

    expect(post).toHaveBeenCalledWith(
      '/v3/conversations',
      verifyBotFramework,
      jsonBodyParser,
      botEndpoint,
      createCreateConversationHandler(emulatorServer)
    );

    expect(post).toHaveBeenCalledWith(
      '/v3/conversations/:conversationId/activities',
      verifyBotFramework,
      jsonBodyParser,
      fetchConversation,
      sendActivityToConversation
    );

    expect(post).toHaveBeenCalledWith(
      '/v3/conversations/:conversationId/activities/history',
      verifyBotFramework,
      jsonBodyParser,
      fetchConversation,
      sendHistoryToConversation
    );

    expect(post).toHaveBeenCalledWith(
      '/v3/conversations/:conversationId/activities/:activityId',
      verifyBotFramework,
      jsonBodyParser,
      fetchConversation,
      createReplyToActivityHandler(emulatorServer)
    );

    expect(put).toHaveBeenCalledWith(
      '/v3/conversations/:conversationId/activities/:activityId',
      verifyBotFramework,
      jsonBodyParser,
      fetchConversation,
      updateActivity
    );

    expect(del).toHaveBeenCalledWith(
      '/v3/conversations/:conversationId/activities/:activityId',
      verifyBotFramework,
      fetchConversation,
      deleteActivity
    );

    expect(get).toHaveBeenCalledWith(
      '/v3/conversations/:conversationId/members',
      verifyBotFramework,
      fetchConversation,
      getConversationMembers
    );

    expect(get).toHaveBeenCalledWith(
      '/v3/conversations/:conversationId/activities/:activityId/members',
      verifyBotFramework,
      fetchConversation,
      getActivityMembers
    );

    expect(get).toHaveBeenCalledWith(
      '/v3/conversations/:conversationId/activities',
      verifyBotFramework,
      jsonBodyParser,
      getActivitiesForConversation(emulatorServer)
    );

    expect(post).toHaveBeenCalledWith(
      '/v3/conversations/:conversationId/attachments',
      verifyBotFramework,
      jsonBodyParser,
      createUploadAttachmentHandler(emulatorServer.state)
    );
  });
});
