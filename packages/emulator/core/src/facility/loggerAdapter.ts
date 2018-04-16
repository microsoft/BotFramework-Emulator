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

import getActivityText from '../utils/getActivityText';
import IGenericActivity from '../types/activity/generic';
import ILogEntry from '../types/log/entry';
import ILogService from '../types/log/service';
import LogLevel from '../types/log/level';
import ILogger from '../types/logger';

function makeLogEntry(level: LogLevel, category: string, ...messages: any[]): ILogEntry {
  return {
    category,
    level,
    messages,
    timestamp: Date.now()
  };
}

export default class LoggerAdapter implements ILogger {
  constructor(public logService: ILogService) {
    this.logActivity = this.logActivity.bind(this);
    this.logError = this.logError.bind(this);
    this.logInfo = this.logInfo.bind(this);
    this.logRequest = this.logActivity.bind(this);
    this.logResponse = this.logResponse.bind(this);
    this.logTrace = this.logTrace.bind(this);
    this.logWarning = this.logWarning.bind(this);
  }

  public logActivity(conversationId: string, activity: IGenericActivity, destination: string) {
    const activityText = getActivityText(activity);
    const entry = makeLogEntry(
      LogLevel.Info,
      'conversation',
      {
        type: 'activity',
        payload: {
          activity,
          destination,
          text: activityText
        }
      }
    );

    this.logService.logToChat(conversationId, entry);
  }

  public logRequest(conversationId: string, source: string, req: Restify.Request, ...messages: any[]) {
    if (conversationId && ~conversationId.indexOf('transcript')) {
      return;
    }

    const entry = makeLogEntry(
      LogLevel.Info,
      'network',
      {
        type: 'request',
        payload: {
          body: req.body,
          headers: req.headers,
          method: req.method,
          source,
          url: req.url
        }
      },
      ...messages
    );

    this.logService.logToChat(conversationId, entry);
  }

  public logResponse(conversationId: string, destination: string, res: Restify.Response, ...messages: any[]) {
    if (conversationId && ~conversationId.indexOf('transcript')) {
      return;
    }

    const entry = makeLogEntry(
      res.statusCode >= 400 ? LogLevel.Error : LogLevel.Info,
      'network',
      {
        type: 'response',
        payload: {
          body: (res as any)._body,
          destination,
          headers: (res as any)._headers,
          statusCode: res.statusCode,
          statusMessage: res.statusMessage
        }
      },
      ...messages
    );

    this.logService.logToChat(conversationId, entry);
  }

  public logError(conversationId: string, ...messages: any[]) {
    const entry = makeLogEntry(
      LogLevel.Error,
      'network',
      ...messages
    );

    this.logService.logToChat(conversationId, entry);
  }

  public logInfo(conversationId: string, ...messages: any[]) {
    const entry = makeLogEntry(
      LogLevel.Info,
      'network',
      ...messages
    );

    this.logService.logToChat(conversationId, entry);
  }

  public logTrace(conversationId: string, ...messages: any[]) {
    const entry = makeLogEntry(
      LogLevel.Trace,
      'network',
      ...messages
    );

    this.logService.logToChat(conversationId, entry);
  }

  public logWarning(conversationId: string, ...messages: any[]) {
    const entry = makeLogEntry(
      LogLevel.Warn,
      'network',
      ...messages
    );

    this.logService.logToChat(conversationId, entry);
  }
}
