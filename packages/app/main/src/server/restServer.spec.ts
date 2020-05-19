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

import { textItem, LogLevel } from '@bfemulator/sdk-shared';

import { EmulatorRestServer } from './restServer';

jest.mock('./routes/mountAllRoutes', () => ({
  mountAllRoutes: jest.fn(),
}));

describe('restServer', () => {
  let server: EmulatorRestServer;
  const logService = {
    logToChat: jest.fn(),
  };
  const emulatorUrl = 'http://localhost:52634';
  const conversationId = 'convo1';
  const mockConversation: any = {
    botEndpoint: {
      botUrl: 'http://localhost:3978/api/messages',
    },
  };

  beforeEach(() => {
    server = new EmulatorRestServer({ logService });
    (server as any)._serverUrl = emulatorUrl;
    server.state.conversations.conversations = {
      [conversationId]: mockConversation,
    };
    logService.logToChat.mockClear();
  });

  it('should report the bot url and emulator url', () => {
    server.report(conversationId);

    expect(logService.logToChat).toBeCalledWith(
      conversationId,
      textItem(LogLevel.Debug, `Connecting to bot on ${mockConversation.botEndpoint.botUrl}`)
    );
    expect(logService.logToChat).toBeCalledWith(
      conversationId,
      textItem(LogLevel.Debug, `Emulator listening on ${emulatorUrl}`)
    );
  });
});
