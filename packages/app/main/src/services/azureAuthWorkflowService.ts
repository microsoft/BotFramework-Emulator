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
import * as jwt from 'jsonwebtoken';
import uuidv4 from 'uuid/v4';

// eslint-disable-next-line typescript/no-var-requires
const getPem = require('rsa-pem-from-mod-exp');

const clientId = 'f3723d34-6ff5-4ceb-a148-d99dcd2511fc';
const replyUrl = 'https://dev.botframework.com/cb';
const authorizationEndpoint = 'https://login.microsoftonline.com/common/oauth2/authorize';

declare interface Config {
  authorization_endpoint: string;
  jwks_uri: string;
  token_endpoint: string;
}
declare interface AuthResponse {
  code: string;
  access_token: string;
  state: string;
  session_state: string;
  error?: string;
}
declare interface Jwks {
  keys: { x5t: string; n: string; e: string; x5c: string[] }[];
}

export class AzureAuthWorkflowService {
  private static config: Config;
  private static jwks: Jwks;

  public static *retrieveAuthToken(renew: boolean = false): IterableIterator<any> {
    const authWindow = yield this.launchAuthWindow(renew);
    if (!renew) {
      authWindow.show();
    }
    const result = yield this.waitForAuthResult(authWindow, replyUrl);
    authWindow.close();
    if (result.error) {
      return false;
    }
    const valid = yield this.validateJWT(result.access_token);
    if (!valid) {
      result.error = 'Invalid Token';
    }
    if (result.error) {
      return false;
    }
    yield result;
  }

  private static async waitForAuthResult(browserWindow: BrowserWindow, redirectUri: string): Promise<AuthResponse> {
    const response = await new Promise<AuthResponse>(resolve => {
      // eslint-disable-next-line prefer-const
      let interval;
      const poller = () => {
        let uri: string;
        // eslint-disable-next-line typescript/no-object-literal-type-assertion
        const result: AuthResponse = {} as AuthResponse;
        try {
          const { history = [] }: { history: string[] } = browserWindow.webContents as any;
          uri = history[history.length - 1] || '';
        } catch (e) {
          clearInterval(interval);
          result.error = e.message;
          resolve(result);
        }
        if (!(uri || '').toLowerCase().startsWith(redirectUri.toLowerCase())) {
          return;
        }
        const idx = uri.indexOf('#');
        const values = uri.substring(idx + 1).split('&');
        const len = values.length;
        for (let i = 0; i < len; i++) {
          const [key, value] = values[i].split(/[=]/);
          result[key] = value;
        }
        clearInterval(interval);
        resolve(result);
      };
      browserWindow.addListener('close', () =>
        // eslint-disable-next-line typescript/no-object-literal-type-assertion
        resolve({ error: 'canceled' } as AuthResponse)
      );
      browserWindow.addListener('page-title-updated', poller);
      interval = setInterval(poller, 500); // Backup if everything else fails
    });

    if (response.error) {
      return response;
    }

    const isValid = await this.validateJWT(response.access_token);
    if (!isValid) {
      response.error = 'Invalid token';
    }
    return response;
  }

  private static async launchAuthWindow(renew: boolean): Promise<BrowserWindow> {
    const browserWindow = new BrowserWindow({
      modal: true,
      show: false,
      frame: true,
      transparent: false,
      alwaysOnTop: true,
      width: 490,
      height: 366,
      webPreferences: { contextIsolation: true, nativeWindowOpen: true },
    });

    browserWindow.setMenu(null);

    const state = uuidv4();
    const requestId = uuidv4();
    const nonce = uuidv4();
    const bits = [
      `${authorizationEndpoint}?response_type=token`,
      `client_id=${clientId}`,
      `redirect_uri=${replyUrl}}`,
      `state=${state}`,
      `client-request-id=${requestId}`,
      `nonce=${nonce}`,
      'response_mode=fragment',
      'resource=https://management.core.windows.net/',
    ];

    if (renew) {
      bits.push('prompt=none');
    }

    const url = bits.join('&');
    browserWindow.loadURL(url);
    return new Promise<BrowserWindow>(resolve => {
      browserWindow.once('ready-to-show', () => resolve(browserWindow));
    });
  }

  private static async getConfig(): Promise<Config> {
    if (this.config) {
      return this.config;
    }
    const configUrl = 'https://login.microsoftonline.com/common/.well-known/openid-configuration';
    const configResponse = await fetch(configUrl);
    this.config = await configResponse.json();
    return this.config;
  }

  private static async getJwks(): Promise<Jwks> {
    if (this.jwks) {
      return this.jwks;
    }
    // eslint-disable-next-line typescript/camelcase
    const { jwks_uri } = await this.getConfig();
    const jwksResponse = await fetch(jwks_uri);
    this.jwks = await jwksResponse.json();
    return this.jwks;
  }

  private static async validateJWT(token: string): Promise<boolean> {
    const [header] = token.split('.');
    const headers: { alg: string; kid: string; x5t: string } = JSON.parse(Buffer.from(header, 'base64').toString());

    try {
      const jwks = await this.getJwks();
      const jwk = jwks.keys.find(key => key.x5t === headers.x5t);
      jwt.verify(token, getPem(jwk.n, jwk.e));
      return true;
    } catch (e) {
      return false;
    }
  }
}
