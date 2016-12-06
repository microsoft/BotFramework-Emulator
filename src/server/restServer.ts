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
import * as log from './log';


export class RestServer {
    router: Restify.Server;

    constructor(name: string) {
        this.router = Restify.createServer({
            name: name
        });

        this.router.on('listening', () => {
            log.debug(`${this.router.name} listening on ${this.router.url}`);
        });

        this.router.use(Restify.acceptParser(this.router.acceptable));
        this.router.use(stripEmptyBearerToken);
        this.router.use(Restify.dateParser());
        this.router.use(Restify.queryParser());
        //this.router.use(Restify.bodyParser({ mapParams: true, mapFiles: false }));
    }

    public restart() {
        this.stop();
        return this.router.listen();
    }

    public stop() {
        return this.router.close();
    }
}

// when debugging locally with a bot with appid and password = ""
// our csx environment will generate a Authorization token of "Bearer"
// This confuses the auth system, we either want no auth header for local debug
// or we want a full bearer token.  This parser strips off the Auth header if it is just "Bearer"
function stripEmptyBearerToken(req, res, next) {
    if (!req.headers.authorization) {
        return (next());
    }

    var pieces = req.headers.authorization.split(' ', 2);
    if (pieces.length == 1 && pieces[0] == "Bearer")
        delete req.headers["authorization"];

    return (next());
}
