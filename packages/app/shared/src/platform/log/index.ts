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

/**
 * DUPLICATED FROM EMULATOR-CORE.
 * NEED TO DEDUPE
 */

export enum LogLevel {
  Debug,
  Info,
  Warn,
  Error
}

export type LogItem = {
  type: 'text',
  payload: {
    level: LogLevel,
    text: string
  }
} | {
  type: 'external-link',
  payload: {
    text: string,
    hyperlink: string
  }
} | {
  type: 'inspectable-object',
  payload: {
    text: string,
    obj: any
  }
} | {
  type: 'network-request',
  payload: {
    facility?: string,
    body?: string,
    headers?: { [header: string]: number | string | string[] },
    method?: string,
    url?: string
  }
} | {
  type: 'network-response',
  payload: {
    body?: string,
    headers?: { [header: string]: number | string | string[] },
    statusCode?: number,
    statusMessage?: string,
    srcUrl?: string
  }
} | {
  type: 'summary-text',
  payload: {
    obj: any
  }
} | {
  type: 'open-app-settings',
  payload: {
    text: string
  }
} | {
  type: 'exception',
  payload: {
    err: any  // Shape of `Error`, but enumerable
  }
};

export interface LogEntry {
  timestamp: number;
  items: LogItem[];
}

export interface LogService {
  logToChat(conversationId: string, ...items: LogItem[]): void;
}

export function textItem(level: LogLevel, text: string): LogItem {
  return {
    type: 'text',
    payload: {
      level,
      text
    }
  };
}

export function externalLinkItem(text: string, hyperlink: string): LogItem {
  return {
    type: 'external-link',
    payload: {
      text,
      hyperlink
    }
  };
}

export function inspectableObjectItem(text: string, obj: any): LogItem {
  return {
    type: 'inspectable-object',
    payload: {
      text,
      obj
    }
  };
}

export function summaryTextItem(obj: any): LogItem {
  return {
    type: 'summary-text',
    payload: {
      obj
    }
  };
}

export function appSettingsItem(text: string): LogItem {
  return {
    type: 'open-app-settings',
    payload: {
      text
    }
  };
}

export function exceptionItem(err: any): LogItem {
  return {
    type: 'exception',
    payload: {
      err
    }
  };
}

export function logEntry(...items: LogItem[]): LogEntry {
  return {
    timestamp: Date.now(),
    items: [...items]
  };
}
