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
export const activities = [
  {
    type: 'conversationUpdate',
    membersAdded: [
      {
        id: '3fe76690-5802-11ea-bb6a-31d3402f2821',
        name: 'Bot',
      },
      {
        id: '',
        name: 'User',
      },
    ],
    membersRemoved: [],
    channelId: 'emulator',
    conversation: {
      id: '4aa44580-5802-11ea-bb6a-31d3402f2821|livechat',
    },
    id: '4ab7cd80-5802-11ea-afe8-c12c2746983b',
    localTimestamp: '2020-02-25T11:09:05-08:00',
    recipient: {
      id: '3fe76690-5802-11ea-bb6a-31d3402f2821',
      name: 'Bot',
      role: 'bot',
    },
    timestamp: '2020-02-25T19:09:05.496Z',
    from: {
      id: '',
      name: 'User',
      role: 'user',
    },
    locale: 'en-US',
    serviceUrl: 'http://localhost:50438',
  },
  {
    channelData: {
      clientActivityID: '1582657741644hl73t73n83',
      clientTimestamp: '2020-02-25T19:09:01.644Z',
      originalActivityId: '4871ae10-5802-11ea-afe8-c12c2746983b',
      matchIndexes: [1],
    },
    text: 'Hi',
    textFormat: 'plain',
    type: 'message',
    channelId: 'emulator',
    from: {
      id: 'r_1582657745',
      name: 'User',
      role: 'user',
    },
    locale: 'en-US',
    timestamp: '2020-02-25T19:09:05.521Z',
    entities: [
      {
        requiresBotState: true,
        supportsListening: true,
        supportsTts: true,
        type: 'ClientCapabilities',
      },
      {
        requiresBotState: true,
        supportsListening: true,
        supportsTts: true,
        type: 'ClientCapabilities',
      },
    ],
    conversation: {
      id: '4aa44580-5802-11ea-bb6a-31d3402f2821|livechat',
    },
    localTimestamp: '2020-02-25T11:09:05-08:00',
    recipient: {
      id: '3fe76690-5802-11ea-bb6a-31d3402f2821',
      name: 'Bot',
      role: 'bot',
    },
    serviceUrl: 'http://localhost:50438',
    id: '4abb9e10-5802-11ea-afe8-c12c2746983b',
  },
  {
    type: 'message',
    serviceUrl: 'http://localhost:50438',
    channelId: 'emulator',
    from: {
      id: '3fe76690-5802-11ea-bb6a-31d3402f2821',
      name: 'Bot',
      role: 'bot',
    },
    conversation: {
      id: '4aa44580-5802-11ea-bb6a-31d3402f2821|livechat',
    },
    recipient: {
      id: '',
      role: 'user',
    },
    text: 'Please enter your mode of transport.',
    inputHint: 'expectingInput',
    suggestedActions: {
      actions: [
        {
          type: 'imBack',
          title: 'Car',
          value: 'Car',
        },
        {
          type: 'imBack',
          title: 'Bus',
          value: 'Bus',
        },
        {
          type: 'imBack',
          title: 'Bicycle',
          value: 'Bicycle',
        },
      ],
    },
    replyToId: '4abb9e10-5802-11ea-afe8-c12c2746983b',
    id: '4abc8870-5802-11ea-afe8-c12c2746983b',
    localTimestamp: '2020-02-25T11:09:05-08:00',
    timestamp: '2020-02-25T19:09:05.527Z',
    locale: 'en-US',
  },
  {
    channelData: {
      clientActivityID: '1582657743316a25l7a6etzt',
      clientTimestamp: '2020-02-25T19:09:03.316Z',
      originalActivityId: '496b9e70-5802-11ea-afe8-c12c2746983b',
      matchIndexes: [3],
    },
    text: 'Car',
    textFormat: 'plain',
    type: 'message',
    channelId: 'emulator',
    from: {
      id: 'r_1582657745',
      name: 'User',
      role: 'user',
    },
    locale: 'en-US',
    timestamp: '2020-02-25T19:09:05.598Z',
    conversation: {
      id: '4aa44580-5802-11ea-bb6a-31d3402f2821|livechat',
    },
    localTimestamp: '2020-02-25T11:09:05-08:00',
    recipient: {
      id: '3fe76690-5802-11ea-bb6a-31d3402f2821',
      name: 'Bot',
      role: 'bot',
    },
    serviceUrl: 'http://localhost:50438',
    id: '4ac75de0-5802-11ea-afe8-c12c2746983b',
  },
  {
    type: 'message',
    serviceUrl: 'http://localhost:50438',
    channelId: 'emulator',
    from: {
      id: '3fe76690-5802-11ea-bb6a-31d3402f2821',
      name: 'Bot',
      role: 'bot',
    },
    conversation: {
      id: '4aa44580-5802-11ea-bb6a-31d3402f2821|livechat',
    },
    recipient: {
      id: '',
      role: 'user',
    },
    text: 'Please enter your name.',
    inputHint: 'expectingInput',
    replyToId: '4ac75de0-5802-11ea-afe8-c12c2746983b',
    id: '4ac84840-5802-11ea-afe8-c12c2746983b',
    localTimestamp: '2020-02-25T11:09:05-08:00',
    timestamp: '2020-02-25T19:09:05.604Z',
    locale: 'en-US',
  },
  {
    channelData: {
      clientActivityID: '158265776185762jv8ehugsq',
      clientTimestamp: '2020-02-25T19:09:21.857Z',
    },
    text: 'tester',
    textFormat: 'plain',
    type: 'message',
    channelId: 'emulator',
    from: {
      id: 'r_1582657745',
      name: 'User',
      role: 'user',
    },
    locale: 'en-US',
    timestamp: '2020-02-25T19:09:21.892Z',
    conversation: {
      id: '4aa44580-5802-11ea-bb6a-31d3402f2821|livechat',
    },
    id: '547da240-5802-11ea-afe8-c12c2746983b',
    localTimestamp: '2020-02-25T11:09:21-08:00',
    recipient: {
      id: '3fe76690-5802-11ea-bb6a-31d3402f2821',
      name: 'Bot',
      role: 'bot',
    },
    serviceUrl: 'http://localhost:50438',
  },
  {
    type: 'message',
    serviceUrl: 'http://localhost:50438',
    channelId: 'emulator',
    from: {
      id: '3fe76690-5802-11ea-bb6a-31d3402f2821',
      name: 'Bot',
      role: 'bot',
    },
    conversation: {
      id: '4aa44580-5802-11ea-bb6a-31d3402f2821|livechat',
    },
    recipient: {
      id: '',
      role: 'user',
    },
    text: 'Thanks tester.',
    inputHint: 'acceptingInput',
    replyToId: '547da240-5802-11ea-afe8-c12c2746983b',
    id: '547eb3b0-5802-11ea-afe8-c12c2746983b',
    localTimestamp: '2020-02-25T11:09:21-08:00',
    timestamp: '2020-02-25T19:09:21.899Z',
    locale: 'en-US',
  },
  {
    type: 'message',
    serviceUrl: 'http://localhost:50438',
    channelId: 'emulator',
    from: {
      id: '3fe76690-5802-11ea-bb6a-31d3402f2821',
      name: 'Bot',
      role: 'bot',
    },
    conversation: {
      id: '4aa44580-5802-11ea-bb6a-31d3402f2821|livechat',
    },
    recipient: {
      id: '',
      role: 'user',
    },
    text: 'Do you want to give your age?',
    inputHint: 'expectingInput',
    suggestedActions: {
      actions: [
        {
          type: 'imBack',
          title: 'Yes',
          value: 'Yes',
        },
        {
          type: 'imBack',
          title: 'No',
          value: 'No',
        },
      ],
    },
    replyToId: '547da240-5802-11ea-afe8-c12c2746983b',
    id: '547f28e0-5802-11ea-afe8-c12c2746983b',
    localTimestamp: '2020-02-25T11:09:21-08:00',
    timestamp: '2020-02-25T19:09:21.902Z',
    locale: 'en-US',
  },
  {
    channelData: {
      clientActivityID: '1582657763139pa3ds9m7h9f',
      clientTimestamp: '2020-02-25T19:09:23.139Z',
    },
    text: 'Yes',
    textFormat: 'plain',
    type: 'message',
    channelId: 'emulator',
    from: {
      id: 'r_1582657745',
      name: 'User',
      role: 'user',
    },
    locale: 'en-US',
    timestamp: '2020-02-25T19:09:23.141Z',
    conversation: {
      id: '4aa44580-5802-11ea-bb6a-31d3402f2821|livechat',
    },
    id: '553c3750-5802-11ea-afe8-c12c2746983b',
    localTimestamp: '2020-02-25T11:09:23-08:00',
    recipient: {
      id: '3fe76690-5802-11ea-bb6a-31d3402f2821',
      name: 'Bot',
      role: 'bot',
    },
    serviceUrl: 'http://localhost:50438',
  },
  {
    type: 'message',
    serviceUrl: 'http://localhost:50438',
    channelId: 'emulator',
    from: {
      id: '3fe76690-5802-11ea-bb6a-31d3402f2821',
      name: 'Bot',
      role: 'bot',
    },
    conversation: {
      id: '4aa44580-5802-11ea-bb6a-31d3402f2821|livechat',
    },
    recipient: {
      id: '',
      role: 'user',
    },
    text: 'Please enter your age.',
    inputHint: 'expectingInput',
    replyToId: '553c3750-5802-11ea-afe8-c12c2746983b',
    id: '553ea850-5802-11ea-afe8-c12c2746983b',
    localTimestamp: '2020-02-25T11:09:23-08:00',
    timestamp: '2020-02-25T19:09:23.157Z',
    locale: 'en-US',
  },
  {
    channelData: {
      clientActivityID: '1582657766339zujfevrrg9q',
      clientTimestamp: '2020-02-25T19:09:26.339Z',
    },
    text: '62',
    textFormat: 'plain',
    type: 'message',
    channelId: 'emulator',
    from: {
      id: 'r_1582657745',
      name: 'User',
      role: 'user',
    },
    locale: 'en-US',
    timestamp: '2020-02-25T19:09:26.342Z',
    conversation: {
      id: '4aa44580-5802-11ea-bb6a-31d3402f2821|livechat',
    },
    id: '5724a660-5802-11ea-afe8-c12c2746983b',
    localTimestamp: '2020-02-25T11:09:26-08:00',
    recipient: {
      id: '3fe76690-5802-11ea-bb6a-31d3402f2821',
      name: 'Bot',
      role: 'bot',
    },
    serviceUrl: 'http://localhost:50438',
  },
  {
    type: 'message',
    serviceUrl: 'http://localhost:50438',
    channelId: 'emulator',
    from: {
      id: '3fe76690-5802-11ea-bb6a-31d3402f2821',
      name: 'Bot',
      role: 'bot',
    },
    conversation: {
      id: '4aa44580-5802-11ea-bb6a-31d3402f2821|livechat',
    },
    recipient: {
      id: '',
      role: 'user',
    },
    text: 'I have your age as 29.',
    inputHint: 'acceptingInput',
    replyToId: '5724a660-5802-11ea-afe8-c12c2746983b',
    id: '57267b20-5802-11ea-afe8-c12c2746983b',
    localTimestamp: '2020-02-25T11:09:26-08:00',
    timestamp: '2020-02-25T19:09:26.354Z',
    locale: 'en-US',
  },
  {
    type: 'message',
    serviceUrl: 'http://localhost:50438',
    channelId: 'emulator',
    from: {
      id: '3fe76690-5802-11ea-bb6a-31d3402f2821',
      name: 'Bot',
      role: 'bot',
    },
    conversation: {
      id: '4aa44580-5802-11ea-bb6a-31d3402f2821|livechat',
    },
    recipient: {
      id: '',
      role: 'user',
    },
    text: 'Please attach a profile picture (or type any message to skip).',
    inputHint: 'expectingInput',
    replyToId: '5724a660-5802-11ea-afe8-c12c2746983b',
    id: '57273e70-5802-11ea-afe8-c12c2746983b',
    localTimestamp: '2020-02-25T11:09:26-08:00',
    timestamp: '2020-02-25T19:09:26.358Z',
    locale: 'en-US',
  },
  {
    attachments: [
      {
        name: 'IMG-2744.jpg',
        contentUrl: 'data:application/octet-stream;base64,/9j/',
        contentType: 'image/jpeg',
      },
    ],
    channelData: {
      clientActivityID: '1582657774063k2trifj0lj',
      clientTimestamp: '2020-02-25T19:09:34.063Z',
      attachmentSizes: [1613564],
    },
    type: 'message',
    channelId: 'emulator',
    from: {
      id: 'r_1582657745',
      name: 'User',
      role: 'user',
    },
    locale: 'en-US',
    timestamp: '2020-02-25T19:09:34.141Z',
    conversation: {
      id: '4aa44580-5802-11ea-bb6a-31d3402f2821|livechat',
    },
    id: '5bcaaed1-5802-11ea-afe8-c12c2746983b',
    localTimestamp: '2020-02-25T11:09:34-08:00',
    recipient: {
      id: '3fe76690-5802-11ea-bb6a-31d3402f2821',
      name: 'Bot',
      role: 'bot',
    },
    serviceUrl: 'http://localhost:50438',
  },
  {
    type: 'message',
    serviceUrl: 'http://localhost:50438',
    channelId: 'emulator',
    from: {
      id: '3fe76690-5802-11ea-bb6a-31d3402f2821',
      name: 'Bot',
      role: 'bot',
    },
    conversation: {
      id: '4aa44580-5802-11ea-bb6a-31d3402f2821|livechat',
    },
    recipient: {
      id: '',
      role: 'user',
    },
    text: 'Is this okay?',
    inputHint: 'expectingInput',
    suggestedActions: {
      actions: [
        {
          type: 'imBack',
          title: 'Yes',
          value: 'Yes',
        },
        {
          type: 'imBack',
          title: 'No',
          value: 'No',
        },
      ],
    },
    replyToId: '5bcaaed1-5802-11ea-afe8-c12c2746983b',
    id: '5bccd1b0-5802-11ea-afe8-c12c2746983b',
    localTimestamp: '2020-02-25T11:09:34-08:00',
    timestamp: '2020-02-25T19:09:34.154Z',
    locale: 'en-US',
  },
  {
    channelData: {
      clientActivityID: '1582657775458y5rx1hagzw',
      clientTimestamp: '2020-02-25T19:09:35.458Z',
    },
    text: 'Yes',
    textFormat: 'plain',
    type: 'message',
    channelId: 'emulator',
    from: {
      id: 'r_1582657745',
      name: 'User',
      role: 'user',
    },
    locale: 'en-US',
    timestamp: '2020-02-25T19:09:35.520Z',
    conversation: {
      id: '4aa44580-5802-11ea-bb6a-31d3402f2821|livechat',
    },
    id: '5c9d1a00-5802-11ea-afe8-c12c2746983b',
    localTimestamp: '2020-02-25T11:09:35-08:00',
    recipient: {
      id: '3fe76690-5802-11ea-bb6a-31d3402f2821',
      name: 'Bot',
      role: 'bot',
    },
    serviceUrl: 'http://localhost:50438',
  },
  {
    type: 'message',
    serviceUrl: 'http://localhost:50438',
    channelId: 'emulator',
    from: {
      id: '3fe76690-5802-11ea-bb6a-31d3402f2821',
      name: 'Bot',
      role: 'bot',
    },
    conversation: {
      id: '4aa44580-5802-11ea-bb6a-31d3402f2821|livechat',
    },
    recipient: {
      id: '',
      role: 'user',
    },
    text: 'I have your mode of transport as Car and your name as tester and your age as 29.',
    inputHint: 'acceptingInput',
    replyToId: '5c9d1a00-5802-11ea-afe8-c12c2746983b',
    id: '5c9e5280-5802-11ea-afe8-c12c2746983b',
    localTimestamp: '2020-02-25T11:09:35-08:00',
    timestamp: '2020-02-25T19:09:35.528Z',
    locale: 'en-US',
  },
  {
    type: 'message',
    serviceUrl: 'http://localhost:50438',
    channelId: 'emulator',
    from: {
      id: '3fe76690-5802-11ea-bb6a-31d3402f2821',
      name: 'Bot',
      role: 'bot',
    },
    conversation: {
      id: '4aa44580-5802-11ea-bb6a-31d3402f2821|livechat',
    },
    recipient: {
      id: '',
      role: 'user',
    },
    attachmentLayout: 'list',
    text: 'This is your profile picture.',
    inputHint: 'acceptingInput',
    attachments: [
      {
        contentType: 'image/jpeg',
        name: 'IMG-2744.jpg',
        contentUrl: 'data:application/octet-stream;base64,/9j/',
      },
    ],
    replyToId: '5c9d1a00-5802-11ea-afe8-c12c2746983b',
    id: '5c9eeec0-5802-11ea-afe8-c12c2746983b',
    localTimestamp: '2020-02-25T11:09:35-08:00',
    timestamp: '2020-02-25T19:09:35.532Z',
    locale: 'en-US',
  },
];

