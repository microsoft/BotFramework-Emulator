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

import '../fetchProxy';
import { AzureAuthWorkflowService } from './azureAuthWorkflowService';

const mockEvent = Event; // this is silly but required by jest
const mockArmToken =
  'eyJhbGciOiJSU0EyNTYiLCJraWQiOiJmZGtqc2FoamdmIiwieDV0IjoiZiJ9.' +
  'eyJ1cG4iOiJnbGFzZ293QHNjb3RsYW5kLmNvbSJ9.' +
  '7gjdshgfdsk98458205jfds9843fjds';

jest.mock('jsonwebtoken', () => ({
  verify: () => true,
}));
let mockResponses;

jest.mock('node-fetch', () => {
  const fetch = (url, opts) => {
    return {
      ok: true,
      json: async () => mockResponses.pop(),
      text: async () => '{}',
    };
  };
  (fetch as any).Headers = class {};
  (fetch as any).Response = class {};
  return fetch;
});

jest.mock('rsa-pem-from-mod-exp', () => () => ({}));

jest.mock('electron', () => ({
  BrowserWindow: class MockBrowserWindow {
    public static reporters = [];
    public listeners = [] as any;
    public webContents = {
      on: (type: string, handler: () => void) => {
        this.listeners.push({ type, handler });
        MockBrowserWindow.report('webContents.on', type, handler);
        if (type === 'will-redirect') {
          [
            'http://someotherUrl',
            'http://someotherUrl/auth/v2',
            `https://dev.botframework.com/cb#t=13&access_token=${mockArmToken}`,
          ].forEach((url, index) => {
            const evt = new mockEvent('will-redirect');
            setTimeout(() => {
              this.listeners.forEach(l => l.type === evt.type && l.handler(evt, url));
            }, 25 * index);
          });
        }
      },
    };

    private static report(...args: any[]) {
      this.reporters.forEach(r => r(args));
    }

    constructor(...args: any[]) {
      MockBrowserWindow.report('constructor', ...args);
    }

    setMenu() {
      // no-op
    }

    removeMenu() {
      // no-op
    }

    addListener(type: string, handler: () => void) {
      this.listeners.push({ type, handler });
      MockBrowserWindow.report('addListener', type, handler);
    }

    once(type: string, handler: () => void) {
      this.listeners.push({ type, handler });
      MockBrowserWindow.report('once', type, handler);
    }

    dispatch(event: any) {
      this.listeners.forEach(l => l.type === event.type && l.handler(event));
      MockBrowserWindow.report('dispatch', event);
    }

    show() {
      MockBrowserWindow.report('show');
    }

    close() {
      MockBrowserWindow.report('hide');
    }

    loadURL(url: string) {
      MockBrowserWindow.report('loadURL', url);
      const evt = new mockEvent('ready-to-show');
      setTimeout(() => {
        this.listeners.forEach(l => l.type === evt.type && l.handler(evt));
      });
    }
  },
}));

describe('The azureAuthWorkflowService', () => {
  beforeEach(() => {
    mockResponses = [
      { access_token: mockArmToken },
      { jwks_uri: 'http://localhost', keys: { find: () => ({}) } },
      {
        authorization_endpoint: 'http://localhost',
        jwks_uri: 'http://localhost',
        token_endpoint: 'http://localhost',
      },
    ];
    (BrowserWindow as any).reporters = [];
  });

  it('should make the appropriate calls and receive the expected values with the "retrieveAuthToken"', async () => {
    const reportedValues = [];
    const reporter = v => reportedValues.push(v);
    (BrowserWindow as any).reporters.push(reporter);
    jest.spyOn(AzureAuthWorkflowService as any, 'validateJWT').mockResolvedValueOnce(true);
    const it = AzureAuthWorkflowService.retrieveAuthToken(false);
    let value: any;
    const yieldedValues: any[] = [];
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const next = it.next(value);
      if (next.done) {
        break;
      }
      value = await next.value;
      yieldedValues.push(value);
    }
    expect(yieldedValues).toMatchInlineSnapshot(`
      [
        {
          "authResponse": Promise {},
          "authWindow": MockBrowserWindow {
            "listeners": [
              {
                "handler": [Function],
                "type": "close",
              },
              {
                "handler": [Function],
                "type": "will-redirect",
              },
              {
                "handler": [Function],
                "type": "ready-to-show",
              },
            ],
            "webContents": {
              "on": [Function],
            },
          },
        },
        {
          "access_token": "eyJhbGciOiJSU0EyNTYiLCJraWQiOiJmZGtqc2FoamdmIiwieDV0IjoiZiJ9.eyJ1cG4iOiJnbGFzZ293QHNjb3RsYW5kLmNvbSJ9.7gjdshgfdsk98458205jfds9843fjds",
          "t": "13",
        },
        true,
        {
          "access_token": "eyJhbGciOiJSU0EyNTYiLCJraWQiOiJmZGtqc2FoamdmIiwieDV0IjoiZiJ9.eyJ1cG4iOiJnbGFzZ293QHNjb3RsYW5kLmNvbSJ9.7gjdshgfdsk98458205jfds9843fjds",
          "t": "13",
        },
      ]
    `);
  });
});
