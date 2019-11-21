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

import { BrowserWindow, MenuItemConstructorOptions } from 'electron';

import { ContextMenuService } from './contextMenuService';

const mockPopup = jest.fn();
jest.mock('electron', () => ({
  BrowserWindow: class {
    public static getFocusedWindow() {
      return {};
    }
  },
  Menu: class {
    public static buildFromTemplate(...args: any[]) {
      return {
        popup: (...args) => mockPopup(...args),
      };
    }
  },
  MenuItemConstructorOptions: class {},
}));

describe('The ContextMenuService', () => {
  beforeAll(() => {
    (ContextMenuService as any).currentMenu = { closePopup: () => void 0 };
    mockPopup.mockClear();
  });

  it('should show the menu and wait for user input', async () => {
    const options: MenuItemConstructorOptions = {};
    let resolved = false;
    const closePopupSpy = jest.spyOn((ContextMenuService as any).currentMenu, 'closePopup');
    const mockMenuCoords = { x: 150.234, y: 300.999 };
    ContextMenuService.showMenuAndWaitForInput([options], mockMenuCoords).then(() => {
      resolved = true;
    });
    const mockFocusedWindow: any = {};
    const getFocusedWindowSpy = jest.spyOn(BrowserWindow, 'getFocusedWindow').mockReturnValueOnce(mockFocusedWindow);

    expect(closePopupSpy).toHaveBeenCalled();
    expect(options.click).not.toBeNull();
    await options.click({} as any, null, null);
    expect(resolved).toBeTruthy();
    expect(mockPopup).toHaveBeenCalledWith({ x: 150, y: 301, window: mockFocusedWindow });

    closePopupSpy.mockRestore();
    getFocusedWindowSpy.mockRestore();
  });
});
