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

import { ForkEffect, put, takeEvery } from 'redux-saga/effects';

import { NotificationManager } from '../../notificationManager';
import {
  BeginAddNotificationAction,
  BeginRemoveNotificationAction,
  finishAdd,
  finishClear,
  finishRemove,
  NotificationActions,
} from '../action/notificationActions';

/** Adds a notification to the notification manager then
 *  adds it to the state store
 */
export function* addNotification(action: BeginAddNotificationAction): IterableIterator<any> {
  const { notification } = action.payload;
  NotificationManager.set(notification.id, notification);
  yield put(finishAdd(notification));
}

/** Clears all notifications from the notification manager then
 *  clears all notifications from the state store
 */
export function* clearNotifications(): IterableIterator<any> {
  NotificationManager.clear();
  yield put(finishClear());
}

/** Removes a single notification from the notification manager then
 *  removes it from the state store
 */
export function* removeNotification(action: BeginRemoveNotificationAction): IterableIterator<any> {
  const { id: notificationId } = action.payload;
  NotificationManager.delete(notificationId);
  yield put(finishRemove(notificationId));
}

/** Marks all notifications as read */
export function markAllAsRead(): void {
  NotificationManager.forEach(notification => {
    notification.read = true;
  });
}

export function* notificationSagas(): IterableIterator<ForkEffect> {
  yield takeEvery(NotificationActions.beginAdd, addNotification);
  yield takeEvery(NotificationActions.beginClear, clearNotifications);
  yield takeEvery(NotificationActions.beginRemove, removeNotification);
  yield takeEvery(NotificationActions.markAllAsRead, markAllAsRead);
}
