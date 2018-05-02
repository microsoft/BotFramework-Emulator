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

import * as log from 'npmlog';
import * as Restify from 'restify';
import IGenericActivity from '@bfemulator/emulator-core/lib/types/activity/generic';
import ILogger from '@bfemulator/emulator-core/lib/types/logger';

function shortId(id) {
  return [id.substr(0, 3), id.substr(-5)].join('...');
}

export default class NpmLogger implements ILogger {
  logActivity(conversationId: string, activity: IGenericActivity, destination: string) {
    log.verbose(shortId(conversationId), `Sending activity to ${ destination }`, activity);
  }

  logError(conversationId: string, err: any, ...messages: any[]) {
    log.error(shortId(conversationId), err, ...messages);
  }

  logInfo(conversationId: string, ...messages: any[]) {
    log.info(shortId(conversationId), ...messages);
  }

  logRequest(conversationId: string, source: string, req: Restify.Request, ...messages: any[]) {
    log.http(shortId(conversationId), `Receiving request from ${ source } at ${ req.method } ${ req.url }`, ...messages);
  }

  logResponse(conversationId: string, destination: string, res: Restify.Response, ...messages: any[]) {
    log.http(shortId(conversationId), `Sending response to ${ destination } with HTTP ${ res.statusCode }`, ...messages);
  }

  logTrace(conversationId: string, ...messages: any[]) {
    log.silly(shortId(conversationId), ...messages);
  }

  logWarning(conversationId: string, ...messages: any[]) {
    log.warn(shortId(conversationId), ...messages);
  }
}
