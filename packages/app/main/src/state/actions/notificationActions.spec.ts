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

import {
  beginAdd,
  finishAdd,
  beginRemove,
  finishRemove,
  markAllAsRead,
  beginClear,
  finishClear,
  NotificationActions,
} from './notificationActions';

describe('notification actions', () => {
  it('should create a beginAdd action', () => {
    const notification: any = {};
    const action = beginAdd(notification);

    expect(action.type).toBe(NotificationActions.beginAdd);
    expect(action.payload).toEqual({ notification, read: false });
  });

  it('should create a finishAdd action', () => {
    const notification: any = {};
    const action = finishAdd(notification);

    expect(action.type).toBe(NotificationActions.finishAdd);
    expect(action.payload).toEqual({ notification });
  });

  it('should create a beginRemove action', () => {
    const id = 'someId';
    const action = beginRemove(id);

    expect(action.type).toBe(NotificationActions.beginRemove);
    expect(action.payload).toEqual({ id });
  });

  it('should create a finishRemove action', () => {
    const id = 'someId';
    const action = finishRemove(id);

    expect(action.type).toBe(NotificationActions.finishRemove);
    expect(action.payload).toEqual({ id });
  });

  it('should create a markAllAsRead action', () => {
    const action = markAllAsRead();

    expect(action.type).toBe(NotificationActions.markAllAsRead);
    expect(action.payload).toEqual({});
  });

  it('should create a beginClear action', () => {
    const action = beginClear();

    expect(action.type).toBe(NotificationActions.beginClear);
    expect(action.payload).toEqual({});
  });

  it('should create a finishClear action', () => {
    const action = finishClear();

    expect(action.type).toBe(NotificationActions.finishClear);
    expect(action.payload).toEqual({});
  });
});
