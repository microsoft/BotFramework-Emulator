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
import * as uuidv3 from 'uuid/v3';
import * as uuidv4 from 'uuid/v4';

declare type AzureAuthWorkflowType = IterableIterator<Promise<BrowserWindow> | Promise<{ armToken: string } | boolean>>;

export class AzureAuthWorkflowService {

  public static* enterAuthWorkflow(): AzureAuthWorkflowType {
    const authWindow = yield AzureAuthWorkflowService.launchAuthWindow();
    authWindow.show();
    let result = yield AzureAuthWorkflowService.waitForDataFromWindow(authWindow);
    authWindow.close();
    yield result;
  }

  private static async waitForDataFromWindow(browserWindow: BrowserWindow): Promise<{ armToken: string } | false> {
    let canceled = false;
    browserWindow.addListener('close', () => canceled = true);

    const script = `
      (function(window) {
        if (window.location.hash) {
          return Promise.resolve(window.location.hash);
        }
        return new Promise(resolve => {
          const idTokenHandler = () => {
            if (window.location.hash.includes('id_token')) {
              resolve(window.location.hash);
            }
          }
          window.addEventListener('hashchange', idTokenHandler);
          setTimeout(resolve.bind(null, 'waiting'), 500);
        });
      })(window);
    `;
    while (true) {
      let response = await browserWindow.webContents.executeJavaScript(script);

      if (canceled) {
        return false;
      }

      if (response === 'waiting') {
        continue;
      }
      const values = response.split('&');
      let len = values.length;
      for (let i = 0; i < len; i++) {
        const [key, value] = values[i].split(/[=]/);
        if (key.includes('id_token')) {
          return { armToken: value };
        }
        if (key.includes('error')) {
          return false;
        }
      }
    }
  }

  private static async launchAuthWindow(): Promise<BrowserWindow> {
    const browserWindow = new BrowserWindow({
      modal: true,
      show: false,
      frame: false,
      transparent: true,
      width: 500,
      height: 550,
      webPreferences: { contextIsolation: true, nativeWindowOpen: true }
    });
    const clientId = '4f28e5eb-6b7f-49e6-ac0e-f992b622da57';
    const redirectUri = 'http://localhost:3000/botframework-emulator';
    const state = uuidv4();
    const requestId = uuidv4();
    const nonce = uuidv3('https://github.com/Microsoft/BotFramework-Emulator', uuidv3.URL);
    const bits = [
      'https://login.microsoftonline.com/common/oauth2/authorize?response_type=id_token',
      `client_id=${clientId}`,
      `redirect_uri=${redirectUri}`,
      `state=${state}`,
      `client-request-id=${requestId}`,
      'x-client-SKU=Js',
      'x-client-Ver=1.0.17',
      `nonce=${nonce}`
    ];
    const url = bits.join('&');
    browserWindow.loadURL(url);
    return new Promise<BrowserWindow>(resolve => {
      browserWindow.once('ready-to-show', () => resolve(browserWindow));
    });
  }
}
