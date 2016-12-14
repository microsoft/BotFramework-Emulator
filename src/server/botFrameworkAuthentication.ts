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

import { getSettings, authenticationSettings, v30AuthenticationSettings } from './settings';
import * as jwt from 'jsonwebtoken';
import * as oid from './OpenIdMetadata';
import * as Restify from 'restify';


export class BotFrameworkAuthentication {
    private openIdMetadata: oid.OpenIdMetadata;

    constructor() {
        this.openIdMetadata = new oid.OpenIdMetadata(v30AuthenticationSettings.openIdMetadata);
    }

    public verifyBotFramework = (req: Restify.Request, res: Restify.Response, next: Restify.Next): void => {
        let token: string;
        if (req.headers && req.headers.hasOwnProperty('authorization')) {
            let auth = req.headers['authorization'].trim().split(' ');;
            if (auth.length == 2 && auth[0].toLowerCase() == 'bearer') {
                token = auth[1];
            }
        }
        const activeBot = getSettings().getActiveBot();
        // Verify token
        if (token) {

            let decoded = jwt.decode(token, { complete: true });
            this.openIdMetadata.getKey(decoded.header.kid, key => {
                if (key) {
                    try {
                        let verifyOptions = {
                            jwtId: activeBot.botId,
                            issuer: authenticationSettings.tokenIssuer,
                            audience: authenticationSettings.tokenAudience,
                            clockTolerance: 300
                        };

                        jwt.verify(token, key, verifyOptions);
                    } catch (err) {
                        try {
                            // fall back to v3.0 token characteristics
                            let verifyOptions = {
                                jwtId: activeBot.botId,
                                issuer: v30AuthenticationSettings.tokenIssuer,
                                audience: v30AuthenticationSettings.tokenAudience,
                                clockTolerance: 300
                            };

                            jwt.verify(token, key, verifyOptions);
                        } catch (err2) {
                            res.status(401);
                            res.end();
                            return;
                        }
                    }

                    next();
                } else {
                    res.status(500);
                    res.end();
                    return;
                }
            });
        } else if (!activeBot.msaAppId && !activeBot.msaPassword) {
              // Emulator running without auth enabled
            next();
        } else {
            // Token not provided so
            res.status(401);
            res.end();
        }
    }
}