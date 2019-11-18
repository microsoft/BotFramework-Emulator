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

import { LogLevel } from '@bfemulator/sdk-shared';
import log from 'npmlog';

import { ConsoleLogService } from './consoleLogService';

jest.mock('npmlog', () => ({
  error: jest.fn(() => null),
  info: jest.fn(() => null),
  warn: jest.fn(() => null),
  silly: jest.fn(() => null),
}));

describe('ConsoleLogService', () => {
  const errorSpy = jest.spyOn(log, 'error');
  const infoSpy = jest.spyOn(log, 'info');
  const warnSpy = jest.spyOn(log, 'warn');
  const sillySpy = jest.spyOn(log, 'silly');

  beforeEach(() => {
    errorSpy.mockClear();
    infoSpy.mockClear();
    warnSpy.mockClear();
    sillySpy.mockClear();
  });

  it('should log items to chat with a conversation id', () => {
    const conversationId = 'convo1';
    const messages: any = [
      { type: 'text', payload: { level: LogLevel.Debug, text: 'msg1' } },
      { type: 'text', payload: { level: LogLevel.Error, text: 'msg2' } },
      { type: 'text', payload: { level: LogLevel.Info, text: 'msg3' } },
      { type: 'text', payload: { level: LogLevel.Warn, text: 'msg4' } },
      { type: undefined },
    ];
    const consoleLogService = new ConsoleLogService();
    consoleLogService.logToChat(conversationId, ...messages);

    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(errorSpy).toHaveBeenCalledWith(conversationId, 'msg2');
    expect(infoSpy).toHaveBeenCalledTimes(1);
    expect(infoSpy).toHaveBeenCalledWith(conversationId, 'msg3');
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledWith(conversationId, 'msg4');
    expect(sillySpy).toHaveBeenCalledTimes(1);
    expect(sillySpy).toHaveBeenCalledWith(conversationId, 'msg1');
  });

  it('should log items to chat with no conversation id', () => {
    const messages: any = [
      { type: 'text', payload: { level: LogLevel.Debug, text: 'msg1' } },
      { type: 'text', payload: { level: LogLevel.Error, text: 'msg2' } },
      { type: 'text', payload: { level: LogLevel.Info, text: 'msg3' } },
      { type: 'text', payload: { level: LogLevel.Warn, text: 'msg4' } },
      { type: undefined },
    ];
    const consoleLogService = new ConsoleLogService();
    consoleLogService.logToChat(undefined, ...messages);

    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(errorSpy).toHaveBeenCalledWith('', 'msg2');
    expect(infoSpy).toHaveBeenCalledTimes(1);
    expect(infoSpy).toHaveBeenCalledWith('', 'msg3');
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledWith('', 'msg4');
    expect(sillySpy).toHaveBeenCalledTimes(1);
    expect(sillySpy).toHaveBeenCalledWith('', 'msg1');
  });
});