export const replayData = {
  incomingActivities: [
    {
      id: '6675c360-5816-11ea-9b99-bfd896d3b875',
    },
    {
      id: '6941dbb0-5816-11ea-9b99-bfd896d3b875',
      replyToId: '69411860-5816-11ea-9b99-bfd896d3b875',
      test: 'Please enter your mode of transport.',
    },
    {
      id: '69411860-5816-11ea-9b99-bfd896d3b875',
      test: 'Hi',
    },
    {
      id: '69fd3c70-5816-11ea-9b99-bfd896d3b875',
      replyToId: '69fc7920-5816-11ea-9b99-bfd896d3b875',
      test: 'Please enter your name.',
    },
    {
      id: '69fc7920-5816-11ea-9b99-bfd896d3b875',
      test: 'Car',
    },
    {
      id: '6bdf69f0-5816-11ea-9b99-bfd896d3b875',
      replyToId: '6bde5880-5816-11ea-9b99-bfd896d3b875',
      test: 'Thanks tester.',
    },
    {
      id: '6be00630-5816-11ea-9b99-bfd896d3b875',
      replyToId: '6bde5880-5816-11ea-9b99-bfd896d3b875',
      test: 'Do you want to give your age?',
    },
    {
      id: '6bde5880-5816-11ea-9b99-bfd896d3b875',
      test: 'tester',
    },
    {
      id: '6ce31e50-5816-11ea-9b99-bfd896d3b875',
      replyToId: '6ce12280-5816-11ea-9b99-bfd896d3b875',
      test: 'Please enter your age.',
    },
    {
      id: '6ce12280-5816-11ea-9b99-bfd896d3b875',
      test: 'Yes',
    },
    {
      id: '6e8842d0-5816-11ea-9b99-bfd896d3b875',
      replyToId: '6e86bc30-5816-11ea-9b99-bfd896d3b875',
      test: 'I have your age as 30.',
    },
    {
      id: '6e88b800-5816-11ea-9b99-bfd896d3b875',
      replyToId: '6e86bc30-5816-11ea-9b99-bfd896d3b875',
      test: 'Please attach a profile picture (or type any message to skip).',
    },
    {
      id: '6e86bc30-5816-11ea-9b99-bfd896d3b875',
      test: '30',
    },
    {
      id: '73573000-5816-11ea-9b99-bfd896d3b875',
      replyToId: '73555b41-5816-11ea-9b99-bfd896d3b875',
      test: 'Is this okay?',
    },
    {
      id: '74f7c0a0-5816-11ea-9b99-bfd896d3b875',
      replyToId: '74f6af30-5816-11ea-9b99-bfd896d3b875',
      test: 'I have your mode of transport as Car and your name as tester and your age as 30.',
    },
    {
      id: '74f835d0-5816-11ea-9b99-bfd896d3b875',
      replyToId: '74f6af30-5816-11ea-9b99-bfd896d3b875',
      test: 'This is your profile picture.',
    },
    {
      id: '74f6af30-5816-11ea-9b99-bfd896d3b875',
      test: 'Yes',
    },
  ],
  postActivitiesSlots: [1, 3, 5, 8, 10, 13, 14],
};

export const replayScenarios = [
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
