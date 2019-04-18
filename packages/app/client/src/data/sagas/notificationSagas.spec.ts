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

import { newNotification, NotificationType } from '@bfemulator/app-shared';
import { put } from 'redux-saga/effects';

import { NotificationManager } from '../../notificationManager';
import { beginAdd, finishAdd, finishClear, beginRemove, finishRemove } from '../action/notificationActions';

import { addNotification, clearNotifications, removeNotification, markAllAsRead } from './notificationSagas';

describe('Notification sagas', () => {
  test('addNotification()', () => {
    const notification = newNotification('someMessage', NotificationType.Info);
    const action = beginAdd(notification, false);
    const gen = addNotification(action);

    // dispatching a finishAdd notification action
    expect(gen.next().value).toEqual(put(finishAdd(notification)));
  });

  test('clearNotifications()', () => {
    const gen = clearNotifications();

    // dispatching a finishClear notification action
    expect(gen.next().value).toEqual(put(finishClear()));
  });

  test('removeNotification()', () => {
    const action = beginRemove('someId');
    const gen = removeNotification(action);

    // dispatching a finishRemove notification action
    expect(gen.next().value).toEqual(put(finishRemove('someId')));
  });

  test('markAllAsRead()', () => {
    NotificationManager.clear();
    const notification1 = newNotification('someMessage', NotificationType.Info);
    const notification2 = newNotification('someMessage', NotificationType.Info);
    expect(notification1.read).toBe(false);
    expect(notification2.read).toBe(false);
    NotificationManager.set(notification1.id, notification1);
    NotificationManager.set(notification2.id, notification2);

    markAllAsRead();

    expect(NotificationManager.get(notification1.id).read).toBe(true);
    expect(NotificationManager.get(notification2.id).read).toBe(true);
  });
});
