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

import { cleanupId, findIdWithRole } from './conversation';

describe('conversation utilities', () => {
  it('should find ID with role "bot"', () => {
    const activities: any = [
      {
        recipient: { id: 'bot-1', role: 'bot' },
      },
      {
        recipient: { id: 'bot-2', role: 'bot' },
      },
    ];

    expect(findIdWithRole(activities, 'bot')).toBe('bot-1');
  });

  it('should not alter conversationUpdate activites', () => {
    const activities: any = [
      {
        type: 'conversationUpdate',
        recipient: { id: 'bot-1', role: 'bot' },
      },
      {
        type: 'conversationUpdate',
        recipient: { id: 'bot-2', role: 'bot' },
      },
    ];
    expect(cleanupId(activities)).toEqual(activities);
  });

  it('should assign bot and user IDs to all activities with from and recipient fields', () => {
    const botId = 'bot123';
    const userId = 'user123';
    const activities: any = [
      {
        type: 'event',
        from: { role: 'bot' },
        recipient: { role: 'user' },
      },
      {
        type: 'message',
        from: { role: 'user' },
        recipient: { role: 'bot' },
      },
      {
        type: 'messageReaction',
        from: { role: 'bot' },
        recipient: { role: 'user' },
      },
      {
        type: 'typing',
        from: { role: 'user' },
        recipient: { role: 'bot' },
      },
    ];
    const fixedActivities = cleanupId(activities, botId, userId);
    expect(fixedActivities).toEqual([
      {
        type: 'event',
        from: { id: 'bot123', role: 'bot' },
        recipient: { id: 'user123', role: 'user' },
      },
      {
        type: 'message',
        from: { id: 'user123', role: 'user' },
        recipient: { id: 'bot123', role: 'bot' },
      },
      {
        type: 'messageReaction',
        from: { id: 'bot123', role: 'bot' },
        recipient: { id: 'user123', role: 'user' },
      },
      {
        type: 'typing',
        from: { id: 'user123', role: 'user' },
        recipient: { id: 'bot123', role: 'bot' },
      },
    ]);
  });
});

it('should use the id of the activity if no default bot / user ID was found or there is no role', () => {
  const activities: any = [
    {
      type: 'message',
      from: { id: 'user123' },
      recipient: { id: 'bot123' },
    },
  ];
  const fixedActivities = cleanupId(activities);
  expect(fixedActivities).toEqual(activities);
});
