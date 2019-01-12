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
import GenericActivity from "../types/activity/generic";
import ILogItem from "../types/log/item";
import Logger from "../types/logger";
import LogLevel from "../types/log/level";
import LogService from "../types/log/service";
import {
  exceptionItem,
  inspectableObjectItem,
  summaryTextItem,
  textItem
} from "../types/log/util";

export default class LoggerAdapter implements Logger {
  constructor(public logService: LogService) {
    this.logActivity = this.logActivity.bind(this);
    this.logMessage = this.logMessage.bind(this);
    this.logException = this.logException.bind(this);
  }

  public logActivity(
    conversationId: string,
    activity: GenericActivity,
    role: string
  ) {
    let direction: ILogItem;
    if (role === "user") {
      direction = textItem(LogLevel.Debug, "<-");
    } else {
      direction = textItem(LogLevel.Debug, "->");
    }
    this.logService.logToChat(
      conversationId,
      direction,
      inspectableObjectItem(activity.type, activity),
      summaryTextItem(activity)
    );
  }

  public logMessage(conversationId: string, ...items: ILogItem[]) {
    this.logService.logToChat(conversationId, ...items);
  }

  public logException(conversationId: string, err: Error) {
    this.logService.logToChat(conversationId, exceptionItem(err));
  }
}
