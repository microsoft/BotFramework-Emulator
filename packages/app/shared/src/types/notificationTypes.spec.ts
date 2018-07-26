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

import { NotificationImpl } from './notificationTypes';

describe('NotificationImpl class', () => {
  test('initialization', () => {
    const notif1 = new NotificationImpl();
    const notif2 = new NotificationImpl();

    expect(notif1.id).not.toBeFalsy();
    expect(notif1.timestamp).not.toBeFalsy();
    expect(notif1.read).toBe(false);
    expect(notif1.buttons).not.toBeFalsy();
    expect(notif1.buttons).toHaveLength(0);

    expect(notif1.id).not.toBe(notif2.id);
  });

  test('addButton()', () => {
    const notif = new NotificationImpl();
    notif.addButton('button1');
    notif.addButton('button2', (a: number, b: number) => a + b);

    expect(notif.buttons).toHaveLength(2);
    expect(notif.buttons[0].text).toBe('button1');
    expect(notif.buttons[0].onClick).toBeFalsy();
    expect(notif.buttons[1].text).toBe('button2');
    expect(notif.buttons[1].onClick(1, 2)).toBe(3);
  });
});
