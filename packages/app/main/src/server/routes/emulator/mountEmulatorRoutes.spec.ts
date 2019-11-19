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

import { addUsers } from './handlers/addUsers';
import { contactAdded } from './handlers/contactAdded';
import { contactRemoved } from './handlers/contactRemoved';
import { deleteUserData } from './handlers/deleteUserData';
import { createGetConversationHandler } from './handlers/getConversation';
import { getUsers } from './handlers/getUsers';
import { paymentComplete } from './handlers/paymentComplete';
import { ping } from './handlers/ping';
import { removeUsers } from './handlers/removeUsers';
import { sendTokenResponse } from './handlers/sendTokenResponse';
import { sendTyping } from './handlers/sendTyping';
import { updateShippingAddress } from './handlers/updateShippingAddress';
import { updateShippingOption } from './handlers/updateShippingOption';
import { mountEmulatorRoutes } from './mountEmulatorRoutes';

jest.mock('../../utils/jsonBodyParser', () => ({ createJsonBodyParserMiddleware: jest.fn(() => null) }));
jest.mock('./handlers/addUsers', () => ({ addUsers: jest.fn(() => null) }));
jest.mock('./handlers/contactAdded', () => ({ contactAdded: jest.fn(() => null) }));
jest.mock('./handlers/contactRemoved', () => ({ contactRemoved: jest.fn(() => null) }));
jest.mock('./handlers/deleteUserData', () => ({ deleteUserData: jest.fn(() => null) }));
jest.mock('./handlers/getConversation', () => ({ createGetConversationHandler: jest.fn(() => null) }));
jest.mock('./handlers/getUsers', () => ({ getUsers: jest.fn(() => null) }));
jest.mock('./handlers/paymentComplete', () => ({ paymentComplete: jest.fn(() => null) }));
jest.mock('./handlers/ping', () => ({ ping: jest.fn(() => null) }));
jest.mock('./handlers/removeUsers', () => ({ removeUsers: jest.fn(() => null) }));
jest.mock('./handlers/sendTokenResponse', () => ({ sendTokenResponse: jest.fn(() => null) }));
jest.mock('./handlers/sendTyping', () => ({ sendTyping: jest.fn(() => null) }));
jest.mock('./handlers/updateShippingAddress', () => ({ updateShippingAddress: jest.fn(() => null) }));
jest.mock('./handlers/updateShippingOption', () => ({ updateShippingOption: jest.fn(() => null) }));

describe('mountEmulatorRoutes', () => {
  it('should mount the routes', () => {
    const get = jest.fn(() => null);
    const post = jest.fn(() => null);
    const del = jest.fn(() => null);
    const server: any = {
      get,
      post,
      del,
    };
    const emulatorServer: any = {
      options: { fetch: () => null },
      server,
      state: {},
    };
    const getConversation = createGetConversationHandler(emulatorServer.state);
    const jsonBodyParser = createJsonBodyParserMiddleware();
    mountEmulatorRoutes(emulatorServer);

    expect(get).toHaveBeenCalledWith('/emulator/:conversationId/users', getConversation, getUsers);

    expect(post).toHaveBeenCalledWith('/emulator/:conversationId/users', jsonBodyParser, getConversation, addUsers);

    expect(del).toHaveBeenCalledWith('/emulator/:conversationId/users', getConversation, removeUsers);

    expect(post).toHaveBeenCalledWith('/emulator/:conversationId/contacts', getConversation, contactAdded);

    expect(del).toHaveBeenCalledWith('/emulator/:conversationId/contacts', getConversation, contactRemoved);

    expect(post).toHaveBeenCalledWith('/emulator/:conversationId/typing', getConversation, sendTyping);

    expect(post).toHaveBeenCalledWith('/emulator/:conversationId/ping', getConversation, ping);

    expect(del).toHaveBeenCalledWith('/emulator/:conversationId/userdata', getConversation, deleteUserData);

    expect(post).toHaveBeenCalledWith(
      '/emulator/:conversationId/invoke/updateShippingAddress',
      jsonBodyParser,
      getConversation,
      updateShippingAddress
    );

    expect(post).toHaveBeenCalledWith(
      '/emulator/:conversationId/invoke/updateShippingOption',
      jsonBodyParser,
      getConversation,
      updateShippingOption
    );

    expect(post).toHaveBeenCalledWith(
      '/emulator/:conversationId/invoke/paymentComplete',
      jsonBodyParser,
      getConversation,
      paymentComplete
    );

    expect(post).toHaveBeenCalledWith(
      '/emulator/:conversationId/invoke/sendTokenResponse',
      jsonBodyParser,
      sendTokenResponse
    );
  });
});
