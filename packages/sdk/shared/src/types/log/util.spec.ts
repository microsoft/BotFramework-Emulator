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

import { LogLevel } from './level';
import {
  textItem,
  externalLinkItem,
  inspectableObjectItem,
  summaryTextItem,
  appSettingsItem,
  exceptionItem,
  networkRequestItem,
  networkResponseItem,
  logEntry,
  makeEnumerableObject,
  luisEditorDeepLinkItem,
} from './util';

describe('utils tests', () => {
  test('makeEnumerableObject', () => {
    //
  });

  test('textItem', () => {
    const item = textItem(LogLevel.Error, 'someErrorItem');
    expect(item.type).toBe('text');
    expect(item.payload).toEqual({
      level: LogLevel.Error,
      text: 'someErrorItem',
    });
  });

  test('externalLinkItem', () => {
    const item = externalLinkItem('someText', 'someLink');
    expect(item.type).toBe('external-link');
    expect(item.payload).toEqual({ text: 'someText', hyperlink: 'someLink' });
  });

  test('inspectableObjectItem', () => {
    const item = inspectableObjectItem('someText', { a: 1, b: 'someValue' });
    expect(item.type).toBe('inspectable-object');
    expect(item.payload).toEqual({
      text: 'someText',
      obj: { a: 1, b: 'someValue' },
    });
  });

  test('summaryTextItem', () => {
    const item = summaryTextItem({ a: 1, b: true, c: 'someValue' });
    expect(item.type).toBe('summary-text');
    expect(item.payload).toEqual({ obj: { a: 1, b: true, c: 'someValue' } });
  });

  test('appSettingsItem', () => {
    const item = appSettingsItem('someText');
    expect(item.type).toBe('open-app-settings');
    expect(item.payload).toEqual({ text: 'someText' });
  });

  test('exceptionItem', () => {
    const item = exceptionItem('someError');
    expect(item.type).toBe('exception');
    expect(item.payload).toEqual({ err: makeEnumerableObject('someError') });
  });

  test('networkRequestItem', () => {
    const item = networkRequestItem('someFacility', 'someBody', 'someHeaders', 'someMethod', 'someUrl');
    expect(item.type).toBe('network-request');
    expect(item.payload).toEqual({
      facility: 'someFacility',
      body: 'someBody',
      headers: 'someHeaders',
      method: 'someMethod',
      url: 'someUrl',
    });
  });

  test('networkResponseItem', () => {
    const item = networkResponseItem('someBody', 'someHeaders', 'someStatusCode', 'someStatusMessage', 'someSrcUrl');
    expect(item.type).toBe('network-response');
    expect(item.payload).toEqual({
      body: 'someBody',
      headers: 'someHeaders',
      statusCode: 'someStatusCode',
      statusMessage: 'someStatusMessage',
      srcUrl: 'someSrcUrl',
    });
  });

  test('logEntry', () => {
    const item1 = textItem(LogLevel.Debug, 'item1');
    const item2 = textItem(LogLevel.Warn, 'item2');
    const entry = logEntry(item1, item2);
    expect(entry.timestamp).toBeGreaterThan(0);
    expect(entry.items).toHaveLength(2);
    expect(entry.items[0]).toBe(item1);
    expect(entry.items[1]).toBe(item2);
  });

  test('luisEditorDeepLink', () => {
    const item = luisEditorDeepLinkItem('someText');
    expect(item.type).toBe('luis-editor-deep-link');
    expect(item.payload).toEqual({ text: 'someText' });
  });
});
