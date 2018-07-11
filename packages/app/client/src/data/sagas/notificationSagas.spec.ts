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

import { call, put } from 'redux-saga/effects';
import { NotificationManager } from '../../notificationManager';
import { newNotification, NotificationType } from '@bfemulator/app-shared';
import {
  beginAdd,
  finishAdd,
  finishClear,
  beginRemove,
  finishRemove
} from '../action/notificationActions';
import {
  addNotification,
  clearNotifications,
  removeNotification
} from './notificationSagas';

describe('Notification sagas', () => {
  test('addNotification()', () => {
    const notification = newNotification('notification1', 'someMessage', NotificationType.Info);
    const action = beginAdd(notification, false);
    const gen = addNotification(action);

    // getting a notification manager instance
    expect(gen.next().value).toEqual(call([NotificationManager, NotificationManager.getInstance]));

    // adding a notification to the manager
    const instance = NotificationManager.getInstance();
    expect(gen.next(instance).value).toEqual(call([instance, instance.addNotification], notification));

    // dispatching a finishAdd notification action
    expect(gen.next().value).toEqual(put(finishAdd(notification)));
  });

  test('clearNotifications()', () => {
    const gen = clearNotifications();

    // getting a notification manager instance
    expect(gen.next().value).toEqual(call([NotificationManager, NotificationManager.getInstance]));

    // clearing the manager's notifications
    const instance = NotificationManager.getInstance();
    expect(gen.next(instance).value).toEqual(call([instance, instance.clearNotifications]));

    // dispatching a finishClear notification action
    expect(gen.next().value).toEqual(put(finishClear()));
  });

  test('removeNotification()', () => {
    const action = beginRemove('someId');
    const gen = removeNotification(action);

    // getting a notification manager instance
    expect(gen.next().value).toEqual(call([NotificationManager, NotificationManager.getInstance]));

    // removing a notification from the manager
    const instance = NotificationManager.getInstance();
    expect(gen.next(instance).value).toEqual(call([instance, instance.removeNotification], 'someId'));

    // dispatching a finishRemove notification action
    expect(gen.next().value).toEqual(put(finishRemove('someId')));
  });
});
