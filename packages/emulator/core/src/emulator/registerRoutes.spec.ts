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
import createJsonBodyParserMiddleware from '../utils/jsonBodyParser';

import addUsers from './middleware/addUsers';
import contactAdded from './middleware/contactAdded';
import contactRemoved from './middleware/contactRemoved';
import deleteUserData from './middleware/deleteUserData';
import createFetchConversationMiddleware from './middleware/fetchConversation';
import getUsers from './middleware/getUsers';
import paymentComplete from './middleware/paymentComplete';
import ping from './middleware/ping';
import removeUsers from './middleware/removeUsers';
import sendTokenResponse from './middleware/sendTokenResponse';
import typing from './middleware/typing';
import updateShippingAddress from './middleware/updateShippingAddress';
import updateShippingOption from './middleware/updateShippingOption';
import registerRoutes from './registerRoutes';

jest.mock('../middleware/getFacility', () => jest.fn(() => null));
jest.mock('../middleware/getRouteName', () => jest.fn(() => null));
jest.mock('../utils/jsonBodyParser', () => jest.fn(() => null));
jest.mock('./middleware/addUsers', () => jest.fn(() => null));
jest.mock('./middleware/contactAdded', () => jest.fn(() => null));
jest.mock('./middleware/contactRemoved', () => jest.fn(() => null));
jest.mock('./middleware/deleteUserData', () => jest.fn(() => null));
jest.mock('./middleware/fetchConversation', () => jest.fn(() => null));
jest.mock('./middleware/getUsers', () => jest.fn(() => null));
jest.mock('./middleware/paymentComplete', () => jest.fn(() => null));
jest.mock('./middleware/ping', () => jest.fn(() => null));
jest.mock('./middleware/removeUsers', () => jest.fn(() => null));
jest.mock('./middleware/sendTokenResponse', () => jest.fn(() => null));
jest.mock('./middleware/typing', () => jest.fn(() => null));
jest.mock('./middleware/updateShippingAddress', () => jest.fn(() => null));
jest.mock('./middleware/updateShippingOption', () => jest.fn(() => null));

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
    const fetchConversation = createFetchConversationMiddleware(emulator);
    const jsonBodyParser = createJsonBodyParserMiddleware();
    const facility = getFacility('emulator');
    registerRoutes(emulator, server, uses);

    expect(get).toHaveBeenCalledWith(
      '/emulator/:conversationId/users',
      fetchConversation,
      facility,
      getRouteName('getUsers'),
      getUsers(emulator)
    );

    expect(post).toHaveBeenCalledWith(
      '/emulator/:conversationId/users',
      jsonBodyParser,
      fetchConversation,
      facility,
      getRouteName('addUsers'),
      addUsers(emulator)
    );

    expect(del).toHaveBeenCalledWith(
      '/emulator/:conversationId/users',
      fetchConversation,
      facility,
      getRouteName('removeUsers'),
      removeUsers(emulator)
    );

    expect(post).toHaveBeenCalledWith(
      '/emulator/:conversationId/contacts',
      fetchConversation,
      facility,
      getRouteName('contactAdded'),
      contactAdded(emulator)
    );

    expect(del).toHaveBeenCalledWith(
      '/emulator/:conversationId/contacts',
      fetchConversation,
      facility,
      getRouteName('contactRemoved'),
      contactRemoved(emulator)
    );

    expect(post).toHaveBeenCalledWith(
      '/emulator/:conversationId/typing',
      fetchConversation,
      facility,
      getRouteName('typing'),
      typing(emulator)
    );

    expect(post).toHaveBeenCalledWith(
      '/emulator/:conversationId/ping',
      fetchConversation,
      facility,
      getRouteName('ping'),
      ping(emulator)
    );

    expect(del).toHaveBeenCalledWith(
      '/emulator/:conversationId/userdata',
      fetchConversation,
      facility,
      getRouteName('deleteUserData'),
      deleteUserData(emulator)
    );

    expect(post).toHaveBeenCalledWith(
      '/emulator/:conversationId/invoke/updateShippingAddress',
      jsonBodyParser,
      fetchConversation,
      facility,
      getRouteName('updateShippingAddress'),
      updateShippingAddress(emulator)
    );

    expect(post).toHaveBeenCalledWith(
      '/emulator/:conversationId/invoke/updateShippingOption',
      jsonBodyParser,
      fetchConversation,
      facility,
      getRouteName('updateShippingOption'),
      updateShippingOption(emulator)
    );

    expect(post).toHaveBeenCalledWith(
      '/emulator/:conversationId/invoke/paymentComplete',
      jsonBodyParser,
      fetchConversation,
      facility,
      getRouteName('paymentComplete'),
      paymentComplete(emulator)
    );

    expect(post).toHaveBeenCalledWith(
      '/emulator/:conversationId/invoke/sendTokenResponse',
      jsonBodyParser,
      facility,
      getRouteName('sendTokenResponse'),
      sendTokenResponse(emulator)
    );
  });
});
