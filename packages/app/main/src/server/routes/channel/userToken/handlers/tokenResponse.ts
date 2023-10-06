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

import * as HttpStatus from 'http-status-codes';
import * as Restify from 'restify';

import { EmulatorRestServer } from '../../../../restServer';
import { sendErrorResponse } from '../../../../utils/sendErrorResponse';

export function createTokenResponseHandler(emulatorServer: EmulatorRestServer) {
  return async (req: Restify.Request, res: Restify.Response): Promise<any> => {
    const body: {
      token: string;
      connectionName: string;
    } = req.body;

    const conversationId = req.query.conversationId;

    const conversation = emulatorServer.state.conversations.conversationById(conversationId);

    try {
      const response = await conversation.sendTokenResponse(body.connectionName, body.token, false);
      if (response.statusCode === HttpStatus.OK) {
        res.send(HttpStatus.OK, body);
      } else {
        res.send(response.statusCode);
      }
      res.end();
    } catch (e) {
      sendErrorResponse(req, res, null, e);
    } finally {
      // shut down the oauth ngrok instance
      emulatorServer.shutDownOAuthNgrokInstance();
    }
  };
}
