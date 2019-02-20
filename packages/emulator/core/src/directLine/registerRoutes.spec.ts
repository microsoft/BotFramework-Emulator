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
import createJsonBodyParserMiddleware from '../utils/jsonBodyParser';

import getActivities from './middleware/getActivities';
import getConversation from './middleware/getConversation';
import options from './middleware/options';
import postActivity from './middleware/postActivity';
import reconnectToConversation from './middleware/reconnectToConversation';
import startConversation from './middleware/startConversation';
import stream from './middleware/stream';
import upload from './middleware/upload';
import registerRoutes from './registerRoutes';

jest.mock('../middleware/getBotEndpoint', () => jest.fn(() => null));
jest.mock('../middleware/getFacility', () => jest.fn(() => null));
jest.mock('../middleware/getRouteName', () => jest.fn(() => null));
jest.mock('../utils/jsonBodyParser', () => jest.fn(() => null));
jest.mock('./middleware/getActivities', () => jest.fn(() => null));
jest.mock('./middleware/getConversation', () => jest.fn(() => null));
jest.mock('./middleware/options', () => jest.fn(() => null));
jest.mock('./middleware/postActivity', () => jest.fn(() => null));
jest.mock('./middleware/reconnectToConversation', () => jest.fn(() => null));
jest.mock('./middleware/startConversation', () => jest.fn(() => null));
jest.mock('./middleware/stream', () => jest.fn(() => null));
jest.mock('./middleware/upload', () => jest.fn(() => null));

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
    const uses = [];
    const emulator: any = {
      options: { fetch: () => null },
    };
    const jsonBodyParser = createJsonBodyParserMiddleware();
    const botEndpoint = getBotEndpoint(emulator);
    const conversation = getConversation(emulator);
    const facility = getFacility('directline');
    registerRoutes(emulator, server, uses);

    expect(opts).toHaveBeenCalledWith('/v3/directline', ...uses, facility, getRouteName('options'), options(emulator));

    expect(post).toHaveBeenCalledWith(
      '/v3/directline/conversations',
      ...uses,
      botEndpoint,
      jsonBodyParser,
      facility,
      getRouteName('startConversation'),
      startConversation(emulator)
    );

    expect(get).toHaveBeenCalledWith(
      '/v3/directline/conversations/:conversationId',
      ...uses,
      botEndpoint,
      conversation,
      facility,
      getRouteName('reconnectToConversation'),
      reconnectToConversation(emulator)
    );

    expect(get).toHaveBeenCalledWith(
      '/v3/directline/conversations/:conversationId/activities',
      ...uses,
      botEndpoint,
      conversation,
      facility,
      getRouteName('getActivities'),
      getActivities(emulator)
    );

    expect(post).toHaveBeenCalledWith(
      '/v3/directline/conversations/:conversationId/activities',
      ...uses,
      jsonBodyParser,
      botEndpoint,
      conversation,
      facility,
      getRouteName('postActivity'),
      postActivity(emulator)
    );

    expect(post).toHaveBeenCalledWith(
      '/v3/directline/conversations/:conversationId/upload',
      ...uses,
      botEndpoint,
      conversation,
      facility,
      getRouteName('upload'),
      upload(emulator)
    );

    expect(get).toHaveBeenCalledWith(
      '/v3/directline/conversations/:conversationId/stream',
      ...uses,
      facility,
      getRouteName('stream'),
      stream(emulator)
    );
  });
});
