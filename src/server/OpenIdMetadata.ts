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

import events = require('events');
import request = require('request');
import async = require('async');
import url = require('url');
import http = require('http');
let getPem = require('rsa-pem-from-mod-exp');
let base64url = require('base64url');


export class OpenIdMetadata {
    private url: string;
    private lastUpdated = 0;
    private keys: IKey[];

    constructor(url: string) {
        this.url = url;
    }

    public getKey(keyId: string, cb: (key: string) => void): void {
        // If keys are more than 5 days old, refresh them
        let now = new Date().getTime();
        if (this.lastUpdated < (now - 1000 * 60 * 60 * 24 * 5)) {
            this.refreshCache((err) => {
                if (err) {
                    // fall through and return cached key on error
                }

                // Search the cache even if we failed to refresh
                let key = this.findKey(keyId);
                cb(key);
            });
        } else {
            // Otherwise read from cache
            let key = this.findKey(keyId);
            cb(key);
        }
    }

    private refreshCache(cb: (err: Error) => void): void {
        let options: request.Options = {
            method: 'GET',
            url: this.url,
            json: true
        };

        request(options, (err, response, body) => {
            if (!err && (response.statusCode >= 400 || !body)) {
                err = new Error('Failed to load openID config: ' + response.statusCode);
            }

            if (err) {
                cb(err);
            } else {
                let openIdConfig = <IOpenIdConfig>body;

                let options: request.Options = {
                    method: 'GET',
                    url: openIdConfig.jwks_uri,
                    json: true
                };

                request(options, (err, response, body) => {
                    if (!err && (response.statusCode >= 400 || !body)) {
                        err = new Error("Failed to load Keys: " + response.statusCode);
                    }

                    if (!err) {
                        this.lastUpdated = new Date().getTime();
                        this.keys = <IKey[]>body.keys;
                    }

                    cb(err);
                });
            }
        });
    }

    private findKey(keyId: string): string {
        if (!this.keys) {
            return null;
        }

        for (let i = 0; i < this.keys.length; i++) {
            if (this.keys[i].kid == keyId) {
                let key = this.keys[i];

                if (!key.n || !key.e) {
                    // Return null for non-RSA keys
                    return null;
                }

                let modulus = base64url.toBase64(key.n);
                let exponent = key.e;

                return getPem(modulus, exponent);
            }
        }

        return null;
    }
}

interface IOpenIdConfig {
    issuer: string;
    authorization_endpoint: string;
    jwks_uri: string;
    id_token_signing_alg_values_supported: string[];
    token_endpoint_auth_methods_supported: string[];
}

interface IKey {
    kty: string;
    use: string;
    kid: string;
    x5t: string;
    n: string;
    e: string;
    x5c: string[];
}
