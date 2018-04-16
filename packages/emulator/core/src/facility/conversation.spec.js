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

import Bot from '../bot';
import Conversation from './conversation';
import IBotOptions from '../types/botOptions';

let bot;
let conversation;

beforeEach(() => {
  bot = new Bot('bot', null, null, null, null, { loggerOrLogService: { logToChat: () => 0 } });

  conversation = new Conversation(
    bot,
    'convo',
    { id: 'user', name: 'User' }
  );
});

test('updateActivity success', () => {
  const oldActivities = conversation.activities;
  const activityChange = jest.fn();

  conversation.activities.push({
    activity: {
      id: '123',
      twenty: 2,
      three: 3
    },
    watermark: 0
  });

  conversation.on('activitychange', activityChange);

  conversation.updateActivity({
    id: '123',
    ten: 10,
    twenty: 20
  });

  expect(conversation.activities).toMatchSnapshot();
  expect(conversation.activities).not.toBe(oldActivities);
  expect(activityChange).toHaveBeenCalledTimes(1);
  expect(activityChange).toHaveBeenCalledWith({
    activity: {
      id: '123',
      ten: 10,
      twenty: 20,
      three: 3
    }
  });
});

test('updateActivity fail not found', () => {
  expect(() => conversation.updateActivity({ id: '123' })).toThrowError();
});

test('deleteActivity success', () => {
  const oldActivities = conversation.activities;
  const activityDelete = jest.fn();

  conversation.activities.push({
    activity: {
      id: '123',
      one: 1
    },
    watermark: 0
  });

  conversation.on('activitydelete', activityDelete);
  conversation.deleteActivity('123');

  expect(conversation.activities).toHaveProperty('length', 0);
  expect(conversation.activities).not.toBe(oldActivities);
  expect(activityDelete).toHaveBeenCalledTimes(1);
  expect(activityDelete).toHaveBeenCalledWith({
    activity: {
      id: '123',
      one: 1
    }
  });
});

test('deleteActivity fail not found', () => {
  expect(() => conversation.deleteActivity('123')).toThrowError();
});

test('addMember', () => {
  const oldMembers = conversation.members;
  const join = jest.fn();

  conversation.on('join', join);
  conversation.addMember('user-1', 'User 1');

  expect(conversation.members).toMatchSnapshot();
  expect(oldMembers).not.toBe(conversation.members);
  expect(join).toHaveBeenCalledTimes(1);
  expect(join).toHaveBeenCalledWith({
    user: { id: 'user-1', name: 'User 1' }
  });
});

test('removeMember', () => {
  const oldMembers = conversation.members;
  const left = jest.fn();

  conversation.on('left', left);
  conversation.removeMember('user');

  expect(conversation.members).toMatchSnapshot();
  expect(oldMembers).not.toBe(conversation.members);
  expect(left).toHaveBeenCalledTimes(1);
  expect(left).toHaveBeenCalledWith({
    user: { id: 'user', name: 'User' }
  });
});
