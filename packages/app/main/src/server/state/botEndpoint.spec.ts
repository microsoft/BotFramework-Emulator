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

import { URLSearchParams } from 'url';

import { authentication, usGovernmentAuthentication } from '../constants/authEndpoints';

import { BotEndpoint } from './botEndpoint';

describe('BotEndpoint', () => {
  it('should determine whether a token will expire within a time period', () => {
    const endpoint = new BotEndpoint();
    const currentTime = Date.now();
    endpoint.speechAuthenticationToken = {
      expireAt: currentTime + 100, // 100 ms in the future
    } as any;

    expect((endpoint as any).willTokenExpireWithin(5000)).toBe(true);
  });

  it('should return the speech token if it already exists', async () => {
    const endpoint = new BotEndpoint('', '', '', 'msaAppId', 'msaAppPw');
    endpoint.speechAuthenticationToken = {
      accessToken: 'MOCK_TEST_SECRET',
      region: 'westus2',
      expireAt: Date.now() + 10 * 1000 * 60, // expires in 10 minutes
      tokenLife: 10 * 1000 * 60, // token life of 10 minutes
    };
    const refresh = false;
    const token = await endpoint.getSpeechToken(refresh);
    expect(token).toBe('MOCK_TEST_SECRET');
  });

  it('should return a new speech token if the current token is expired', async () => {
    const endpoint = new BotEndpoint('', '', '', 'msaAppId', 'msaAppPw');
    endpoint.speechAuthenticationToken = {
      expireAt: Date.now() - 5000,
    } as any;
    jest.spyOn(endpoint as any, 'fetchSpeechToken').mockResolvedValueOnce('new speech token');
    const token = await endpoint.getSpeechToken();

    expect(token).toBe('new speech token');
  });

  it('should return a new speech token if the current token is past its half life', async () => {
    const endpoint = new BotEndpoint('', '', '', 'msaAppId', 'msaAppPw');
    endpoint.speechAuthenticationToken = {
      expireAt: Date.now() + 4 * 1000 * 60, // expires in 4 minutes
      tokenLife: 10 * 1000 * 60, // token life of 10 minutes
    } as any;
    jest.spyOn(endpoint as any, 'fetchSpeechToken').mockResolvedValueOnce('new speech token');
    const token = await endpoint.getSpeechToken();

    expect(token).toBe('new speech token');
  });

  it('should return a new speech token if there is no existing token or if the refresh flag is true', async () => {
    const endpoint = new BotEndpoint('', '', '', 'msaAppId', 'msaAppPw');
    jest.spyOn(endpoint as any, 'fetchSpeechToken').mockResolvedValueOnce('new speech token');
    const token = await endpoint.getSpeechToken(true);

    expect(token).toBe('new speech token');
  });

  it('should throw if there is no msa app id or password', async () => {
    const endpoint = new BotEndpoint();
    try {
      await endpoint.getSpeechToken();
    } catch (e) {
      expect(e).toEqual(new Error('Bot must have a valid Microsoft App ID and password'));
    }
  });

  it('should fetch a speech token', async () => {
    const endpoint = new BotEndpoint();
    jest.spyOn(endpoint as any, 'fetchWithAuth').mockResolvedValueOnce({
      json: () =>
        Promise.resolve({
          access_Token: 'MOCK_TEST_SECRET',
          region: 'westus2',
          expireAt: 1234,
          tokenLife: 9999,
        }),
      status: 200,
    });
    const token = await (endpoint as any).fetchSpeechToken();

    expect(token).toBe('MOCK_TEST_SECRET');
  });

  it('should throw when failing to read the token response', async () => {
    const endpoint = new BotEndpoint();
    jest.spyOn(endpoint as any, 'fetchWithAuth').mockResolvedValueOnce({
      json: async () => Promise.reject(new Error('Malformed response JSON.')),
      status: 200,
    });

    try {
      await (endpoint as any).fetchSpeechToken();
      expect(false).toBe(true); // make sure catch is hit
    } catch (e) {
      expect(e).toEqual(new Error(`Couldn't read speech token response: ${new Error('Malformed response JSON.')}`));
    }
  });

  it(`should throw when the token response doesn't contain a token and has an error attached`, async () => {
    const endpoint = new BotEndpoint();
    jest.spyOn(endpoint as any, 'fetchWithAuth').mockResolvedValueOnce({
      json: () => Promise.resolve({ error: 'Token was lost in transit.' }),
      status: 200,
    });

    try {
      await (endpoint as any).fetchSpeechToken();
      expect(false).toBe(true); // make sure catch is hit
    } catch (e) {
      expect(e).toEqual(new Error('Token was lost in transit.'));
    }
  });

  it(`should throw when the token response doesn't contain a token nor an error`, async () => {
    const endpoint = new BotEndpoint();
    jest.spyOn(endpoint as any, 'fetchWithAuth').mockResolvedValueOnce({
      json: () => Promise.resolve({}),
      status: 200,
    });

    try {
      await (endpoint as any).fetchSpeechToken();
      expect(false).toBe(true); // make sure catch is hit
    } catch (e) {
      expect(e).toEqual(new Error('Could not retrieve speech token'));
    }
  });

  it(`should throw when the token endpoint returns a 401`, async () => {
    const endpoint = new BotEndpoint();
    jest.spyOn(endpoint as any, 'fetchWithAuth').mockResolvedValueOnce({
      status: 401,
    });

    try {
      await (endpoint as any).fetchSpeechToken();
      expect(false).toBe(true); // make sure catch is hit
    } catch (e) {
      expect(e).toEqual(new Error('Not authorized to use Cognitive Services Speech API'));
    }
  });

  it(`should throw when the token endpoint returns an error response that is not a 401`, async () => {
    const endpoint = new BotEndpoint();
    jest.spyOn(endpoint as any, 'fetchWithAuth').mockResolvedValueOnce({
      status: 500,
    });

    try {
      await (endpoint as any).fetchSpeechToken();
      expect(false).toBe(true); // make sure catch is hit
    } catch (e) {
      expect(e).toEqual(new Error(`Can't retrieve speech token`));
    }
  });

  it('should fetch with auth', async () => {
    const endpoint = new BotEndpoint();
    endpoint.msaAppId = 'someAppId';
    const mockGetAccessToken = jest.fn(() => Promise.resolve('someAccessToken'));
    (endpoint as any).getAccessToken = mockGetAccessToken;
    const mockResponse = 'I am a response!';
    const mockFetch = jest.fn(() => Promise.resolve(mockResponse));
    (endpoint as any)._options = { fetch: mockFetch };
    const response = await endpoint.fetchWithAuth('someUrl');

    expect(response).toBe('I am a response!');
    expect(mockGetAccessToken).toHaveBeenCalledWith(false);
    expect(mockFetch).toHaveBeenCalledWith('someUrl', { headers: { Authorization: 'Bearer someAccessToken' } });
  });

  it('should retry fetching with a refreshed auth token if the fetch returns a 401', async () => {
    const endpoint = new BotEndpoint();
    endpoint.msaAppId = 'someAppId';
    const mockGetAccessToken = jest.fn(() => Promise.resolve('someAccessToken'));
    (endpoint as any).getAccessToken = mockGetAccessToken;
    const mockResponse = 'I am a response!';
    const mockFetch = jest
      .fn()
      .mockImplementationOnce(() => Promise.resolve({ status: 401 }))
      .mockImplementationOnce(() => Promise.resolve(mockResponse));
    (endpoint as any)._options = { fetch: mockFetch };
    const response = await endpoint.fetchWithAuth('someUrl');

    expect(response).toBe('I am a response!');
    expect(mockGetAccessToken).toHaveBeenCalledTimes(2);
    expect(mockGetAccessToken).toHaveBeenCalledWith(true); // forceRefresh will be true on second attempt
  });

  it('should retry fetching with a refreshed auth token if the fetch returns a 403', async () => {
    const endpoint = new BotEndpoint();
    endpoint.msaAppId = 'someAppId';
    const mockGetAccessToken = jest.fn(() => Promise.resolve('someAccessToken'));
    (endpoint as any).getAccessToken = mockGetAccessToken;
    const mockResponse = 'I am a response!';
    const mockFetch = jest
      .fn()
      .mockImplementationOnce(() => Promise.resolve({ status: 403 }))
      .mockImplementationOnce(() => Promise.resolve(mockResponse));
    (endpoint as any)._options = { fetch: mockFetch };
    const response = await endpoint.fetchWithAuth('someUrl');

    expect(response).toBe('I am a response!');
    expect(mockGetAccessToken).toHaveBeenCalledTimes(2);
    expect(mockGetAccessToken).toHaveBeenCalledWith(true); // forceRefresh will be true on second attempt
  });

  it('should return the access token if it already exists and has not expired yet', async () => {
    const endpoint = new BotEndpoint();
    const msaAppId = 'someAppId';
    endpoint.msaAppId = msaAppId;
    endpoint.msaPassword = 'MOCK_TEST_SECRET';
    endpoint.use10Tokens = false;
    endpoint.channelService = undefined;
    // ensure that the token won't be expired
    const tokenRefreshTime = 5 * 60 * 1000;
    const accessTokenExpires = Date.now() * 2 + tokenRefreshTime;
    endpoint.accessTokenExpires = accessTokenExpires;
    // using non-v1.0 token & standard endpoint
    const mockOauthResponse = { access_token: 'I am an access token!', expires_in: 10 };
    const mockResponse = { json: jest.fn(() => Promise.resolve(mockOauthResponse)), status: 200 };
    const mockFetch = jest.fn(() => Promise.resolve(mockResponse));
    (endpoint as any)._options = { fetch: mockFetch };
    let response = await (endpoint as any).getAccessToken();

    expect(response).toBe('I am an access token!');
    expect(endpoint.accessToken).toBe('I am an access token!');
    expect(endpoint.accessTokenExpires).not.toEqual(accessTokenExpires);
    expect(endpoint.accessTokenExpires).toEqual(expect.any(Number));
    expect(mockFetch).toHaveBeenCalledWith(authentication.tokenEndpoint, {
      method: 'POST',
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: msaAppId,
        client_secret: 'MOCK_TEST_SECRET',
        scope: `${msaAppId}/.default`,
      } as { [key: string]: string }).toString(),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    // using v1.0 token & government endpoint
    endpoint.use10Tokens = true;
    endpoint.channelService = usGovernmentAuthentication.channelService;
    response = await (endpoint as any).getAccessToken();

    expect(response).toBe('I am an access token!');
    expect(endpoint.accessToken).toBe('I am an access token!');
    expect(endpoint.accessTokenExpires).not.toEqual(accessTokenExpires);
    expect(endpoint.accessTokenExpires).toEqual(expect.any(Number));
    expect(mockFetch).toHaveBeenCalledWith(usGovernmentAuthentication.tokenEndpoint, {
      method: 'POST',
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: msaAppId,
        client_secret: 'MOCK_TEST_SECRET',
        scope: `${msaAppId}/.default`,
        atver: '1',
      } as { [key: string]: string }).toString(),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  });

  it('should throw when requesting an access returns a bad response', async () => {
    const endpoint = new BotEndpoint();
    const msaAppId = 'someAppId';
    const msaPw = 'MOCK_TEST_SECRET';
    endpoint.msaAppId = msaAppId;
    endpoint.msaPassword = msaPw;
    endpoint.use10Tokens = false;
    endpoint.channelService = undefined;
    // ensure that the token won't be expired
    const tokenRefreshTime = 5 * 60 * 1000;
    const accessTokenExpires = Date.now() * 2 + tokenRefreshTime;
    endpoint.accessTokenExpires = accessTokenExpires;
    const mockResponse = { status: 404 };
    const mockFetch = jest.fn(() => Promise.resolve(mockResponse));
    (endpoint as any)._options = { fetch: mockFetch };

    try {
      await (endpoint as any).getAccessToken();
      expect(false).toBe(true); // make sure catch is hit
    } catch (e) {
      expect(e).toEqual({ body: undefined, message: 'Refresh access token failed with status code: 404', status: 404 });
    }
  });
});
