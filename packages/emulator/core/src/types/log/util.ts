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

import LogEntry from "./entry";
import ILogItem from "./item";
import LogLevel from "./level";

// TODO: Move this to a generally available location and export
export function makeEnumerableObject(src: any) {
  if (typeof src !== "object") {
    return src;
  }
  const dst = {};
  const keys = Object.getOwnPropertyNames(src);
  keys.forEach(key => (dst[key] = src[key]));
  return dst;
}

// TODO: Move this file to a utils location, not a types location

export function textItem(level: LogLevel, text: string): ILogItem {
  return {
    type: "text",
    payload: {
      level,
      text
    }
  };
}

export function externalLinkItem(text: string, hyperlink: string): ILogItem {
  return {
    type: "external-link",
    payload: {
      text,
      hyperlink
    }
  };
}

export function inspectableObjectItem(text: string, obj: any): ILogItem {
  return {
    type: "inspectable-object",
    payload: {
      text,
      obj
    }
  };
}

export function summaryTextItem(obj: any): ILogItem {
  return {
    type: "summary-text",
    payload: {
      obj
    }
  };
}

export function appSettingsItem(text: string): ILogItem {
  return {
    type: "open-app-settings",
    payload: {
      text
    }
  };
}

export function exceptionItem(err: any): ILogItem {
  return {
    type: "exception",
    payload: {
      err: makeEnumerableObject(err)
    }
  };
}

export function networkRequestItem(
  facility: any,
  body: any,
  headers: any,
  method: any,
  url: any
): ILogItem {
  return {
    type: "network-request",
    payload: {
      facility,
      body,
      headers,
      method,
      url
    }
  };
}

export function networkResponseItem(
  body: any,
  headers: any,
  statusCode: any,
  statusMessage: any,
  srcUrl: any
): ILogItem {
  return {
    type: "network-response",
    payload: {
      body,
      headers,
      statusCode,
      statusMessage,
      srcUrl
    }
  };
}

export function ngrokExpirationItem(text: string): ILogItem {
  return {
    type: "ngrok-expiration",
    payload: {
      text
    }
  };
}

export function logEntry(...items: ILogItem[]): LogEntry {
  return {
    timestamp: Date.now(),
    items: [...items]
  };
}
