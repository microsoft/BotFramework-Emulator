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

import { BrowserWindow } from 'electron';

export class LuisAuthWorkflowService {

  constructor() {
    throw new ReferenceError('The LuisAuthWorkflowService cannot be constructed.');
  }

  public static* enterAuthWorkflow(): IterableIterator<Promise<BrowserWindow> | Promise<{ key: string, BaseUrl: string } | boolean>> {
    const authWindow = yield LuisAuthWorkflowService.launchAuthWindow();
    authWindow.show();
    // We're always getting the v1.0 endpoint
    // which we do not want to support. Pull out the region
    // and include it in a custom object the we'll build the
    // endpoint ourselves
    let result = yield LuisAuthWorkflowService.waitForLuisDataFromWindow(authWindow);
    if (result) {
      const { BaseUrl: url, key } = result;
      const [, region] = /(?:https:\/\/)([\w]+)/.exec(url);
      result = { key, region };
    }
    authWindow.close();
    yield result;
  }

  private static async waitForLuisDataFromWindow(browserWindow: BrowserWindow): Promise<{ key: string, BaseUrl: string } | boolean> {
    const script = `
      (function(window) {
        const nav = document.querySelector('.global-navigation');
        const bf = document.querySelector('bf-login');
        if (nav) {
          nav.style.display = 'none';
          const h2 = nav.appendChild(document.createElement('h2'));
          h2.textContent = 'Sign-in Required to Display LUIS Models';
        }
        if (bf) {
          bf.style.position = 'absolute';
          bf.style.top = '50%';
          bf.style.transform = 'translateY(-50%)';
        }
        return new Promise(resolve => {
          const messages = [];
          window.parent.addEventListener('message', message => messages.push(message.data));
          window.addEventListener('beforeunload', () => resolve(messages));
        });
      })(window);
    `;
    while (true) {
      const messages = await browserWindow.webContents.executeJavaScript(script);
      let canceled;
      for (let i = 0; i < messages.length; i++) {
        if ('key' in messages[i]) {
          return messages[i];
        }
        // This could be brittle since this message
        // may or may not be dispatched intentionally
        // when the user cancels
        if ('programmaticKey' in messages[i]) {
          canceled = true;
        }
      }
      if (canceled) {
        return false;
      }
    }
  }

  private static async launchAuthWindow(): Promise<BrowserWindow> {
    const browserWindow = new BrowserWindow({
      modal: true,
      show: false,
      frame: false,
      transparent: true,
      width: 540,
      height: 475,
      webPreferences: { contextIsolation: true, nativeWindowOpen: true }
    });
    browserWindow.loadURL('https://www.luis.ai/home/subkey?callback=http://luis.ai');
    return new Promise<BrowserWindow>(resolve => {
      browserWindow.once('ready-to-show', () => resolve(browserWindow));
    });
  }
}
