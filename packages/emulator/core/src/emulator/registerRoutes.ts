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

import { RequestHandler, Server } from "restify";

import BotEmulator from "../botEmulator";
import getFacility from "../middleware/getFacility";
import getRouteName from "../middleware/getRouteName";
import createJsonBodyParserMiddleware from "../utils/jsonBodyParser";

import addUsers from "./middleware/addUsers";
import contactAdded from "./middleware/contactAdded";
import contactRemoved from "./middleware/contactRemoved";
import deleteUserData from "./middleware/deleteUserData";
import createFetchConversationMiddleware from "./middleware/fetchConversation";
import getUsers from "./middleware/getUsers";
import paymentComplete from "./middleware/paymentComplete";
import ping from "./middleware/ping";
import removeUsers from "./middleware/removeUsers";
import sendTokenResponse from "./middleware/sendTokenResponse";
import typing from "./middleware/typing";
import updateShippingAddress from "./middleware/updateShippingAddress";
import updateShippingOption from "./middleware/updateShippingOption";

export default function registerRoutes(
  botEmulator: BotEmulator,
  server: Server,
  uses: RequestHandler[]
) {
  const fetchConversation = createFetchConversationMiddleware(botEmulator);
  const jsonBodyParser = createJsonBodyParserMiddleware();
  const facility = getFacility("emulator");

  server.get(
    "/emulator/:conversationId/users",
    fetchConversation,
    facility,
    getRouteName("getUsers"),
    getUsers(botEmulator)
  );

  server.post(
    "/emulator/:conversationId/users",
    jsonBodyParser,
    fetchConversation,
    facility,
    getRouteName("addUsers"),
    addUsers(botEmulator)
  );

  server.del(
    "/emulator/:conversationId/users",
    fetchConversation,
    facility,
    getRouteName("removeUsers"),
    removeUsers(botEmulator)
  );

  server.post(
    "/emulator/:conversationId/contacts",
    fetchConversation,
    facility,
    getRouteName("contactAdded"),
    contactAdded(botEmulator)
  );

  server.del(
    "/emulator/:conversationId/contacts",
    fetchConversation,
    facility,
    getRouteName("contactRemoved"),
    contactRemoved(botEmulator)
  );

  server.post(
    "/emulator/:conversationId/typing",
    fetchConversation,
    facility,
    getRouteName("typing"),
    typing(botEmulator)
  );

  server.post(
    "/emulator/:conversationId/ping",
    fetchConversation,
    facility,
    getRouteName("ping"),
    ping(botEmulator)
  );

  server.del(
    "/emulator/:conversationId/userdata",
    fetchConversation,
    facility,
    getRouteName("deleteUserData"),
    deleteUserData(botEmulator)
  );

  server.post(
    "/emulator/:conversationId/invoke/updateShippingAddress",
    jsonBodyParser,
    fetchConversation,
    facility,
    getRouteName("updateShippingAddress"),
    updateShippingAddress(botEmulator)
  );

  server.post(
    "/emulator/:conversationId/invoke/updateShippingOption",
    jsonBodyParser,
    fetchConversation,
    facility,
    getRouteName("updateShippingOption"),
    updateShippingOption(botEmulator)
  );

  server.post(
    "/emulator/:conversationId/invoke/paymentComplete",
    jsonBodyParser,
    fetchConversation,
    facility,
    getRouteName("paymentComplete"),
    paymentComplete(botEmulator)
  );

  server.post(
    "/emulator/:conversationId/invoke/sendTokenResponse",
    jsonBodyParser,
    facility,
    getRouteName("sendTokenResponse"),
    sendTokenResponse(botEmulator)
  );
}
