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

import BotEmulator from '../../botEmulator';

export default function getBotEndpoint(botEmulator: BotEmulator) {
  return (req: Restify.Request, res: Restify.Response, next: Restify.Next): any => {
    // TODO: We need to know how to find the correct endpoint from user
    //       We can find out the app ID from JWT
    //       But what if the bot does not supply app ID
    //       Only "createConversation from bot" use this function

    //       { header:
    //         { typ: 'JWT',
    //           alg: 'RS256',
    //           x5t: 'FSimuFrFNoC0sJXGmv13nNZceDc',
    //           kid: 'FSimuFrFNoC0sJXGmv13nNZceDc' },
    //         payload:
    //         { aud: 'https://api.botframework.com',
    //           iss: 'https://sts.windows.net/d6d49420-f39b-4df7-a1dc-d59a935871db/',
    //           iat: 1524702525,
    //           nbf: 1524702525,
    //           exp: 1524706425,
    //           aio: 'Y2dgYOjiffRgz8v9D1dum12cW/vrOgA=',
    //           appid: '31e41702-aedd-4a84-85ee-4239332360f1',
    //           appidacr: '1',
    //           idp: 'https://sts.windows.net/d6d49420-f39b-4df7-a1dc-d59a935871db/',
    //           tid: 'd6d49420-f39b-4df7-a1dc-d59a935871db',
    //           uti: 'ZPtC8TT5bk-41eVUsOAAAA',
    //           ver: '1.0' },

    (req as any).botEndpoint = botEmulator.facilities.endpoints.getByAppId((req as any).jwt.payload.appid);
    
    return next();
  };
}
