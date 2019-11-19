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

import { exceptionItem, inspectableObjectItem, LogLevel, summaryTextItem, textItem } from '@bfemulator/sdk-shared';
import { Activity, ActivityTypes } from 'botframework-schema';
import { LogItem } from '@bfemulator/sdk-shared/build/src';

import { LoggerAdapter } from './loggerAdapter';

describe('LoggerAdapter', () => {
  const mockLogToChat = jest.fn(() => null);
  const logService: any = {
    logToChat: mockLogToChat,
  };
  let loggerAdapter: LoggerAdapter;

  beforeEach(() => {
    loggerAdapter = new LoggerAdapter(logService);
    mockLogToChat.mockClear();
  });

  it('should log an activity to the user', () => {
    const conversationId = 'convo1';
    const activity: any = {
      type: 'text',
      text: 'hello!',
    };
    loggerAdapter.logActivity(conversationId, activity, 'user');

    expect(mockLogToChat).toHaveBeenCalledWith(
      conversationId,
      textItem(LogLevel.Debug, '<- '),
      inspectableObjectItem(activity.type, activity),
      summaryTextItem(activity)
    );
  });

  it('should log an activity to the bot', () => {
    const conversationId = 'convo1';
    const activity: any = {
      type: 'text',
      text: 'hi bot!',
    };
    loggerAdapter.logActivity(conversationId, activity, 'bot');

    expect(mockLogToChat).toHaveBeenCalledWith(
      conversationId,
      textItem(LogLevel.Debug, '-> '),
      inspectableObjectItem(activity.type, activity),
      summaryTextItem(activity)
    );
  });

  it('should log a message', () => {
    const conversationId = 'convo1';
    const messages: any = [{ type: 'text', payload: { text: 'hey' } }];
    loggerAdapter.logMessage(conversationId, ...messages);

    expect(mockLogToChat).toHaveBeenCalledWith(conversationId, ...messages);
  });

  it('should log an exception', () => {
    const conversationId = 'convo1';
    const error = new Error('Something went horribly wrong! ;(');
    loggerAdapter.logException(conversationId, error);

    expect(mockLogToChat).toHaveBeenCalledWith(conversationId, exceptionItem(error));
  });

  it('should log a nested message in a trace activity', () => {
    const conversationId = 'convo1';
    const activity = {
      id: 'someId',
      label: 'Message sent',
      type: ActivityTypes.Trace,
      value: {
        type: ActivityTypes.Message,
        from: { role: 'bot' },
        text: 'Hello',
      },
    } as Activity;

    const logItems: LogItem[] = [
      textItem(LogLevel.Debug, '<- '),
      inspectableObjectItem(activity.type, activity),
      summaryTextItem(activity),
      textItem(LogLevel.Debug, '-> '),
      inspectableObjectItem(activity.value.type, activity.value),
      summaryTextItem(activity.value),
    ];

    loggerAdapter.logActivity(conversationId, activity, 'user');
    expect(mockLogToChat).toHaveBeenCalledWith(conversationId, ...logItems);
  });
});
