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

import * as nodeUrl from 'url';

import { v4 as uuidv4 } from 'uuid';
import { v1 as uuidv1 } from 'uuid';

export function uniqueIdv4(): string {
  return uuidv4().toString();
}

export function uniqueId(): string {
  return uuidv1().toString();
}

export function isObject(item: any): boolean {
  return item && typeof item === 'object' && !Array.isArray(item);
}

export function isLocalHostUrl(url: string): boolean {
  const localhostNames = ['localhost', '127.0.0.1', '::1'];
  let parsedUrl;
  //  Node 8 - may be removed when upgrading to Electron 4
  if (nodeUrl) {
    try {
      parsedUrl = nodeUrl.parse(url);
    } catch (e) {
      return false;
    }
  } else {
    try {
      parsedUrl = new URL(url);
    } catch (e) {
      // invalid url was passed in
      return false;
    }
  }
  return localhostNames.some(name => parsedUrl.hostname === name);
}
