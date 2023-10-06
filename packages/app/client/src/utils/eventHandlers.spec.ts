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

import { SharedConstants } from '@bfemulator/app-shared';
import { CommandServiceImpl, CommandServiceInstance } from '@bfemulator/sdk-shared';
import * as remote from '@electron/remote';

import { globalHandlers } from './eventHandlers';

const {
  Commands: {
    Electron: { ToggleDevTools },
    Notifications,
    UI: { ShowBotCreationDialog, ShowOpenBotDialog, ToggleFullScreen },
  },
} = SharedConstants;

let mockLocalCommandsCalled = [];
let mockRemoteCommandsCalled = [];
const mockCurrentWebContents = {
  setZoomLevel: jest.fn(),
  getZoomFactor: jest.fn(),
  setZoomFactor: jest.fn(),
};
(remote.getCurrentWebContents as any).mockReturnValue(mockCurrentWebContents);
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

const mockDOM = `
<ul class="app-menu">
  <button id="file-btn">File</button>
  <button id="edit-btn">Edit</button>
</ul>
<nav>
  <button id="navBtn">NavBtn</button>
</nav>
<main>
  <button id="btn1">btn 1</button>
  <button id="btn2">btn 2</button>
  <div>
    <button id="btn3">btn 3</button>
  </div>
</main>
`;

