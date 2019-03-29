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
      history: ['http://someotherUrl', `https://dev.botframework.com/cb/#t=13&access_token=${mockArmToken}`],
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

    addListener(type: string, handler: () => void) {
      this.listeners.push({ type, handler });
      MockBrowserWindow.report('addListener', type, handler);
      if (type === 'page-title-updated') {
        [['http://someotherUrl'], [`http://localhost/#t=13&id_token=${mockArmToken}`]].forEach((url, index) => {
          const evt = new mockEvent('page-title-updated');
          (evt as any).sender = {
            history: [`http://localhost/#t=13&access_token=${mockArmToken}`],
          };
          setTimeout(() => {
            this.listeners.forEach(l => l.type === evt.type && l.handler(evt));
          }, 25 * index);
        });
      }
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
    /* eslint-disable typescript/camelcase */
    mockResponses = [
      { access_token: mockArmToken },
      { jwks_uri: 'http://localhost', keys: { find: () => ({}) } },
      {
        authorization_endpoint: 'http://localhost',
        jwks_uri: 'http://localhost',
        token_endpoint: 'http://localhost',
      },
    ];
    /* eslint-enable typescript/camelcase */
    (BrowserWindow as any).reporters = [];
  });

  it('should make the appropriate calls and receive the expected values with the "retrieveAuthToken"', async () => {
    const reportedValues = [];
    const reporter = v => reportedValues.push(v);
    (BrowserWindow as any).reporters.push(reporter);
    const it = AzureAuthWorkflowService.retrieveAuthToken(false);
    let value = undefined;
    let ct = 0;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const next = it.next(value);
      if (next.done) {
        break;
      }
      value = await next.value;
      if (!ct) {
        expect(value instanceof BrowserWindow).toBe(true);
        expect(reportedValues.length).toBe(3);
        const [, uri] = reportedValues[1];
        const idx = uri.indexOf('#');
        const parts = uri.substring(idx).split('&');
        [
          'response_type',
          'client_id',
          'redirect_uri',
          'state',
          'client-request-id',
          'nonce',
          'response_mode',
          'resource',
        ].forEach((part, index) => {
          expect(parts[index].includes(part));
        });
        reportedValues.length = 0;
      }

      if (ct === 1) {
        expect(value.access_token).toBe(mockArmToken);
        // Not sure if this is valuable or not.
        expect(reportedValues.length).toBe(3);
      }
      // Token validation
      if (ct === 2) {
        expect(value).toBe(true);
      }
      // Token delivery
      if (ct === 4) {
        expect(value.arm_token).toBe(mockArmToken);
      }
      ct++;
    }
    expect(ct).toBe(4);
  });
});
