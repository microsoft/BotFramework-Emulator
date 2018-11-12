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

import { isLocalHostUrl, isObject, uniqueId, uniqueIdv4 } from './misc';

describe('Misc utility function tests', () => {
  it('should generate a uniqueId', () => {
    const id1 = uniqueId();
    const id2 = uniqueId();
    const id3 = uniqueId();

    expect(id1).not.toEqual(id2);
    expect(id1).not.toEqual(id3);
    expect(id2).not.toEqual(id3);
  });

  it('should determine if a variable is an object', () => {
    const nonObj1 = 1;
    const nonObj2 = 'notAnObject';
    const nonObj3 = true;
    const nonObj4 = [3, 'someString', false];

    expect(isObject(nonObj1)).toBe(false);
    expect(isObject(nonObj2)).toBe(false);
    expect(isObject(nonObj3)).toBe(false);
    expect(isObject(nonObj4)).toBe(false);

    const obj = { someProp: 123 };

    expect(isObject(obj)).toBe(true);
  });

  it('should generate a uniqueId using uuidv4', () => {
    const id1 = uniqueIdv4();
    const id2 = uniqueIdv4();
    const id3 = uniqueIdv4();

    expect(id1).not.toEqual(id2);
    expect(id1).not.toEqual(id3);
    expect(id2).not.toEqual(id3);
  });

  it('should determine whether a url is a localhost url or not', () => {
    expect(isLocalHostUrl('http://localhost')).toBeTruthy();
    expect(isLocalHostUrl('http://127.0.0.1')).toBeTruthy();
    expect(isLocalHostUrl('https://aka.ms/bot-framework-emulator')).toBeFalsy();
    expect(isLocalHostUrl('dasdagidsd812931239@#232')).toBeFalsy();
  });
});
