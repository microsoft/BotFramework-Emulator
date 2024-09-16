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

import { Activity } from 'botframework-schema';

import { BotEndpoint } from './botEndpoint';
import { Conversation } from './conversation';

const mockTranscript = [
  {
    type: 'activity add',
    activity: {
      type: 'conversationUpdate',
      membersAdded: [
        {
          id: '5e1f1c4c-6a89-4880-8db0-0f222c07ae9a',
          name: 'User',
        },
        {
          id: '1',
          name: 'Bot',
        },
      ],
      channelId: 'emulator',
      conversation: {
        id: 'b94a54f0-1f4d-11e9-a14a-49165b6799aa|livechat',
      },
      id: 'b9c48e00-1f4d-11e9-bad7-9740f2a4e769',
      localTimestamp: '2019-01-23T12:30:30-08:00',
      recipient: {
        id: '1',
        name: 'Bot',
        role: 'bot',
      },
      timestamp: '2019-01-23T20:30:30.111Z',
      from: {
        id: '5e1f1c4c-6a89-4880-8db0-0f222c07ae9a',
        name: 'User',
      },
      locale: 'en-us',
      serviceUrl: 'https://3a469f6b.mytunnel.io',
    },
  },
  {
    type: 'activity add',
    activity: {
      type: 'message',
      serviceUrl: 'https://3a469f6b.mytunnel.io',
      channelId: 'emulator',
      from: {
        id: '1',
        name: 'Bot',
        role: 'bot',
      },
      conversation: {
        id: 'b94a54f0-1f4d-11e9-a14a-49165b6799aa|livechat',
      },
      recipient: {
        id: '5e1f1c4c-6a89-4880-8db0-0f222c07ae9a',
        role: 'user',
      },
      text: '[conversationUpdate event detected]',
      inputHint: 'acceptingInput',
      replyToId: 'b9c48e00-1f4d-11e9-bad7-9740f2a4e769',
      id: 'bce46ba0-1f4d-11e9-bad7-9740f2a4e769',
      localTimestamp: '2019-01-23T12:30:35-08:00',
      timestamp: '2019-01-23T20:30:35.354Z',
      locale: 'en-us',
    },
  },
  {
    type: 'activity add',
    activity: {
      type: 'message',
      serviceUrl: 'https://3a469f6b.mytunnel.io',
      channelId: 'emulator',
      from: {
        id: '1',
        name: 'Bot',
        role: 'bot',
      },
      conversation: {
        id: 'b94a54f0-1f4d-11e9-a14a-49165b6799aa|livechat',
      },
      recipient: {
        id: '5e1f1c4c-6a89-4880-8db0-0f222c07ae9a',
        role: 'user',
      },
      text: '[conversationUpdate event detected]',
      inputHint: 'acceptingInput',
      replyToId: 'b9c50330-1f4d-11e9-bad7-9740f2a4e769',
      id: 'bde42860-1f4d-11e9-bad7-9740f2a4e769',
      localTimestamp: '2019-01-23T12:30:37-08:00',
      timestamp: '2019-01-23T20:30:37.030Z',
      locale: 'en-us',
    },
  },
];

const mockActivity = {
  type: 'conversationUpdate',
  membersAdded: [
    {
      id: '5e1f1c4c-6a89-4880-8db0-0f222c07ae9a',
      name: 'User',
    },
    {
      id: '1',
      name: 'Bot',
    },
  ],
} as Activity;

jest.mock('moment', () => () => ({
  format: () => '2020-02-24T14:55:52-08:00',
  toISOString: () => '2020-02-24T14:55:52-08:00',
}));

const mockUserActivity = {
  type: 'message',
  serviceUrl: 'https://70d0a286.mytunnel.io',
  channelId: 'emulator',
  from: {
    id: '1',
    name: 'Bot',
    role: 'bot',
  },
  conversation: {
    id: '95d86570-1f5c-11e9-b075-774f2d8ccec5|livechat',
  },
  recipient: {
    id: '5e1f1c4c-6a89-4880-8db0-0f222c07ae9a',
    name: 'User',
  },
  text: '[conversationUpdate event detected]',
  inputHint: 'acceptingInput',
  replyToId: '96547340-1f5c-11e9-9b39-f387f690c8a4',
  id: null,
}; //  as Activity;

