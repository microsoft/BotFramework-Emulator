import events = require('events');
import request = require('request');
import async = require('async');
import url = require('url');
import http = require('http');
var getPem = require('rsa-pem-from-mod-exp');
var base64url = require('base64url');

export class OpenIdMetadata {
    private url: string;
    private lastUpdated = 0;
    private keys: IKey[];

    constructor(url: string) {
        this.url = url;
    }

    public getKey(keyId: string, cb: (key: string) => void): void {
        // If keys are more than 5 days old, refresh them
        var now = new Date().getTime();
        if (this.lastUpdated < (now - 1000*60*60*24*5)) {
            this.refreshCache((err) => {
                if (err) {
                    // fall through and return cached key on error
                }

                // Search the cache even if we failed to refresh
                var key = this.findKey(keyId);
                cb(key);
            });
        } else {
            // Otherwise read from cache
            var key = this.findKey(keyId);
            cb(key);
        }
    }

    private refreshCache(cb: (err: Error) => void): void {
        var options: request.Options = {
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
                var openIdConfig = <IOpenIdConfig> body;

                var options: request.Options = {
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
                        this.keys = <IKey[]> body.keys;
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

        for (var i = 0; i < this.keys.length; i++) {
            if (this.keys[i].kid == keyId) {
                var key = this.keys[i];

                if (!key.n || !key.e) {
                    // Return null for non-RSA keys
                    return null;
                }

                var modulus = base64url.toBase64(key.n);
                var exponent = key.e;

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
