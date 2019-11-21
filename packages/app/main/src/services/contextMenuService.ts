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

import { Menu, MenuItem, MenuItemConstructorOptions, BrowserWindow } from 'electron';
import { ContextMenuCoordinates } from '@bfemulator/app-shared';

export class ContextMenuService {
  private static currentMenu: Menu;

  public static showMenuAndWaitForInput(
    options: Partial<MenuItemConstructorOptions>[] = [],
    menuCoords?: ContextMenuCoordinates
  ): Promise<MenuItem> {
    if (ContextMenuService.currentMenu) {
      ContextMenuService.currentMenu.closePopup();
    }
    return new Promise(resolve => {
      const clickHandler = menuItem => {
        ContextMenuService.currentMenu = null;
        resolve(menuItem);
      };

      const template = options.map(option => {
        option.click = clickHandler;
        return option;
      });
      const menu = (ContextMenuService.currentMenu = Menu.buildFromTemplate(template));

      const { roundToNearestInt } = this;
      const menuOptions = menuCoords
        ? {
            x: roundToNearestInt(menuCoords.x),
            y: roundToNearestInt(menuCoords.y),
            window: BrowserWindow.getFocusedWindow(),
          }
        : {};

      menu.popup(menuOptions);
    });
  }

  // menu.popup does not play nicely with long decimals
  private static roundToNearestInt(n: number): number {
    return n % 1 >= 0.5 ? Math.ceil(n) : Math.floor(n);
  }
}
