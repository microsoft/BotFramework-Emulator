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

import { EndpointSet } from '../../state/endpointSet';

import { createGetBotEndpointMiddleware } from './getBotEndpoint';

describe('The getBotEndpoint', () => {
  const mockServerState = {
    endpoints: {},
  } as any;

  const mockNext = function() {
    return null;
  };
  mockNext.ifError = function() {
    return null;
  };

  beforeEach(() => {
    mockServerState.endpoints = new EndpointSet(() => null);
  });

  it('should append the bot endpoint to the request when an Authorization header is present', () => {
    const mockToken = 'bm90aGluZw.eyJ1cG4iOiJnbGFzZ293QHNjb3RsYW5kLmNvbSJ9.7gjdshgfdsk98458205jfds9843fjds';
    const mockEndpoint = { id: mockToken } as any;
    const mockReq = {
      header: () => `Bearer ${mockToken}`,
    } as any;

    mockServerState.endpoints.set(mockToken, mockEndpoint);

    const route = createGetBotEndpointMiddleware(mockServerState as any);
    route(mockReq as any, {} as any, mockNext);

    expect(mockReq.botEndpoint.id).toBe(mockEndpoint.id);
  });

  it('should append the default endpoint when no auth header is preset', () => {
    const mockEndpoint = { id: '123' } as any;
    mockServerState.endpoints.set('123', mockEndpoint);

    const mockReq = {
      header: () => '',
    } as any;

    const route = createGetBotEndpointMiddleware(mockServerState as any);
    route(mockReq, {} as any, mockNext);

    expect(mockReq.botEndpoint.id).toBe(mockEndpoint.id);
  });
});
