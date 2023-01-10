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

import '../fetchProxy';
import { fetchWithTimeout } from './fetchWithTimeout';

const tunnelResponseGeneric = (status: number, body: string) => {
  return {
    text: async () => body,
    status,
    headers: {},
  };
};

const mockTunnelStatusResponse = jest.fn(() => Promise.resolve(tunnelResponseGeneric(200, 'success')));

jest.mock('node-fetch', () => {
  return async () => {
    return mockTunnelStatusResponse();
  };
});

describe('fetch with timeout', () => {
  beforeEach(() => {
    jest.useRealTimers();
  });
  it('should return a response with status 200', async () => {
    jest.useFakeTimers();
    const result = await fetchWithTimeout('http://test.com', {});
    expect(result.status).toBe(200);
  });

  it('should throw an error if promise not resolved within the timeout specified', async () => {
    mockTunnelStatusResponse.mockImplementationOnce(() => {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve();
        }, 80000);
      });
    });
    jest.useFakeTimers();
    const ret = new Promise<void>(resolve => {
      fetchWithTimeout('http://test.com', {}, 40000)
        .then(() => {
          // Should not hit
          expect(true).toBeFalsy();
        })
        .catch(er => {
          expect(er).toBeDefined();
          resolve();
        });
    });
    jest.advanceTimersByTime(40001);
    return ret;
  });
});
