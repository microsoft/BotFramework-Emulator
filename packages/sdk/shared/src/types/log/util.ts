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

import { Activity } from 'botframework-schema';

import { LogEntry } from './entry';
import {
  ExceptionLogItem,
  ExternalLinkLogItem,
  InspectableObjectLogItem,
  LogItem,
  LogItemPayload,
  LogItemType,
  LuisEditorDeepLinkLogItem,
  NetworkRequestLogItem,
  NetworkResponseLogItem,
  OpenAppSettingsLogItem,
  SummaryTextLogItem,
  TextLogItem,
} from './item';
import { LogLevel } from './level';

// TODO: Move this to a generally available location and export
export function makeEnumerableObject(src: any) {
  if (typeof src !== 'object') {
    return src;
  }
  const dst = {};
  const keys = Object.getOwnPropertyNames(src);
  keys.forEach(key => (dst[key] = src[key]));
  return dst;
}

// TODO: Move this file to a utils location, not a types location

export function textItem(level: LogLevel, text: string): LogItem<TextLogItem> {
  return {
    type: LogItemType.Text,
    payload: {
      level,
      text,
    },
  };
}

export function externalLinkItem(text: string, hyperlink: string): LogItem<ExternalLinkLogItem> {
  return {
    type: LogItemType.ExternalLink,
    payload: {
      text,
      hyperlink,
    },
  };
}

export function inspectableObjectItem(text: string, obj: Activity): LogItem<InspectableObjectLogItem> {
  return {
    type: LogItemType.InspectableObject,
    payload: {
      text,
      obj,
    },
  };
}

export function summaryTextItem(obj: Activity): LogItem<SummaryTextLogItem> {
  return {
    type: LogItemType.SummaryText,
    payload: {
      obj,
    },
  };
}

export function appSettingsItem(text: string): LogItem<OpenAppSettingsLogItem> {
  return {
    type: LogItemType.OpenAppSettings,
    payload: {
      text,
    },
  };
}

export function exceptionItem(err: any): LogItem<ExceptionLogItem> {
  return {
    type: LogItemType.Exception,
    payload: {
      err: makeEnumerableObject(err),
    },
  };
}

export function networkRequestItem(
  facility: any,
  body: any,
  headers: any,
  method: any,
  url: any
): LogItem<NetworkRequestLogItem> {
  return {
    type: LogItemType.NetworkRequest,
    payload: {
      facility,
      body,
      headers,
      method,
      url,
    },
  };
}

export function networkResponseItem(
  body: any,
  headers: any,
  statusCode: any,
  statusMessage: any,
  srcUrl: any
): LogItem<NetworkResponseLogItem> {
  return {
    type: LogItemType.NetworkResponse,
    payload: {
      body,
      headers,
      statusCode,
      statusMessage,
      srcUrl,
    },
  };
}

export function logEntry(...items: LogItem<LogItemPayload>[]): LogEntry {
  return {
    timestamp: Date.now(),
    items: [...items],
  };
}

export function luisEditorDeepLinkItem(text: string): LogItem<LuisEditorDeepLinkLogItem> {
  return {
    type: LogItemType.LuisEditorDeepLink,
    payload: {
      text,
    },
  };
}
