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

import { Next, Request, Response } from 'restify';

import { authentication, usGovernmentAuthentication } from '../../../../constants/authEndpoints';
import { BotEndpoint } from '../../../../state/botEndpoint';
import { ServerState } from '../../../../state/serverState';

export function createGetBotEndpointHandler(state: ServerState) {
  return (req: Request, res: Response, next: Next): any => {
    const request = req as any;
    const { endpoints } = state;

    if (request.jwt && request.jwt.appid) {
      request.botEndpoint = endpoints.getByAppId(request.jwt.appid);
    } else {
      const { bot, botUrl, channelServiceType, msaAppId, msaPassword, tenantId } = req.body;
      let endpoint = endpoints.get(botUrl);
      if (!endpoint) {
        const channelService =
          channelServiceType === 'azureusgovernment'
            ? usGovernmentAuthentication.channelService
            : authentication.channelService;
        // create endpoint
        endpoint = endpoints.set(
          bot.id,
          new BotEndpoint(bot.id, bot.id, botUrl, msaAppId, msaPassword, false, channelService, null, tenantId)
        );
      } else {
        endpoint.msaAppId = msaAppId;
        endpoint.msaPassword = msaPassword;
        endpoint.tenantId = tenantId;
      }
      request.botEndpoint = endpoint;
    }

    next();
  };
}
