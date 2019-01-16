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
import { emulator } from './emulator';
import './fetchProxy';
import { mainWindow } from './main';
import { RestServer } from './restServer';

jest.mock('./main', () => ({
  mainWindow: {
    commandService: {
      call: async () => true,
      remoteCall: async () => true,
    },
    logService: {
      logToChat: () => void 0,
    },
  },
}));

jest.mock('./emulator', () => ({
  emulator: new class {
    report() {
      return null;
    }
  }(),
}));

describe('The restServer', () => {
  let restServer;
  beforeAll(() => {
    restServer = new RestServer();
  });

  it('should log to the LOG panel after each successful request', () => {
    const logSpy = jest.spyOn(mainWindow.logService, 'logToChat');
    const mockReq = {
      method: 'post',
      conversation: {
        conversationId: '123',
      },
      params: {},
      _body: {},
      headers: {},
      url: 'http://localhost',
      statusCode: 200,
      statusMessage: 'ok',
    };
    const mockRes = {
      statusCode: 200,
    };
    const mockRoute = {
      spec: { path: '' },
    };
    (restServer as any).onRouterAfter(mockReq, mockRes, mockRoute);

    expect(logSpy).toHaveBeenCalledWith(
      '123',
      {
        payload: {
          body: {},
          facility: 'network',
          headers: {},
          method: 'post',
          url: 'http://localhost',
        },
        type: 'network-request',
      },
      {
        payload: {
          body: undefined,
          headers: undefined,
          srcUrl: 'http://localhost',
          statusCode: 200,
          statusMessage: undefined,
        },
        type: 'network-response',
      },
      { payload: { level: 0, text: 'network.' }, type: 'text' }
    );
  });

  it('should create a new conversation and open a new livechat window', async () => {
    const remoteCallSpy = jest
      .spyOn(mainWindow.commandService, 'remoteCall')
      .mockResolvedValue(true);
    const reportSpy = jest.spyOn(emulator, 'report');
    const mockConversation = {
      conversationId: '123',
      botEndpoint: { id: '456', url: 'https://localhost' },
    };
    await (restServer as any).onNewConversation(mockConversation);
    expect(remoteCallSpy).toHaveBeenCalledWith('livechat:new', {
      endpoint: undefined,
      id: '456',
    });
    expect(reportSpy).toHaveBeenCalledWith('123');

    remoteCallSpy.mockReset();
    reportSpy.mockReset();
  });

  it('should not create a new conversation when the conversationId contains "transcript"', async () => {
    const remoteCallSpy = jest
      .spyOn(mainWindow.commandService, 'remoteCall')
      .mockResolvedValue(true);
    const reportSpy = jest.spyOn(emulator, 'report');
    const mockConversation = {
      conversationId: 'transcript',
      botEndpoint: { id: '456', url: 'https://localhost' },
    };
    await (restServer as any).onNewConversation(mockConversation);
    expect(remoteCallSpy).not.toHaveBeenCalled();
    expect(reportSpy).not.toHaveBeenCalled();
  });

  it('should begin listening when listen is called', async () => {
    const result = await restServer.listen();
    expect(result).toEqual({
      url: jasmine.any(String),
      port: jasmine.any(Number),
    });
  });

  it('should close the server when close is called', async () => {
    const result = await restServer.close();
    expect(result).toBeUndefined();
  });
});
