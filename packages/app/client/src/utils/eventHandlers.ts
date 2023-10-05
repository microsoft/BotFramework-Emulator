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
import { isLinux, isMac, Notification, NotificationType, SharedConstants } from '@bfemulator/app-shared';
import { CommandServiceImpl, CommandServiceInstance } from '@bfemulator/sdk-shared';
import * as remote from '@electron/remote';

const { Electron } = SharedConstants.Commands;

const maxZoomFactor = 3; // 300%
const minZoomFactor = 0.25; // 25%;
class EventHandlers {
  @CommandServiceInstance()
  public static commandService: CommandServiceImpl;

  private static getLastChildWithChildren(node) {
    for (let index = node.children.length; index > 0; index--) {
      if (node.children[index - 1].children.length > 0 && !node.children[index - 1].hidden) {
        return node.children[index - 1];
      }
    }
  }

  private static getLastDecendants(node, list = []) {
    if (node.children.length > 0) {
      const child = this.getLastChildWithChildren(node);
      if (child) {
        list.push(child);
        this.getLastDecendants(child, list);
      }
    }

    const result = [].filter.call(list[list.length - 1].children, element => !element.hasAttribute('disabled'));

    return result;
  }

  public static async globalHandles(event: KeyboardEvent): Promise<any> {
    // Meta corresponds to 'Command' on Mac
    const ctrlOrCmdPressed = event.ctrlKey || event.metaKey;
    const shiftPressed = event.shiftKey;
    const key = event.key.toLowerCase();
    const keyCode = event.keyCode;
    const {
      Commands: {
        Electron: { ToggleDevTools },
        UI: { ShowBotCreationDialog, ShowOpenBotDialog, ToggleFullScreen },
        Notifications: { Add },
      },
    } = SharedConstants;
    let awaitable: Promise<any>;
    // Ctrl+O
    if (ctrlOrCmdPressed && key === 'o') {
      awaitable = EventHandlers.commandService.call(ShowOpenBotDialog);
    }
    // Ctrl+N
    if (ctrlOrCmdPressed && key === 'n') {
      awaitable = EventHandlers.commandService.call(ShowBotCreationDialog);
    }
    // Ctrl+0
    if (ctrlOrCmdPressed && key === '0') {
      remote.getCurrentWebContents().setZoomLevel(0);
    }
    // Ctrl+= or Ctrl+Shift+=
    if (ctrlOrCmdPressed && (key === '=' || key === '+')) {
      const webContents = remote.getCurrentWebContents();
      const zoomFactor = webContents.getZoomFactor();
      const newZoomFactor = zoomFactor + 0.1;
      if (newZoomFactor >= maxZoomFactor) {
        webContents.setZoomFactor(maxZoomFactor);
      } else {
        webContents.setZoomFactor(newZoomFactor);
      }
    }
    // Ctrl+- or Ctrl+Shift+-
    if (ctrlOrCmdPressed && (key === '-' || key === '_')) {
      const webContents = remote.getCurrentWebContents();
      const zoomFactor = webContents.getZoomFactor();
      const newZoomFactor = zoomFactor - 0.1;
      if (newZoomFactor <= minZoomFactor) {
        webContents.setZoomFactor(minZoomFactor);
      } else {
        webContents.setZoomFactor(newZoomFactor);
      }
    }
    // F11
    if (key === 'f11') {
      awaitable = EventHandlers.commandService.call(ToggleFullScreen);
    }
    // Ctrl+Shift+I
    if (ctrlOrCmdPressed && shiftPressed && key === 'i') {
      awaitable = EventHandlers.commandService.remoteCall(ToggleDevTools);
    }
    if (awaitable) {
      // Prevents the char from showing up if an input is focused
      event.preventDefault();
      event.stopPropagation();
      try {
        await awaitable;
      } catch (e) {
        await EventHandlers.commandService.call(Add, {
          message: '' + e,
          type: NotificationType.Error,
        } as Notification);
      }
    }

    if (isMac() || isLinux()) {
      const tabPressed: boolean = key === 'tab';

      if (tabPressed) {
        const lastDecendants = EventHandlers.getLastDecendants(document.querySelector('main'));
        // TODO: More generalized approach to finding first and last focusable elements. This seems brittle.
        let firstElement: HTMLElement;
        if (isLinux()) {
          firstElement = document.querySelector('[class*="app-menu"] button');
        } else {
          firstElement = document.querySelector('nav').firstElementChild as HTMLElement;
        }
        const lastElement = lastDecendants[lastDecendants.length - 1] as HTMLElement;
        const isFirstElement: boolean = document.activeElement === firstElement;
        const isLastElement: boolean = document.activeElement === lastElement;

        if (shiftPressed && isFirstElement) {
          lastElement.focus();
          event.preventDefault();
        } else if (!shiftPressed && isLastElement) {
          firstElement.focus();
          event.preventDefault();
        }
      }
    }
  }
}
export const globalHandlers = EventHandlers.globalHandles;