describe('#globalHandlers', () => {
  let commandService: CommandServiceImpl;

  beforeAll(() => {
    const decorator = CommandServiceInstance();
    const descriptor = decorator({ descriptor: {} }, 'none') as any;
    commandService = descriptor.descriptor.get();

    commandService.call = (commandName: string, ...args: any[]) => {
      mockLocalCommandsCalled.push({ commandName, args: args });
      return true as any;
    };
    commandService.remoteCall = (commandName: string, ...args: any[]) => {
      mockRemoteCommandsCalled.push({ commandName, args: args });
      return true as any;
    };
  });

  beforeEach(() => {
    mockLocalCommandsCalled = [];
    mockRemoteCommandsCalled = [];
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('calls ShowOpenBotDialog when CMD+O is pressed', async () => {
    const event = new KeyboardEvent('keydown', { metaKey: true, key: 'o' });
    await globalHandlers(event);
    expect(mockLocalCommandsCalled.length).toBe(1);
    expect(mockLocalCommandsCalled[0].commandName).toBe(ShowOpenBotDialog);
  });

  it('calls ShowOpenBotDialog when CTRL+O is pressed', async () => {
    const event = new KeyboardEvent('keydown', { ctrlKey: true, key: 'O' });

    await globalHandlers(event);
    expect(mockLocalCommandsCalled.length).toBe(1);
    expect(mockLocalCommandsCalled[0].commandName).toBe(ShowOpenBotDialog);
  });

  it('calls ShowBotCreationDialog when CMD+N is pressed', async () => {
    const event = new KeyboardEvent('keydown', { metaKey: true, key: 'n' });

    await globalHandlers(event);
    expect(mockLocalCommandsCalled.length).toBe(1);
    expect(mockLocalCommandsCalled[0].commandName).toBe(ShowBotCreationDialog);
  });

  it('calls ShowBotCreationDialog when CTRL+N is pressed', async () => {
    const event = new KeyboardEvent('keydown', { ctrlKey: true, key: 'N' });

    await globalHandlers(event);
    expect(mockLocalCommandsCalled.length).toBe(1);
    expect(mockLocalCommandsCalled[0].commandName).toBe(ShowBotCreationDialog);
  });

  it("calls nothing with a keydown it doesn't care about", async () => {
    const event = new KeyboardEvent('keydown', { ctrlKey: true, key: 'y' });

    await globalHandlers(event);
    expect(mockLocalCommandsCalled.length).toBe(0);
  });

  it('should send a notification if a command fails', async () => {
    const event = new KeyboardEvent('keydown', { ctrlKey: true, key: 'N' });
    const spy = jest.spyOn(commandService, 'call').mockRejectedValueOnce('oh noes!');

    await globalHandlers(event);
    expect(spy).toHaveBeenLastCalledWith(Notifications.Add, {
      message: 'oh noes!',
      type: 1,
    });
  });

  it('should reset the zoom level when Ctrl+0 is pressed', async () => {
    const event = new KeyboardEvent('keydown', { ctrlKey: true, key: '0' });
    await globalHandlers(event);

    expect(mockCurrentWebContents.setZoomLevel).toHaveBeenCalledWith(0);
  });

  it('should zoom in when Ctrl+= is pressed', async () => {
    const event = new KeyboardEvent('keydown', { ctrlKey: true, key: '=' });

    // standard zoom from 1 to 1.1 zoom factor
    mockCurrentWebContents.setZoomFactor.mockClear();
    mockCurrentWebContents.getZoomFactor.mockImplementation(() => 1);
    await globalHandlers(event);

    expect(mockCurrentWebContents.setZoomFactor).toHaveBeenCalledWith(1.1);

    // trying to zoom past the max zoom factor (3) should not go above 3
    mockCurrentWebContents.setZoomFactor.mockClear();
    mockCurrentWebContents.getZoomFactor.mockImplementation(() => 3.1);
    await globalHandlers(event);

    expect(mockCurrentWebContents.setZoomFactor).toHaveBeenCalledWith(3);
  });

  it('should zoom in when Ctrl+Shift+= is pressed', async () => {
    const event = new KeyboardEvent('keydown', { ctrlKey: true, key: '+' });

    // standard zoom from 1 to 1.1 zoom factor
    mockCurrentWebContents.setZoomFactor.mockClear();
    mockCurrentWebContents.getZoomFactor.mockImplementation(() => 1);
    await globalHandlers(event);

    expect(mockCurrentWebContents.setZoomFactor).toHaveBeenCalledWith(1.1);

    // trying to zoom past the max zoom factor (3) should not go above 3
    mockCurrentWebContents.setZoomFactor.mockClear();
    mockCurrentWebContents.getZoomFactor.mockImplementation(() => 3.1);
    await globalHandlers(event);

    expect(mockCurrentWebContents.setZoomFactor).toHaveBeenCalledWith(3);
  });

  it('should zoom out when Ctrl+- is pressed', async () => {
    const event = new KeyboardEvent('keydown', { ctrlKey: true, key: '-' });

    // standard zoom from 1 to 0.9 zoom factor
    mockCurrentWebContents.setZoomFactor.mockClear();
    mockCurrentWebContents.getZoomFactor.mockImplementation(() => 1);
    await globalHandlers(event);

    expect(mockCurrentWebContents.setZoomFactor).toHaveBeenCalledWith(0.9);

    // trying to zoom past the minimum zoom factor (0.25) should not go below 0,25
    mockCurrentWebContents.setZoomFactor.mockClear();
    mockCurrentWebContents.getZoomFactor.mockImplementation(() => 0.1);
    await globalHandlers(event);

    expect(mockCurrentWebContents.setZoomFactor).toHaveBeenCalledWith(0.25);
  });

  it('should zoom out when Ctrl+Shift+- is pressed', async () => {
    const event = new KeyboardEvent('keydown', { ctrlKey: true, key: '_' });

    // standard zoom from 1 to 0.9 zoom factor
    mockCurrentWebContents.setZoomFactor.mockClear();
    mockCurrentWebContents.getZoomFactor.mockImplementation(() => 1);
    await globalHandlers(event);

    expect(mockCurrentWebContents.setZoomFactor).toHaveBeenCalledWith(0.9);

    // trying to zoom past the minimum zoom factor (0.25) should not go below 0,25
    mockCurrentWebContents.setZoomFactor.mockClear();
    mockCurrentWebContents.getZoomFactor.mockImplementation(() => 0.1);
    await globalHandlers(event);

    expect(mockCurrentWebContents.setZoomFactor).toHaveBeenCalledWith(0.25);
  });

  it('should toggle fullscreen when F11 is pressed', async () => {
    const event = new KeyboardEvent('keydown', { key: 'f11' });
    await globalHandlers(event);

    expect(mockLocalCommandsCalled).toHaveLength(1);
    expect(mockLocalCommandsCalled[0].commandName).toBe(ToggleFullScreen);
  });

  it('should toggle dev tools when Ctrl+Shit+I is pressed', async () => {
    const event = new KeyboardEvent('keydown', { ctrlKey: true, shiftKey: true, key: 'i' });
    await globalHandlers(event);

    expect(mockRemoteCommandsCalled).toHaveLength(1);
    expect(mockRemoteCommandsCalled[0].commandName).toBe(ToggleDevTools);
  });

  it('should move focus to first element when Tab is pressed on Mac', async () => {
    const event = new KeyboardEvent('keydown', { key: 'Tab' });
    Object.defineProperty(process, 'platform', { value: 'darwin' });

    document.body.innerHTML = mockDOM;
    const mockFirstElement = document.getElementById('navBtn');
    const mockLastElement = document.getElementById('btn3');
    mockLastElement.focus();
    await globalHandlers(event);

    expect(document.activeElement.id).toBe(mockFirstElement.id);
  });

  it('should move focus to first element when Tab is pressed on Linux', async () => {
    const event = new KeyboardEvent('keydown', { key: 'Tab' });
    Object.defineProperty(process, 'platform', { value: 'linux' });

    document.body.innerHTML = mockDOM;
    const mockFirstElement = document.getElementById('file-btn');
    const mockLastElement = document.getElementById('btn3');
    mockLastElement.focus();
    await globalHandlers(event);

    expect(document.activeElement.id).toBe(mockFirstElement.id);
  });

  it('should move focus to last element when Shift+Tab is pressed', async () => {
    const event = new KeyboardEvent('keydown', { shiftKey: true, key: 'Tab' });
    Object.defineProperty(process, 'platform', { value: 'darwin' });

    document.body.innerHTML = mockDOM;
    const mockFirstElement = document.getElementById('navBtn');
    const mockLastElement = document.getElementById('btn3');
    mockFirstElement.focus();
    await globalHandlers(event);

    expect(document.activeElement.id).toBe(mockLastElement.id);
  });
});
