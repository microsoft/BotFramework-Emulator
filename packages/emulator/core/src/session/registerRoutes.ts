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

import * as Restify from "restify";
import { RequestHandler, Server } from "restify";

import BotEmulator from "../botEmulator";
import getFacility from "../middleware/getFacility";
import getRouteName from "../middleware/getRouteName";

import getSessionId from "./middleware/getSessionId";

export default function registerRoutes(
  botEmulator: BotEmulator,
  server: Server,
  uses: RequestHandler[]
) {
  const facility = getFacility("directline");

  server.get(
    "/v3/directline/session/getsessionid",
    facility,
    getRouteName("getSessionId"),
    getSessionId(botEmulator)
  );

  server.get("v4/token", (req: Restify.Request, res: Restify.Response) => {
    const body =
      '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">' +
      "<title>Botframework Emulator</title></head>" +
      "<body><!--This page is used as the redirect from the AAD auth for ABS and is required-->" +
      "</body></html>";
    res.writeHead(200, {
      "Content-Length": Buffer.byteLength(body),
      "Content-Type": "text/html"
    });
    res.write(body);
    res.end();
  });
}
