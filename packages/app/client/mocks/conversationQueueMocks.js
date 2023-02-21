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

module.exports.replayScenarios = [
  {
    incomingActivities: [
      {
        // type: 'conversationUpdate',
        id: '1',
      },
      {
        id: 'bot2a',
        replyToId: 'act-2',
      },
      {
        id: 'bot2b',
        replyToId: 'act-2',
      },
      {
        id: 'act-2',
      },
      {
        id: 'bot3a',
        replyToId: 'act-3',
      },
      {
        id: 'bot3b',
        replyToId: 'act-3',
      },
      {
        id: 'act-3',
      },
    ],
    postActivitiesSlots: [1, 4],
    activitiesToBePosted: [
      { id: 'act-2', from: { role: 'user' }, channelData: { test: true } },
      { id: 'act-3', from: { role: 'user' }, channelData: { test: true } },
    ],
    botResponsesForActivity: [
      {
        // type: 'conversationUpdate',
        id: '1',
      },
      {
        id: 'act-bot2a',
        replyToId: 'bdc9da50-30d0-4611-967e-182db8882533',
        from: { role: 'bot' },
        channelData: { test: true },
      },
      {
        id: 'act-bot2b',
        replyToId: 'bdc9da50-30d0-4611-967e-182db8882533',
        from: { role: 'bot' },
        channelData: { test: true },
      },
      { id: 'bdc9da50-30d0-4611-967e-182db8882533', from: { role: 'bot' }, channelData: { matchIndexes: [1, 2] } },
    ],
  },
  {
    activitiesToBePosted: [
      { id: 'act-2', from: { role: 'user' }, channelData: { test: true } },
      { id: 'act-3', from: { role: 'user' }, channelData: { test: true } },
    ],
    incomingActivities: [
      {
        // type: 'conversationUpdate',
        id: 'conv-1',
      },
      {
        // type: 'conversationUpdate',
        id: 'conv-2',
      },
      {
        id: 'bot2a',
        replyToId: 'act-2',
      },
      {
        id: 'bot2b',
        replyToId: 'act-2',
      },
      {
        id: 'conv-3',
      },
      {
        // type: 'conversationUpdate',
        id: 'act-2',
      },
      {
        id: 'bot3a',
        replyToId: 'act-3',
      },
      {
        id: 'bot3b',
        replyToId: 'act-3',
      },
      {
        id: 'act-3',
      },
    ],
    postActivitiesSlots: [2, 6],
    botResponsesForActivity: [
      {
        // type: 'conversationUpdate',
        id: 'dummy-conv-update-1',
      },
      {
        // type: 'conversationUpdate',
        id: 'dummy-conv-update-2',
      },
      {
        id: 'act-bot2a',
        replyToId: 'bdc9da50-30d0-4611-967e-182db8882533',
        from: { role: 'bot' },
        channelData: { test: true },
      },
      {
        id: 'act-bot2b',
        replyToId: 'bdc9da50-30d0-4611-967e-182db8882533',
        from: { role: 'bot' },
        channelData: { test: true },
      },
      {
        // type: 'conversationUpdate',
        id: 'dummy-conv-update-3',
      },
      { id: 'bdc9da50-30d0-4611-967e-182db8882533', from: { role: 'bot' }, channelData: { matchIndexes: [2, 3] } },
      {
        id: 'act-bot3a',
        replyToId: 'bdc9da50-30d0-4611-967e-182db8882534',
        from: { role: 'bot' },
        channelData: { test: true },
      },
      {
        id: 'act-bot3b',
        replyToId: 'bdc9da50-30d0-4611-967e-182db8882534',
        from: { role: 'bot' },
        channelData: { test: true },
      },
      { id: 'bdc9da50-30d0-4611-967e-182db8882534', from: { role: 'bot' }, channelData: { matchIndexes: [2, 3] } },
    ],
  },
  {
    incomingActivities: [
      {
        // type: 'conversationUpdate',
        id: '1',
      },
      {
        id: 'bot2a',
        replyToId: 'act-2',
      },

      {
        id: 'bot3a',
        replyToId: 'act-3',
      },
      {
        id: 'bot3b',
        replyToId: 'act-3',
      },
      {
        id: 'bot2b',
        replyToId: 'act-2',
      },
      {
        id: 'bot3c',
        replyToId: 'act-3',
      },
      {
        id: 'act-3',
      },
      {
        id: 'bot2c',
        replyToId: 'act-2',
      },
      {
        id: 'bot2d',
        replyToId: 'act-2',
      },
      {
        id: 'act-2',
      },
      {
        id: 'bot4a',
        replyToId: 'act-4',
      },
      {
        id: 'bot4b',
        replyToId: 'act-4',
      },
      {
        id: 'bot4c',
        replyToId: 'act-4',
      },
      {
        id: 'act-4',
      },
    ],
    postActivitiesSlots: [1, 2, 10],
    activitiesToBePosted: [
      { id: 'act-2', from: { role: 'user' }, channelData: { test: true } },
      { id: 'act-3', from: { role: 'user' }, channelData: { test: true } },
      { id: 'act-4', from: { role: 'user' }, channelData: { test: true } },
    ],
    botResponsesForActivity: [
      {
        // type: 'conversationUpdate',
        id: '1',
      },
      {
        id: 'act-bot2a',
        replyToId: 'bdc9da50-30d0-4611-967e-182db888253Act2',
        from: { role: 'bot' },
        channelData: { test: true },
      },
      {
        id: 'act-bot3a',
        replyToId: 'bdc9da50-30d0-4611-967e-182db8882533Act3',
        from: { role: 'bot' },
        channelData: { test: true },
      },
      {
        id: 'act-bot3b',
        replyToId: 'bdc9da50-30d0-4611-967e-182db8882533Act3',
        from: { role: 'bot' },
        channelData: { test: true },
      },
      {
        id: 'act-bot2b',
        replyToId: 'bdc9da50-30d0-4611-967e-182db888253Act2',
        from: { role: 'bot' },
        channelData: { test: true },
      },
      {
        id: 'act-bot3c',
        replyToId: 'bdc9da50-30d0-4611-967e-182db8882533Act3',
        from: { role: 'bot' },
        channelData: { test: true },
      },
      {
        id: 'bdc9da50-30d0-4611-967e-182db8882533Act3',
        from: { role: 'bot' },
        channelData: { matchIndexes: [2, 3, 5] },
      },
      {
        id: 'act-bot2c',
        replyToId: 'bdc9da50-30d0-4611-967e-182db888253Act2',
        from: { role: 'bot' },
        channelData: { test: true },
      },
      {
        id: 'act-bot2d',
        replyToId: 'bdc9da50-30d0-4611-967e-182db888253Act2',
        from: { role: 'bot' },
        channelData: { test: true },
      },
      {
        id: 'bdc9da50-30d0-4611-967e-182db888253Act2',
        from: { role: 'bot' },
        channelData: { matchIndexes: [1, 4, 7, 8] },
      },
      {
        id: 'act-bot4a',
        replyToId: 'bdc9da50-30d0-4611-967e-182db888253Act4',
        from: { role: 'bot' },
        channelData: { test: true },
      },
    ],
  },
  {
    incomingActivities: [
      {
        // type: 'conversationUpdate',
        id: '1',
      },
      {
        id: 'bot2a',
        replyToId: 'act-2',
      },

      {
        id: 'bot3a',
        replyToId: 'act-3',
      },
      {
        id: 'bot3b',
        replyToId: 'act-3',
      },
      {
        id: 'bot2b',
        replyToId: 'act-2',
      },
      {
        id: 'bot3c',
        replyToId: 'act-3',
      },
      {
        id: 'act-3',
      },
      {
        id: 'bot2c',
        replyToId: 'act-2',
      },
      {
        id: 'bot2d',
        replyToId: 'act-2',
      },
      {
        id: 'act-2',
      },
      {
        id: 'bot4a',
        replyToId: 'act-4',
      },
      {
        id: 'bot4b',
        replyToId: 'act-4',
      },
      {
        id: 'bot4c',
        replyToId: 'act-4',
      },
      {
        id: 'bot2ProgressiveA',
        replyToId: 'act-2',
      },
      {
        id: 'bot2ProgressiveB',
        replyToId: 'act-2',
      },
      {
        id: 'act-4',
      },
      {
        id: 'bot5A',
        replyToId: 'act-5',
      },
      {
        id: 'act-5',
      },
    ],
    postActivitiesSlots: [1, 2, 10, 16],
    activitiesToBePosted: [
      { id: 'act-2', from: { role: 'user' }, channelData: { test: true } },
      { id: 'act-3', from: { role: 'user' }, channelData: { test: true } },
      { id: 'act-4', from: { role: 'user' }, channelData: { test: true } },
      { id: 'act-5', from: { role: 'user' }, channelData: { test: true } },
    ],
    botResponsesForActivity: [
      {
        // type: 'conversationUpdate',
        id: '1',
      },
      {
        id: 'act-bot2a',
        replyToId: 'bdc9da50-30d0-4611-967e-182db888253Act2',
        from: { role: 'bot' },
        channelData: { test: true },
      },
      {
        id: 'act-bot3a',
        replyToId: 'bdc9da50-30d0-4611-967e-182db8882533Act3',
        from: { role: 'bot' },
        channelData: { test: true },
      },
      {
        id: 'act-bot3b',
        replyToId: 'bdc9da50-30d0-4611-967e-182db8882533Act3',
        from: { role: 'bot' },
        channelData: { test: true },
      },
      {
        id: 'act-bot2b',
        replyToId: 'bdc9da50-30d0-4611-967e-182db888253Act2',
        from: { role: 'bot' },
        channelData: { test: true },
      },
      {
        id: 'act-bot3c',
        replyToId: 'bdc9da50-30d0-4611-967e-182db8882533Act3',
        from: { role: 'bot' },
        channelData: { test: true },
      },
      {
        id: 'bdc9da50-30d0-4611-967e-182db8882533Act3',
        from: { role: 'bot' },
        channelData: { matchIndexes: [2, 3, 5] },
      },
      {
        id: 'act-bot2c',
        replyToId: 'bdc9da50-30d0-4611-967e-182db888253Act2',
        from: { role: 'bot' },
        channelData: { test: true },
      },
      {
        id: 'act-bot2d',
        replyToId: 'bdc9da50-30d0-4611-967e-182db888253Act2',
        from: { role: 'bot' },
        channelData: { test: true },
      },
      {
        id: 'bdc9da50-30d0-4611-967e-182db888253Act2',
        from: { role: 'bot' },
        channelData: { matchIndexes: [1, 4, 7, 8, 13, 14] },
      },
      {
        id: 'act-bot4a',
        replyToId: 'bdc9da50-30d0-4611-967e-182db888253Act4',
        from: { role: 'bot' },
        channelData: { test: true },
      },
      {
        id: 'act-bot4B',
        replyToId: 'bdc9da50-30d0-4611-967e-182db888253Act4',
        from: { role: 'bot' },
        channelData: { test: true },
      },
      {
        id: 'act-bot4C',
        replyToId: 'bdc9da50-30d0-4611-967e-182db888253Act4',
        from: { role: 'bot' },
        channelData: { test: true },
      },
      {
        id: 'act-bot2PRE',
        replyToId: 'bdc9da50-30d0-4611-967e-182db888253Act2',
        from: { role: 'bot' },
        channelData: { test: 'ProgressiveResponse' },
      },
      {
        id: 'act-bot2PRF',
        replyToId: 'bdc9da50-30d0-4611-967e-182db888253Act2',
        from: { role: 'bot' },
        channelData: { test: 'ProgressiveResponse' },
      },
      {
        id: 'act-bot5a',
        replyToId: 'bdc9da50-30d0-4611-967e-182db888253Act5',
        from: { role: 'bot' },
        channelData: { test: true },
      },
      {
        id: 'bdc9da50-30d0-4611-967e-182db888253Act5',
        from: { role: 'bot' },
        channelData: { matchIndexes: [15] },
      },
    ],
  },
];
