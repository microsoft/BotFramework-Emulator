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

import { newNotification } from '../../utils';
import { finishAdd, finishRemove, finishClear, NotificationAction } from '../actions/notificationActions';

import { notification, NotificationState } from './notification';

describe('Notification reducer tests', () => {
  let defaultState: NotificationState;

  beforeEach(() => {
    defaultState = {
      allIds: [],
    };
  });

  test('default', () => {
    const action: NotificationAction = { type: null, payload: {} };
    const endingState = notification(defaultState, action);
    expect(endingState).toEqual(defaultState);
  });

  test('finishAdd', () => {
    const notification1 = newNotification('Hi, I am a notification!');
    const action: NotificationAction = finishAdd(notification1);
    let endingState = notification(defaultState, action);

    expect(endingState.allIds.length).toBe(1);
    expect(endingState.allIds.some(id => id === notification1.id)).toBe(true);

    // should not add duplicates
    endingState = notification(endingState, action);

    expect(endingState.allIds.length).toBe(1);
    expect(endingState.allIds.some(id => id === notification1.id)).toBe(true);
  });

  test('finishRemove', () => {
    const idToRemove = 'id1';
    const startingState: NotificationState = {
      allIds: [idToRemove, 'id2'],
    };
    const action: NotificationAction = finishRemove(idToRemove);
    let endingState = notification(startingState, action);

    expect(endingState.allIds.length).toBe(1);
    expect(endingState.allIds.some(id => id === idToRemove)).toBe(false);

    // removing non-existent id should be a no-op
    endingState = notification(endingState, action);

    expect(endingState.allIds.length).toBe(1);
    expect(endingState.allIds.some(id => id === idToRemove)).toBe(false);
  });

  test('finishClear', () => {
    const startingState: NotificationState = {
      allIds: ['id1', 'id2', 'id3'],
    };
    const action: NotificationAction = finishClear();
    const endingState = notification(startingState, action);

    expect(endingState.allIds.length).toBe(0);
  });
});
