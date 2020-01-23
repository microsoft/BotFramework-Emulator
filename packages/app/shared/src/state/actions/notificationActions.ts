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

import { Notification } from '../../types';

export enum NotificationActions {
  beginAdd = 'NOTIFICATION/BEGIN_ADD',
  finishAdd = 'NOTIFICATION/FINISH_ADD',
  beginRemove = 'NOTIFICATION/BEGIN_REMOVE',
  finishRemove = 'NOTIFICATION/FINISH_REMOVE',
  markAllAsRead = 'NOTIFICATION/MARK_ALL_AS_READ',
  beginClear = 'NOTIFICATION/BEGIN_CLEAR',
  finishClear = 'NOTIFICATION/FINISH_CLEAR',
}

export type NotificationAction =
  | BeginAddNotificationAction
  | FinishAddNotificationAction
  | BeginRemoveNotificationAction
  | FinishRemoveNotificationAction
  | MarkAllAsReadNotificationAction
  | BeginClearNotificationAction
  | FinishClearNotificationAction;

export interface BeginAddNotificationAction {
  type: NotificationActions.beginAdd;
  payload: {
    notification: Notification;
    read: boolean;
  };
}

export interface FinishAddNotificationAction {
  type: NotificationActions.finishAdd;
  payload: {
    notification: Notification;
  };
}

export interface BeginRemoveNotificationAction {
  type: NotificationActions.beginRemove;
  payload: {
    id: string;
  };
}

export interface FinishRemoveNotificationAction {
  type: NotificationActions.finishRemove;
  payload: {
    id: string;
  };
}

export interface MarkAllAsReadNotificationAction {
  type: NotificationActions.markAllAsRead;
  payload: {};
}

export interface BeginClearNotificationAction {
  type: NotificationActions.beginClear;
  payload: {};
}

export interface FinishClearNotificationAction {
  type: NotificationActions.finishClear;
  payload: {};
}

export function beginAdd(notification: Notification, read: boolean = false): BeginAddNotificationAction {
  return {
    type: NotificationActions.beginAdd,
    payload: {
      notification,
      read,
    },
  };
}

export function finishAdd(notification: Notification): FinishAddNotificationAction {
  return {
    type: NotificationActions.finishAdd,
    payload: {
      notification,
    },
  };
}

export function beginRemove(id: string): BeginRemoveNotificationAction {
  return {
    type: NotificationActions.beginRemove,
    payload: {
      id,
    },
  };
}

export function finishRemove(id: string): FinishRemoveNotificationAction {
  return {
    type: NotificationActions.finishRemove,
    payload: {
      id,
    },
  };
}

export function markAllAsRead(): MarkAllAsReadNotificationAction {
  return {
    type: NotificationActions.markAllAsRead,
    payload: {},
  };
}

export function beginClear(): BeginClearNotificationAction {
  return {
    type: NotificationActions.beginClear,
    payload: {},
  };
}

export function finishClear(): FinishClearNotificationAction {
  return {
    type: NotificationActions.finishClear,
    payload: {},
  };
}
