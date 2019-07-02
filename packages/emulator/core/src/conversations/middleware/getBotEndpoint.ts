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
import * as Restify from 'restify';

import { usGovernmentAuthentication } from '../../authEndpoints';
import { BotEmulator } from '../../botEmulator';
import BotEndpoint from '../../facility/botEndpoint';

export default function getBotEndpoint(botEmulator: BotEmulator) {
  return (req: Restify.Request, res: Restify.Response, next: Restify.Next): any => {
    const request = req as any;
    const { endpoints } = botEmulator.facilities;
    /**
     * IF query params exist, the call is creating a
     * conversation independent from a bot file.
     */
    if (req.headers && 'x-emulator-botendpoint' in req.headers) {
      const {
        'x-emulator-appid': msaAppId = '',
        'x-emulator-apppassword': msaPassword = '',
        'x-emulator-botendpoint': botUrl,
        'x-emulator-channelservice': channelServiceType,
      } = req.headers as { [prop: string]: string };

      let channelService;
      if (channelServiceType === 'azureusgovernment') {
        channelService = usGovernmentAuthentication.channelService;
      }

      let endpoint = endpoints.get(botUrl);
      if (!endpoint) {
        const params = req.body as any;
        endpoint = endpoints.push(
          null,
          new BotEndpoint(params.bot.id, params.bot.id, botUrl, msaAppId, msaPassword, false, channelService)
        );
      } else {
        // update the endpoint in memory with the
        // appId and password passed in the params
        endpoint.msaAppId = msaAppId;
        endpoint.msaPassword = msaPassword;
      }
      request.botEndpoint = endpoint;
    } else {
      request.botEndpoint = endpoints.getByAppId(request.jwt.appid);
    }

    return next();
  };
}
