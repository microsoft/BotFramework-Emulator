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

/* eslint-disable typescript/no-var-requires */
const base64url = require('base64url');
const getPem = require('rsa-pem-from-mod-exp');
/* eslint-enable typescript/no-var-requires */

export class OpenIdMetadata {
  private lastUpdated = 0;
  private keys: Key[];

  constructor(public fetch: any, public url: string) {}

  public async getKey(keyId: string) {
    // If keys are more than 5 days old, refresh them
    const now = new Date().getTime();

    if (this.lastUpdated < now - 1000 * 60 * 60 * 24 * 5) {
      try {
        await this.refreshCache();
      } catch {
        // Do nothing
      }
    }

    return this.findKey(keyId);
  }

  private async refreshCache() {
    const resp1 = await this.fetch(this.url);

    if (resp1.status >= 400) {
      throw new Error(`Failed to load openID config: ${resp1.statusCode}`);
    }

    const openIdConfig = (await resp1.json()) as OpenIdConfig;
    const resp2 = await this.fetch(openIdConfig.jwks_uri);

    if (resp2.status >= 400) {
      throw new Error(`Failed to load Keys: ${resp2.statusCode}`);
    }

    this.lastUpdated = new Date().getTime();
    this.keys = (await resp2.json()).keys as Key[];
  }

  private findKey(keyId: string): string {
    if (!this.keys) {
      return null;
    }

    for (let i = 0; i < this.keys.length; i++) {
      if (this.keys[i].kid === keyId) {
        const key = this.keys[i];

        if (!key.n || !key.e) {
          // Return null for non-RSA keys
          return null;
        }

        return getPem(base64url.toBase64(key.n), key.e);
      }
    }

    return null;
  }
}

interface OpenIdConfig {
  issuer: string;
  authorization_endpoint: string;
  jwks_uri: string;
  id_token_signing_alg_values_supported: string[];
  token_endpoint_auth_methods_supported: string[];
}

interface Key {
  kty: string;
  use: string;
  kid: string;
  x5t: string;
  n: string;
  e: string;
  x5c: string[];
}
