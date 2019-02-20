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

import { authentication, usGovernmentAuthentication } from '../authEndpoints';

import BotEndpoint from './botEndpoint';

describe('BotEndpoint', () => {
  it('should return the speech token if it already exists', async () => {
    const endpoint = new BotEndpoint();
    endpoint.speechToken = 'someToken';
    const refresh = false;
    const token = await endpoint.getSpeechToken(refresh);
    expect(token).toBe('someToken');
  });

  it('should throw if there is no msa app id or password', async () => {
    const endpoint = new BotEndpoint();
    try {
      await endpoint.getSpeechToken();
    } catch (e) {
      expect(e).toEqual(new Error('bot must have Microsoft App ID and password'));
    }
  });

  it('should return a speech token', async () => {
    /* eslint-disable typescript/camelcase */
    const mockResponse = {
      json: async () => Promise.resolve({ access_Token: 'someSpeechToken' }),
      status: 200,
    };
    const mockFetchWithAuth = jest.fn(() => Promise.resolve(mockResponse));
    const endpoint = new BotEndpoint('', '', '', 'msaAppId', 'msaAppPw');
    endpoint.fetchWithAuth = mockFetchWithAuth;
    const token = await endpoint.getSpeechToken();
    expect(token).toBe('someSpeechToken');
  });

  it('should throw if there is no access_Token in the response', async () => {
    /* eslint-disable typescript/camelcase */

    // with error in response body
    let mockResponse: any = {
      json: async () => Promise.resolve({ error: 'someError' }),
      status: 200,
    };
    const mockFetchWithAuth = jest.fn(() => Promise.resolve(mockResponse));
    const endpoint = new BotEndpoint('', '', '', 'msaAppId', 'msaAppPw');
    endpoint.fetchWithAuth = mockFetchWithAuth;
    try {
      await endpoint.getSpeechToken();
    } catch (e) {
      expect(e).toEqual(new Error('someError'));
    }

    // with no error in response body
    mockResponse = {
      json: async () => Promise.resolve({}),
      status: 200,
    };
    try {
      await endpoint.getSpeechToken();
    } catch (e) {
      expect(e).toEqual(new Error('could not retrieve speech token'));
    }
  });

  it('should throw if the call to the speech service returns a 401', async () => {
    /* eslint-disable typescript/camelcase */
    const mockResponse: any = {
      status: 401,
    };
    const mockFetchWithAuth = jest.fn(() => Promise.resolve(mockResponse));
    const endpoint = new BotEndpoint('', '', '', 'msaAppId', 'msaAppPw');
    endpoint.fetchWithAuth = mockFetchWithAuth;
    try {
      await endpoint.getSpeechToken();
    } catch (e) {
      expect(e).toEqual(new Error('not authorized to use Cognitive Services Speech API'));
    }
  });

  it('should throw if the call to the speech service returns a non-200', async () => {
    /* eslint-disable typescript/camelcase */
    const mockResponse: any = {
      status: 500,
    };
    const mockFetchWithAuth = jest.fn(() => Promise.resolve(mockResponse));
    const endpoint = new BotEndpoint('', '', '', 'msaAppId', 'msaAppPw');
    endpoint.fetchWithAuth = mockFetchWithAuth;
    try {
      await endpoint.getSpeechToken();
    } catch (e) {
      expect(e).toEqual(new Error('cannot retrieve speech token'));
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
    const msaPw = 'someAppPw';
    endpoint.msaAppId = msaAppId;
    endpoint.msaPassword = msaPw;
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
    expect(endpoint.accessTokenExpires).toEqual(jasmine.any(Number));
    expect(mockFetch).toHaveBeenCalledWith(authentication.tokenEndpoint, {
      method: 'POST',
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: msaAppId,
        client_secret: msaPw,
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
    expect(endpoint.accessTokenExpires).toEqual(jasmine.any(Number));
    expect(mockFetch).toHaveBeenCalledWith(usGovernmentAuthentication.tokenEndpoint, {
      method: 'POST',
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: msaAppId,
        client_secret: msaPw,
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
    const msaPw = 'someAppPw';
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
      const response = await (endpoint as any).getAccessToken();
    } catch (e) {
      expect(e).toEqual(new Error('Refresh access token failed with status code: 404'));
    }
  });
});
