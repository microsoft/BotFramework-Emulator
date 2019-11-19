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

import { OpenIdMetadata } from './openIdMetadata';

jest.mock('base64url', () => ({
  toBase64: jest.fn(value => `${value}_base64`),
}));
jest.mock('rsa-pem-from-mod-exp', () => jest.fn((n, e) => `${n}_${e}_pem`));

describe('OpenIdMetadata', () => {
  it('should get a key and refresh cache if last updated more than 5 days ago', async () => {
    const mockRefreshCache = jest.fn(() => Promise.resolve());
    const mockFindKey = jest.fn(() => 'someKey');
    const openIdMetadata = new OpenIdMetadata(null, null);
    // ensure that the last time the keys were updated was more than 5 days ago
    const lastUpdated = new Date().getTime() - 1000 * 60 * 60 * 24 * 6;
    (openIdMetadata as any).lastUpdated = lastUpdated;
    (openIdMetadata as any).refreshCache = mockRefreshCache;
    (openIdMetadata as any).findKey = mockFindKey;
    const key = await openIdMetadata.getKey('someKeyId');

    expect(mockRefreshCache).toHaveBeenCalled();
    expect(mockFindKey).toHaveBeenCalledWith('someKeyId');
    expect(key).toBe('someKey');
  });

  it('should refresh the cache', async () => {
    /* eslint-disable typescript/camelcase */
    const mockFetch = jest
      .fn()
      // getting the openId config (resp1)
      .mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue({ jwks_uri: 'someJwksUri' }),
      })
      // getting the keys (resp2)
      .mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue({ keys: ['key1', 'key2', 'key3'] }),
      });
    const timeBeforeRefresh = new Date().getTime() - 1000;
    const openIdMetadata = new OpenIdMetadata(mockFetch, 'someUrl');
    await (openIdMetadata as any).refreshCache();

    expect(mockFetch).toHaveBeenCalledWith('someUrl');
    expect(mockFetch).toHaveBeenCalledWith('someJwksUri');
    expect((openIdMetadata as any).lastUpdated).toBeGreaterThan(timeBeforeRefresh);
    expect((openIdMetadata as any).keys).toEqual(['key1', 'key2', 'key3']);
  });

  it('should throw when failing to get the openId config during a cache refresh', async () => {
    // getting the openId config (resp1)
    const mockFetch = jest.fn().mockResolvedValueOnce({ status: 401, statusCode: 401 });
    const openIdMetadata = new OpenIdMetadata(mockFetch, 'someUrl');

    await expect((openIdMetadata as any).refreshCache()).rejects.toThrowError('Failed to load openID config: 401');
  });

  it('should throw when failing to get the keys during a cache refresh', async () => {
    /* eslint-disable typescript/camelcase */
    const mockFetch = jest
      .fn()
      // getting the openId config (resp1)
      .mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue({ jwks_uri: 'someJwksUri' }),
      })
      // getting the keys (resp2)
      .mockResolvedValueOnce({
        status: 404,
        statusCode: 404,
      });
    const openIdMetadata = new OpenIdMetadata(mockFetch, 'someUrl');

    await expect((openIdMetadata as any).refreshCache()).rejects.toThrowError('Failed to load Keys: 404');
  });

  it('should find a key', () => {
    const keyId = 'someKeyId';
    const openIdMetadata = new OpenIdMetadata(null, null);
    const key = {
      kid: keyId,
      n: 'someN',
      e: 'someE',
    };
    (openIdMetadata as any).keys = [key];
    const retrievedKey = (openIdMetadata as any).findKey(keyId);
    expect(retrievedKey).toBe('someN_base64_someE_pem');
  });

  it('should return null when trying to find keys if the keys array is undefined', () => {
    const openIdMetadata = new OpenIdMetadata(null, null);
    (openIdMetadata as any).keys = undefined;
    expect((openIdMetadata as any).findKey('someKeyId')).toBe(null);
  });

  it('should return null when trying to find a non-RSA key', () => {
    const keyId1 = 'someKeyId1';
    const keyId2 = 'someKeyId2';
    const openIdMetadata = new OpenIdMetadata(null, null);
    const key1 = {
      kid: keyId1,
      n: 'someN',
    };
    const key2 = {
      kid: keyId2,
      e: 'someE',
    };
    (openIdMetadata as any).keys = [key1, key2];
    // no e
    const retrievedKey1 = (openIdMetadata as any).findKey(keyId1);

    expect(retrievedKey1).toBe(null);

    // no n
    const retrievedKey2 = (openIdMetadata as any).findKey(keyId2);

    expect(retrievedKey2).toBe(null);
  });

  it('should return null if it cannot find the specified key', () => {
    const openIdMetadata = new OpenIdMetadata(null, null);
    (openIdMetadata as any).keys = [];
    expect((openIdMetadata as any).findKey('someKeyId')).toBe(null);
  });
});
