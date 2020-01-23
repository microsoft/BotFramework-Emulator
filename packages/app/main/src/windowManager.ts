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

import * as Electron from 'electron';
import { rememberZoomLevel } from '@bfemulator/app-shared';

import { dispatch, getSettings } from './state/store';

export class WindowManager {
  private mainWindow: Electron.BrowserWindow;
  private windows: Electron.BrowserWindow[];

  constructor() {
    this.windows = [];
  }

  public addMainWindow(window: Electron.BrowserWindow) {
    this.mainWindow = window;
  }

  public hasMainWindow(): boolean {
    return this.mainWindow !== undefined;
  }

  public getMainWindow(): Electron.BrowserWindow {
    return this.mainWindow;
  }

  public add(window: Electron.BrowserWindow) {
    this.windows.push(window);
  }

  public remove(window: Electron.BrowserWindow) {
    const idx = this.windows.indexOf(window);
    if (idx !== -1) {
      this.windows.splice(idx, 1);
    }
  }

  public zoomIn() {
    let zoomLevel = getSettings().windowState.zoomLevel;
    zoomLevel = Math.min(zoomLevel + 1, 8);
    this.zoomTo(zoomLevel);
  }

  public zoomOut() {
    let zoomLevel = getSettings().windowState.zoomLevel;
    zoomLevel = Math.max(zoomLevel - 1, -4);
    this.zoomTo(zoomLevel);
  }

  public zoomTo(zoomLevel: number) {
    this.mainWindow.webContents.setZoomLevel(zoomLevel);
    this.windows.forEach(win => win.webContents.setZoomLevel(zoomLevel));
    dispatch(rememberZoomLevel({ zoomLevel }));
  }

  public createOAuthWindow(url: string, codeVerifier: string) {
    const win = new Electron.BrowserWindow({
      width: 800,
      height: 600,
      title: 'Sign In',
      webPreferences: {
        nodeIntegration: false,
      },
    });
    this.add(win);
    const webContents = win.webContents;

    // webContents.openDevTools();
    webContents.setZoomLevel(getSettings().windowState.zoomLevel);

    win.on('closed', () => {
      this.remove(win);
    });

    const ses = webContents.session;
    ses.webRequest.onBeforeRequest((details, callback) => {
      const url1 = details.url.toLowerCase();
      if (url1.indexOf('/postsignincallback?') !== -1 && url1.indexOf('&code_verifier=') === -1) {
        if (getSettings().framework.useCodeValidation) {
          codeVerifier = 'emulated';
        }
        // final OAuth redirect so augment the call with the code_verifier
        const newUrl = details.url + '&code_verifier=' + codeVerifier;
        callback({ redirectURL: newUrl });
      } else {
        // let the request happen
        callback({});
      }
    });

    win.loadURL(url);
  }

  public closeAll() {
    const openWindows = [];
    this.windows.forEach(win => openWindows.push(win));
    openWindows.forEach(win => win.close());
    this.windows = [];
    this.mainWindow = undefined;
  }
}
