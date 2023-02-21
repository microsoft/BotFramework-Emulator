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
  beginAdd,
  close,
  closeDocument as closeChatDocument,
  openBotViaUrlAction,
  openTranscript,
  SharedConstants,
} from '@bfemulator/app-shared';
import { CommandRegistry, CommandServiceImpl, CommandServiceInstance } from '@bfemulator/sdk-shared';

import { EmulatorCommands } from './emulatorCommands';

let mockState = {};
const mockStore = {
  dispatch: jest.fn(),
  getState: () => mockState,
};
jest.mock('../state/store', () => ({
  get store() {
    return mockStore;
  },
}));

jest.mock('electron', () => ({
  ipcMain: new Proxy(
    {},
    {
      get(): any {
        return () => ({});
      },
      has() {
        return true;
      },
    }
  ),
  ipcRenderer: new Proxy(
    {},
    {
      get(): any {
        return () => ({});
      },
      has() {
        return true;
      },
    }
  ),
}));

describe('The emulator commands', () => {
  let commandService: CommandServiceImpl;
  let registry: CommandRegistry;
  const { Emulator } = SharedConstants.Commands;

  beforeAll(() => {
    new EmulatorCommands();
    const decorator = CommandServiceInstance();
    const descriptor = decorator({ descriptor: {} }, 'none') as any;
    commandService = descriptor.descriptor.get();
    registry = commandService.registry;
  });

  beforeEach(() => {
    mockState = {};
    mockStore.dispatch.mockClear();
  });

  it('should open a new live chat', () => {
    const mockEndpoint: any = {
      appId: 'someAppId',
      appPassword: 'someAppPw',
      channelService: 'someChannelService',
      endpoint: 'http://localhost:3978/api/messages',
    };
    const handler = registry.getCommand(Emulator.NewLiveChat);
    handler(mockEndpoint, 'livechat');

    expect(mockStore.dispatch).toHaveBeenCalledWith(
      openBotViaUrlAction({
        appId: 'someAppId',
        appPassword: 'someAppPw',
        channelService: 'someChannelService' as any,
        endpoint: 'http://localhost:3978/api/messages',
        isFromBotFile: true,
        mode: 'livechat',
      })
    );
  });

  it('should prompt to open a transcript', async () => {
    const mockFileName = 'test.transcript';
    const remoteCallSpy = jest.spyOn(commandService, 'remoteCall').mockResolvedValueOnce(mockFileName);
    const handler = registry.getCommand(Emulator.PromptToOpenTranscript);
    await handler();

    expect(mockStore.dispatch).toHaveBeenCalledWith(openTranscript(mockFileName));
    remoteCallSpy.mockClear();
  });

  it('should spawn a notification if prompting to open a transcript fails', async () => {
    const remoteCallSpy = jest
      .spyOn(commandService, 'remoteCall')
      .mockRejectedValueOnce(new Error('Something went wrong.'));
    const handler = registry.getCommand(Emulator.PromptToOpenTranscript);
    await handler();

    expect(mockStore.dispatch).toHaveBeenCalledWith({
      ...beginAdd(undefined),
      payload: expect.any(Object),
    });
    remoteCallSpy.mockClear();
  });

  it('should reload a transcript', () => {
    const mockFilePath = '/dir/test.transcript';
    const mockFilename = 'test.transcript';
    mockState = {
      editor: {
        editors: {
          [SharedConstants.EDITOR_KEY_PRIMARY]: {
            documents: {
              [mockFilePath]: {},
            },
          },
        },
      },
    };
    const handler = registry.getCommand(Emulator.ReloadTranscript);
    handler(mockFilePath, mockFilename);

    expect(mockStore.dispatch).toHaveBeenCalledWith(close(SharedConstants.EDITOR_KEY_PRIMARY, mockFilePath));
    expect(mockStore.dispatch).toHaveBeenCalledWith(closeChatDocument(mockFilePath));
    expect(mockStore.dispatch).toHaveBeenCalledWith(openTranscript(mockFilename));
  });
});
