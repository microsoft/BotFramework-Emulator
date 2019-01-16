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
import { Channel } from '@bfemulator/sdk-shared';
import { ipcMain, Event } from 'electron';

import { ElectronIPC, ElectronIPCServer } from './electron';

const mockWebContents = {
  send: () => {},
  on: () => {},
  once: () => {},
} as any;

jest.mock('electron', () => ({
  ipcMain: {
    on: (event, ...args) => void 0,
  },

  Event: class mockEvent {
    sender: any;
    type: string;
    constructor(mockType: string) {
      this.type = mockType;
    }
  },
}));

describe('The ElectronIPC', () => {
  let ipc: ElectronIPC;
  beforeEach(() => {
    ipc = new ElectronIPC(mockWebContents);
  });

  it('should send messages via the webContents', () => {
    const spy = jest.spyOn(mockWebContents, 'send');
    ipc.send('some-message-argument', {});
    expect(spy).toHaveBeenCalledWith(
      'ipc:message',
      'some-message-argument',
      {}
    );
  });

  it('should register a channel', () => {
    const channel = new Channel('a channel', {
      send: () => {},
    });
    ipc.registerChannel(channel);
    expect(ipc.getChannel('a channel')).toBe(channel);
  });

  it('should throw if a channel by the same name has been registered more than once', () => {
    const channel = new Channel('a channel', {
      send: () => {},
    });
    ipc.registerChannel(channel);
    const registerSameChannelAgain = () => ipc.registerChannel(channel);
    expect(registerSameChannelAgain).toThrow();
  });

  it('should route message through the appropriate channel', () => {
    const sender = { send: () => void 0 };
    const channel = new Channel('a channel', sender);
    const listener = {
      handler: () => {},
    };
    const spy = jest.spyOn(listener, 'handler');
    channel.setListener('my:message', listener.handler);
    ipc.registerChannel(channel);
    ipc.onMessage(new Event('message') as any, 'a channel', 'my:message', {});
    expect(spy).toHaveBeenCalledWith({});
  });
});

describe('The ElectronIPCServer', () => {
  let ipc: ElectronIPC;
  beforeEach(() => {
    ipc = new ElectronIPC(mockWebContents);
  });

  it('should register an ElectronIPC instance and provide a working disposable', () => {
    const disposable = ElectronIPCServer.registerIPC(ipc);
    expect((ElectronIPCServer as any)._ipcs.has(ipc.webContents)).toBeTruthy();
    expect(disposable.dispose).not.toThrow();
    expect((ElectronIPCServer as any)._ipcs.has(ipc.webContents)).toBeFalsy();
  });

  it('should route messages from the main ipc to the registered ipc', () => {
    (ElectronIPCServer as any).initialized = false;
    let cb: any;
    (ipcMain as any).on = (
      type: string,
      callback: (event: Event, ...args: any[]) => void
    ) => {
      cb = callback;
    };
    const spy = jest.spyOn(ipc, 'onMessage');
    ElectronIPCServer.registerIPC(ipc);
    const event = new Event('message');
    (event as any).sender = mockWebContents;

    cb(event, {});
    expect(spy).toHaveBeenCalledWith(event, {});
  });
});
