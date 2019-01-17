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

import {
  ConversationService,
  headers as headersInstance,
} from './conversationService';
let mockFetchArgs: MockFetch;

jest.mock('node-fetch', () => {
  const fetch = (url, opts) => {
    mockFetchArgs = { url, opts };
    return {
      ok: true,
      json: async () => ({}),
      text: async () => '{}',
    };
  };
  (fetch as any).Headers = class {};
  (fetch as any).Response = class {};
  return fetch;
});

interface MockOpts {
  headers: Headers;
  method: 'GET' | 'DELETE' | 'POST';
  body?: any;
}

interface MockFetch {
  url?: string;
  opts?: MockOpts;
}

describe('The ConversationService should call "fetch" with the expected parameters when executing', () => {
  test('the "addUser" function', () => {
    ConversationService.addUser('http://localhost', 'abcdef');
    const { url, opts } = mockFetchArgs;
    expect(url).toBe('http://localhost/emulator/abcdef/users');

    const { body, headers, method } = opts;
    expect(headers === headers).toBeTruthy();
    expect(method).toBe('POST');
    const members = JSON.parse(body);
    expect(members[0].name).toBeFalsy();
    expect(members[0].id).toBeFalsy();
    expect(headersInstance).toEqual(headers);
  });

  test('the "removeUser" function', () => {
    ConversationService.removeUser('http://localhost', 'abcdef', '1234');
    const { url, opts } = mockFetchArgs;
    expect(url).toBe('http://localhost/emulator/abcdef/users');

    const { body, headers, method } = opts;
    expect(headers === headers).toBeTruthy();
    expect(method).toBe('DELETE');
    const users = JSON.parse(body);
    expect(users[0].id).toBe('1234');
    expect(headersInstance).toEqual(headers);
  });

  test('the "removeRandomUser" function', () => {
    ConversationService.removeRandomUser('http://localhost', 'abcdef');
    const { url, opts } = mockFetchArgs;
    expect(url).toBe('http://localhost/emulator/abcdef/users');

    const { body, headers, method } = opts;
    expect(headers === headers).toBeTruthy();
    expect(method).toBe('DELETE');
    expect(body).toBeFalsy();
    expect(headersInstance).toEqual(headers);
  });

  test('the "botContactAdded" function', () => {
    ConversationService.botContactAdded('http://localhost', 'abcdef');
    const { url, opts } = mockFetchArgs;
    expect(url).toBe('http://localhost/emulator/abcdef/contacts');

    const { body, headers, method } = opts;
    expect(headers === headers).toBeTruthy();
    expect(method).toBe('POST');
    expect(body).toBeFalsy();
    expect(headersInstance).toEqual(headers);
  });

  test('the "botContactRemoved" function', () => {
    ConversationService.botContactRemoved('http://localhost', 'abcdef');
    const { url, opts } = mockFetchArgs;
    expect(url).toBe('http://localhost/emulator/abcdef/contacts');

    const { body, headers, method } = opts;
    expect(headers === headers).toBeTruthy();
    expect(method).toBe('DELETE');
    expect(body).toBeFalsy();
    expect(headersInstance).toEqual(headers);
  });

  test('the "typing" function', () => {
    ConversationService.typing('http://localhost', 'abcdef');
    const { url, opts } = mockFetchArgs;
    expect(url).toBe('http://localhost/emulator/abcdef/typing');

    const { body, headers, method } = opts;
    expect(headers === headers).toBeTruthy();
    expect(method).toBe('POST');
    expect(body).toBeFalsy();
    expect(headersInstance).toEqual(headers);
  });

  test('the "ping" function', () => {
    ConversationService.ping('http://localhost', 'abcdef');
    const { url, opts } = mockFetchArgs;
    expect(url).toBe('http://localhost/emulator/abcdef/ping');

    const { body, headers, method } = opts;
    expect(headers === headers).toBeTruthy();
    expect(method).toBe('POST');
    expect(body).toBeFalsy();
    expect(headersInstance).toEqual(headers);
  });

  test('the "deleteUserData" function', () => {
    ConversationService.deleteUserData('http://localhost', 'abcdef');
    const { url, opts } = mockFetchArgs;
    expect(url).toBe('http://localhost/emulator/abcdef/userdata');

    const { body, headers, method } = opts;
    expect(headers === headers).toBeTruthy();
    expect(method).toBe('DELETE');
    expect(body).toBeFalsy();
    expect(headersInstance).toEqual(headers);
  });
});