describe('Conversation class', () => {
  let botEndpointBotId;
  let botEndpoint;
  let conversation: Conversation;
  let conversationId;
  let user: any;
  const fetch = (function() {
    const fetch = () => {
      return {
        ok: true,
        json: async () => ({}),
        text: async () => '{}',
      };
    };
    (fetch as any).Headers = class {};
    (fetch as any).Response = class {};
    return fetch as any;
  })();

  beforeEach(() => {
    botEndpointBotId = 'someBotEndpointBotId';
    botEndpoint = new BotEndpoint('123', botEndpointBotId, 'http://mytunnel', null, null, null, null, { fetch });
    const mockEmulatorServer: any = {
      getServiceUrl: jest.fn().mockResolvedValue('http://localhost'),
      logger: {
        logActivity: jest.fn(),
        logException: jest.fn(),
        logMessage: jest.fn(),
      },
      state: {
        currentUserId: 'someUserId',
        locale: 'en-us',
        users: {
          usersById: jest.fn(() => undefined),
        },
      },
    };
    conversationId = 'someConversationId';
    user = { id: 'someUserId' };
    conversation = new Conversation(mockEmulatorServer, botEndpoint, conversationId, user, 'livechat');
  });

  it('should feed activities', () => {
    const fedActivities = [];
    const mockAddActivityToQueue = jest.fn(activity => {
      fedActivities.push(activity);
    });
    (conversation as any).addActivityToQueue = mockAddActivityToQueue;

    const activities: any = [
      {
        conversation: {},
        type: 'event',
        from: { role: 'bot' },
        recipient: { role: 'user', id: 'userId' },
      },
      {
        conversation: {},
        type: 'message',
        from: { role: 'user' },
        recipient: { role: 'bot', id: 'botId' },
      },
      {
        conversation: {},
        type: 'messageReaction',
        from: { role: 'bot', id: 'botId' },
        recipient: { role: 'user' },
      },
      {
        conversation: {},
        type: 'typing',
        from: { role: 'user', id: 'userId' },
        recipient: { role: 'bot' },
      },
    ];

    const preppedActivities = conversation.prepTranscriptActivities(activities);

    expect(preppedActivities).toEqual([
      {
        conversation: { id: 'someConversationId' },
        type: 'event',
        from: { role: 'bot' },
        recipient: { role: 'user', id: 'someUserId' },
      },
      {
        conversation: { id: 'someConversationId' },
        type: 'message',
        from: { role: 'user' },
        recipient: { role: 'bot', id: 'someBotEndpointBotId' },
      },
      {
        conversation: { id: 'someConversationId' },
        type: 'messageReaction',
        from: { role: 'bot', id: 'someBotEndpointBotId' },
        recipient: { role: 'user' },
      },
      {
        conversation: { id: 'someConversationId' },
        type: 'typing',
        from: { role: 'user', id: 'someUserId' },
        recipient: { role: 'bot' },
      },
    ]);
  });

  it('should get the transcript from the conversation', async () => {
    (conversation as any).transcript = mockTranscript;
    const transcripts = await conversation.getTranscript();
    expect(transcripts.length).toBe(3);
    let i = transcripts.length;
    while (i--) {
      expect(transcripts[i]).toEqual(mockTranscript[i].activity);
    }
  });

  fit('should post an activity to the bot', async () => {
    const formattedDataStr = '2020-02-24T14:55:52-08:00';
    const isoDateStr = '2020-02-24T14:55:52-08:00';
    const result = await conversation.postActivityToBot(mockActivity, true);

    const postedActivity: Activity = result.updatedActivity;
    expect(postedActivity.localTimestamp).toBe(formattedDataStr);
    expect(postedActivity.timestamp).toBe(isoDateStr);
  });

  it('should send a conversation update', async () => {
    await conversation.postActivityToBot(mockActivity, true);
    const spy = jest.spyOn(conversation, 'postActivityToBot').mockResolvedValueOnce({
      response: {
        status: 200,
      },
      statusCode: 200,
    });
    await conversation.sendConversationUpdate(mockActivity.membersAdded, mockActivity.membersAdded);
    expect(spy).toHaveBeenCalledWith(
      {
        membersAdded: [
          {
            id: '5e1f1c4c-6a89-4880-8db0-0f222c07ae9a',
            name: 'User',
          },
          {
            id: '1',
            name: 'Bot',
          },
        ],
        membersRemoved: [
          { id: '5e1f1c4c-6a89-4880-8db0-0f222c07ae9a', name: 'User' },
          { id: '1', name: 'Bot' },
        ],
        type: 'conversationUpdate',
      },
      false
    );
  });

  it('should update an activity', async () => {
    let result = await conversation.postActivityToBot(mockActivity, true);
    const updatedActivity = { id: result.activityId, test: 'revised activity' };
    result = await conversation.updateActivity(updatedActivity);
    expect(result.id).toBe(updatedActivity.id);
  });

  it('should delete an activity', async () => {
    const result = await conversation.postActivityToBot(mockActivity, true);
    let activityDeleted = false;
    conversation.on('deleteactivity', () => (activityDeleted = true));
    await conversation.deleteActivity(result.activityId);
    expect(activityDeleted).toBeTruthy();
  });

  it('should send Contact Removed', async () => {
    await conversation.sendContactRemoved();
    expect((conversation as any).transcript[0].activity.action).toBe('remove');
  });

  it('should send the typing activity', async () => {
    await conversation.sendTyping();
    expect((conversation as any).transcript[1].activity.type).toBe('typing');
  });

  it('should send the ping activity', async () => {
    await conversation.sendPing();
    expect((conversation as any).transcript[1].activity.type).toBe('ping');
  });

  it('should send the delete user data activity', async () => undefined);
});
