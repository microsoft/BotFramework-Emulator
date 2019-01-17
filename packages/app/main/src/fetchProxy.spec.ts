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
import './fetchProxy';

let mockFetchArgs: { input: RequestInfo; init?: any };
jest.mock('node-fetch', () => {
  return async (input, init) => {
    mockFetchArgs = { input, init };
    return {
      ok: true,
      json: async () => ({}),
      text: async () => '{}',
    };
  };
});

describe('fetch proxy support', () => {
  it('should add the https-proxy-agent when the HTTPS_PROXY env var exists', async () => {
    process.env.HTTPS_PROXY = 'https://proxy';
    await fetch('https://some.api.com');
    expect(mockFetchArgs.init.agent).not.toBeNull();
  });

  it('should not add the https-proxy-agent when the HTTPS_PROXY env var exists but the NO_PROXY omits the url', () => {
    process.env.HTTPS_PROXY = 'https://proxy';
    process.env.NO_PROXY = 'localhost';
    fetch('https://localhost').catch();
    expect(mockFetchArgs.init).toBeUndefined();
  });

  it('should not add the http-proxy-agent when the HTTPS_PROXY is omitted', () => {
    delete process.env.HTTPS_PROXY;
    delete process.env.NO_PROXY;
    fetch('https://localhost').catch();
    expect(mockFetchArgs.init).toBeUndefined();
  });
});
