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
import {
  exceptionItem,
  inspectableObjectItem,
  Logger,
  LogItem,
  LogLevel,
  LogService,
  summaryTextItem,
  textItem,
} from '@bfemulator/sdk-shared';
import { Activity, ActivityTypes } from 'botframework-schema';

export class LoggerAdapter implements Logger {
  private static getDirectionalArrowFromRole(role: string): string {
    if (role === 'user') {
      return '<- ';
    }
    return '-> ';
  }

  constructor(public logService: LogService) {}

  public logActivity = (conversationId: string, activity: Activity, role: string) => {
    const logItems: LogItem[] = [
      textItem(LogLevel.Debug, LoggerAdapter.getDirectionalArrowFromRole(role)),
      inspectableObjectItem(activity.type, activity),
      summaryTextItem(activity),
    ];
    // Check if there is a nested message that can be inspected
    if (activity.value && activity.value.type === ActivityTypes.Message) {
      const nestedActivity = activity.value as Activity;
      // Ids are optional fields on Activity objects
      // however, the debug adapter always places an id
      // on the trace. If the nested message activity does not have
      // an id, we inherit from the parent.
      if (!nestedActivity.id) {
        nestedActivity.id = 'emulator-required-id-' + activity.id;
      }
      logItems.push(
        textItem(LogLevel.Debug, LoggerAdapter.getDirectionalArrowFromRole(nestedActivity.from.role)),
        inspectableObjectItem(nestedActivity.type, nestedActivity),
        summaryTextItem(nestedActivity)
      );
    }

    this.logService.logToChat(conversationId, ...logItems);
  };

  public logMessage = (conversationId: string, ...items: LogItem[]) => {
    this.logService.logToChat(conversationId, ...items);
  };

  public logException = (conversationId: string, err: Error) => {
    this.logService.logToChat(conversationId, exceptionItem(err));
  };
}
