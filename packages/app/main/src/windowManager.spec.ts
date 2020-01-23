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

import { rememberZoomLevel } from '@bfemulator/app-shared';

import { WindowManager } from './windowManager';

const mockDispatch = jest.fn();
const mockSettings = {
  windowState: {
    zoomLevel: 0,
  },
};
jest.mock('./state/store', () => ({
  dispatch: action => mockDispatch(action),
  getSettings: () => mockSettings,
}));

const mockOn = jest.fn();
jest.mock('electron', () => ({
  ipcMain: {
    on: (eventName, handler) => mockOn(eventName, handler),
  },
}));

describe('WindowManager', () => {
  let windowManager: WindowManager;
  beforeEach(() => {
    windowManager = new WindowManager();
    mockDispatch.mockClear();
  });

  it('should add a main window', () => {
    const window: any = {};
    windowManager.addMainWindow(window);

    expect((windowManager as any).mainWindow).toEqual(window);
  });

  it('should return whether or not it has a main window', () => {
    (windowManager as any).mainWindow = {};

    expect(windowManager.hasMainWindow()).toBe(true);
  });

  it('should return the main window', () => {
    const mockWindow = {};
    (windowManager as any).mainWindow = mockWindow;

    expect(windowManager.getMainWindow()).toEqual(mockWindow);
  });

  it('should add a window', () => {
    const mockWindow: any = {};
    windowManager.add(mockWindow);

    expect((windowManager as any).windows).toEqual([mockWindow]);
  });

  it('should remove a window', () => {
    const mockWindow: any = {};
    (windowManager as any).windows = [mockWindow];
    windowManager.remove(mockWindow);

    expect((windowManager as any).windows).toEqual([]);
  });

  it('should zoom in', () => {
    const mockMainWindow: any = {
      webContents: {
        setZoomLevel: jest.fn(),
      },
    };
    const mockWindow: any = {
      webContents: {
        setZoomLevel: jest.fn(),
      },
    };
    windowManager.addMainWindow(mockMainWindow);
    windowManager.add(mockWindow);
    windowManager.zoomIn();

    // 0 -> 1
    expect(mockMainWindow.webContents.setZoomLevel).toHaveBeenCalledWith(1);
    expect(mockWindow.webContents.setZoomLevel).toHaveBeenCalledWith(1);
    expect(mockDispatch).toHaveBeenCalledWith(rememberZoomLevel({ zoomLevel: 1 }));
  });

  it('should zoom out', () => {
    const mockMainWindow: any = {
      webContents: {
        setZoomLevel: jest.fn(),
      },
    };
    const mockWindow: any = {
      webContents: {
        setZoomLevel: jest.fn(),
      },
    };
    windowManager.addMainWindow(mockMainWindow);
    windowManager.add(mockWindow);
    windowManager.zoomOut();

    // 0 -> -1
    expect(mockMainWindow.webContents.setZoomLevel).toHaveBeenCalledWith(-1);
    expect(mockWindow.webContents.setZoomLevel).toHaveBeenCalledWith(-1);
    expect(mockDispatch).toHaveBeenCalledWith(rememberZoomLevel({ zoomLevel: -1 }));
  });

  it('should close all windows', () => {
    const mockClose = jest.fn();
    const firstMockWindow: any = {
      close: mockClose,
    };
    const secondMockWindow: any = {
      close: mockClose,
    };
    const mockMainWindow: any = {};
    windowManager.addMainWindow(mockMainWindow);
    windowManager.add(firstMockWindow);
    windowManager.add(secondMockWindow);
    windowManager.closeAll();

    expect(mockClose).toHaveBeenCalledTimes(2);
    expect((windowManager as any).mainWindow).toBe(undefined);
    expect((windowManager as any).windows.length).toBe(0);
  });
});
