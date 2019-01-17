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
export const headers = {
  'Content-Accept': 'application/json',
};

export class ConversationService {
  public static addUser(
    serviceUrl: string,
    conversationId: string,
    name?: string,
    id?: string
  ) {
    const url = `${serviceUrl}/emulator/${conversationId}/users`;
    return fetch(url, {
      headers,
      method: 'POST',
      body: JSON.stringify([{ name, id }]),
    });
  }

  public static removeUser(
    serviceUrl: string,
    conversationId: string,
    id: string
  ) {
    const url = `${serviceUrl}/emulator/${conversationId}/users`;
    return fetch(url, {
      headers,
      method: 'DELETE',
      body: JSON.stringify([{ id }]),
    });
  }

  public static removeRandomUser(serviceUrl: string, conversationId: string) {
    const url = `${serviceUrl}/emulator/${conversationId}/users`;
    return fetch(url, {
      headers,
      method: 'DELETE',
    });
  }

  public static botContactAdded(serviceUrl: string, conversationId: string) {
    const url = `${serviceUrl}/emulator/${conversationId}/contacts`;
    return fetch(url, {
      headers,
      method: 'POST',
    });
  }

  public static botContactRemoved(serviceUrl: string, conversationId: string) {
    const url = `${serviceUrl}/emulator/${conversationId}/contacts`;
    return fetch(url, {
      headers,
      method: 'DELETE',
    });
  }

  public static typing(serviceUrl: string, conversationId: string) {
    const url = `${serviceUrl}/emulator/${conversationId}/typing`;
    return fetch(url, {
      headers,
      method: 'POST',
    });
  }

  public static ping(serviceUrl: string, conversationId: string) {
    const url = `${serviceUrl}/emulator/${conversationId}/ping`;
    return fetch(url, {
      headers,
      method: 'POST',
    });
  }

  public static deleteUserData(serviceUrl: string, conversationId: string) {
    const url = `${serviceUrl}/emulator/${conversationId}/userdata`;
    return fetch(url, {
      headers,
      method: 'DELETE',
    });
  }
}
