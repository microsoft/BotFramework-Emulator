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
import getBotEndpoint from "../middleware/getBotEndpoint";
import getFacility from "../middleware/getFacility";
import getRouteName from "../middleware/getRouteName";
import createJsonBodyParserMiddleware from "../utils/jsonBodyParser";

import getActivities from "./middleware/getActivities";
import getConversation from "./middleware/getConversation";
import options from "./middleware/options";
import postActivity from "./middleware/postActivity";
import reconnectToConversation from "./middleware/reconnectToConversation";
import startConversation from "./middleware/startConversation";
import stream from "./middleware/stream";
import upload from "./middleware/upload";

export default function registerRoutes(
  botEmulator: BotEmulator,
  server: Server,
  uses: RequestHandler[]
) {
  const jsonBodyParser = createJsonBodyParserMiddleware();
  const botEndpoint = getBotEndpoint(botEmulator);
  const conversation = getConversation(botEmulator);
  const facility = getFacility("directline");

  server.opts(
    "/v3/directline",
    ...uses,
    facility,
    getRouteName("options"),
    options(botEmulator)
  );

  server.post(
    "/v3/directline/conversations",
    ...uses,
    botEndpoint,
    jsonBodyParser,
    facility,
    getRouteName("startConversation"),
    startConversation(botEmulator)
  );

  server.get(
    "/v3/directline/conversations/:conversationId",
    ...uses,
    botEndpoint,
    conversation,
    facility,
    getRouteName("reconnectToConversation"),
    reconnectToConversation(botEmulator)
  );

  server.get(
    "/v3/directline/conversations/:conversationId/activities",
    ...uses,
    botEndpoint,
    conversation,
    facility,
    getRouteName("getActivities"),
    getActivities(botEmulator)
  );

  server.post(
    "/v3/directline/conversations/:conversationId/activities",
    ...uses,
    jsonBodyParser,
    botEndpoint,
    conversation,
    facility,
    getRouteName("postActivity"),
    postActivity(botEmulator)
  );

  server.post(
    "/v3/directline/conversations/:conversationId/upload",
    ...uses,
    botEndpoint,
    conversation,
    facility,
    getRouteName("upload"),
    upload(botEmulator)
  );

  server.get(
    "/v3/directline/conversations/:conversationId/stream",
    ...uses,
    facility,
    getRouteName("stream"),
    stream(botEmulator)
  );
}
