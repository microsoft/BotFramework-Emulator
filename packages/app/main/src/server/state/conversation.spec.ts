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

import { TokenCache } from '../routes/channel/userToken/tokenCache';

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
      serviceUrl: 'https://3a469f6b.ngrok.io',
    },
  },
  {
    type: 'activity add',
    activity: {
      type: 'message',
      serviceUrl: 'https://3a469f6b.ngrok.io',
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
      serviceUrl: 'https://3a469f6b.ngrok.io',
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
};

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
    botEndpoint = new BotEndpoint('123', botEndpointBotId, 'http://ngrok', null, null, null, null, { fetch });
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
          usersById: jest.fn(() => {}),
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

  it('should post an activity to a bot (bot is remote, but the service url is local)', async () => {
    const mockEmulatorServer: any = {
      getServiceUrl: jest.fn().mockResolvedValue('http://localhost:52738'),
      logger: {
        logMessage: jest.fn(),
      },
      state: {
        locale: 'en-us',
      },
    };
    const localMockActivity: any = {
      from: {
        name: 'User',
        id: 'user1',
      },
      id: 'activity1',
      recipient: {}, // should be filled in by function
    };
    const mockBotEndpoint: any = {
      botId: 'bot1',
      botUrl: 'https://www.mybot.com/api/messages',
      fetchWithAuth: jest.fn().mockResolvedValue({ status: 200 }),
    };
    const postageSpy = jest
      .spyOn(conversation, 'postage')
      .mockReturnValue({ ...localMockActivity, hasBeenPosted: true });
    const addActivityToQueueSpy = jest.spyOn(conversation as any, 'addActivityToQueue').mockImplementation(jest.fn());
    const emitSpy = jest.spyOn(conversation, 'emit').mockImplementation(jest.fn());
    conversation.botEndpoint = mockBotEndpoint;
    conversation.emulatorServer = mockEmulatorServer;
    const result = await conversation.postActivityToBot(localMockActivity, true);

    const processedActivity = {
      ...localMockActivity,
      channelData: {
        emulatorUrl: 'http://localhost:52738',
      },
      hasBeenPosted: true,
      locale: 'en-us',
      recipient: {
        name: 'Bot',
        role: 'bot',
      },
      serviceUrl: 'http://localhost:52738',
    };
    expect(mockBotEndpoint.fetchWithAuth).toHaveBeenCalledWith(mockBotEndpoint.botUrl, jasmine.any(Object));
    expect(addActivityToQueueSpy).toHaveBeenCalledWith(processedActivity);
    expect(emitSpy).toHaveBeenCalledWith('transcriptupdate');
    expect(result).toEqual({
      activityId: 'activity1',
      response: { status: 200 },
      statusCode: 200,
    });
    expect(mockEmulatorServer.logger.logMessage).toHaveBeenCalledTimes(3);

    postageSpy.mockRestore();
    addActivityToQueueSpy.mockRestore();
    emitSpy.mockRestore();
  });

  it('should post an activity to a bot with a specified bot location (skill)', async () => {
    const mockEmulatorServer: any = {
      getServiceUrl: jest.fn().mockResolvedValue('https://ngrok.io:52738'),
      logger: {
        logMessage: jest.fn(),
      },
      state: {
        locale: 'en-us',
      },
    };
    const localMockActivity: any = {
      from: {
        name: 'User',
        id: 'user1',
      },
      id: 'activity1',
      recipient: {}, // should be filled in by function
    };
    const mockBotEndpoint: any = {
      botId: 'bot1',
      botUrl: 'https://www.mybot.com/api/messages',
      fetchWithAuth: jest.fn().mockResolvedValue({ status: 200 }),
    };
    const postageSpy = jest
      .spyOn(conversation, 'postage')
      .mockReturnValue({ ...localMockActivity, hasBeenPosted: true });
    const addActivityToQueueSpy = jest.spyOn(conversation as any, 'addActivityToQueue').mockImplementation(jest.fn());
    const emitSpy = jest.spyOn(conversation, 'emit').mockImplementation(jest.fn());
    conversation.botEndpoint = mockBotEndpoint;
    conversation.emulatorServer = mockEmulatorServer;
    const result = await conversation.postActivityToBot(
      localMockActivity,
      true,
      'https://www.myskillbot.com/api/messages'
    );

    const processedActivity = {
      ...localMockActivity,
      channelData: {
        emulatorUrl: 'https://ngrok.io:52738',
      },
      hasBeenPosted: true,
      locale: 'en-us',
      recipient: {
        name: 'Bot',
        role: 'bot',
      },
      serviceUrl: 'https://ngrok.io:52738',
    };
    expect(mockBotEndpoint.fetchWithAuth).toHaveBeenCalledWith(
      'https://www.myskillbot.com/api/messages',
      jasmine.any(Object)
    );
    expect(addActivityToQueueSpy).toHaveBeenCalledWith(processedActivity);
    expect(emitSpy).toHaveBeenCalledWith('transcriptupdate');
    expect(result).toEqual({
      activityId: 'activity1',
      response: { status: 200 },
      statusCode: 200,
    });

    postageSpy.mockRestore();
    addActivityToQueueSpy.mockRestore();
    emitSpy.mockRestore();
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

  it('should send Contact added', async () => {
    const postActivityToBotSpy = jest.spyOn(conversation, 'postActivityToBot').mockResolvedValueOnce(true);
    const emitSpy = jest.spyOn(conversation, 'emit');
    await conversation.sendContactAdded();

    expect(postActivityToBotSpy).toHaveBeenCalledWith({ action: 'add', type: 'contactRelationUpdate' }, false);
    expect((conversation as any).transcript).toHaveLength(1);
    expect(emitSpy).toHaveBeenCalledWith('transcriptupdate');
  });

  it('should log an exception when failing to send Contact added', async () => {
    jest.spyOn(conversation, 'postActivityToBot').mockRejectedValue(new Error('Something went wrong.'));
    const emitSpy = jest.spyOn(conversation, 'emit');
    await conversation.sendContactAdded();

    expect(conversation.emulatorServer.logger.logException).toHaveBeenCalledWith(
      conversation.conversationId,
      new Error('Something went wrong.')
    );
    expect((conversation as any).transcript).toHaveLength(1);
    expect(emitSpy).toHaveBeenCalledWith('transcriptupdate');
  });

  it('should send Contact removed', async () => {
    const postActivityToBotSpy = jest.spyOn(conversation, 'postActivityToBot').mockResolvedValueOnce(true);
    const emitSpy = jest.spyOn(conversation, 'emit');
    await conversation.sendContactRemoved();

    expect(postActivityToBotSpy).toHaveBeenCalledWith({ action: 'remove', type: 'contactRelationUpdate' }, false);
    expect((conversation as any).transcript).toHaveLength(1);
    expect(emitSpy).toHaveBeenCalledWith('transcriptupdate');
  });

  it('should log an exception when failing to send Contact removed', async () => {
    jest.spyOn(conversation, 'postActivityToBot').mockRejectedValue(new Error('Something went wrong.'));
    const emitSpy = jest.spyOn(conversation, 'emit');
    await conversation.sendContactRemoved();

    expect(conversation.emulatorServer.logger.logException).toHaveBeenCalledWith(
      conversation.conversationId,
      new Error('Something went wrong.')
    );
    expect((conversation as any).transcript).toHaveLength(1);
    expect(emitSpy).toHaveBeenCalledWith('transcriptupdate');
  });

  it('should send typing', async () => {
    const postActivityToBotSpy = jest.spyOn(conversation, 'postActivityToBot').mockResolvedValueOnce(true);
    const emitSpy = jest.spyOn(conversation, 'emit');
    await conversation.sendTyping();

    expect(postActivityToBotSpy).toHaveBeenCalledWith({ type: 'typing' }, false);
    expect((conversation as any).transcript).toHaveLength(1);
    expect(emitSpy).toHaveBeenCalledWith('transcriptupdate');
  });

  it('should log an exception when failing to send typing', async () => {
    jest.spyOn(conversation, 'postActivityToBot').mockRejectedValue(new Error('Something went wrong.'));
    const emitSpy = jest.spyOn(conversation, 'emit');
    await conversation.sendTyping();

    expect(conversation.emulatorServer.logger.logException).toHaveBeenCalledWith(
      conversation.conversationId,
      new Error('Something went wrong.')
    );
    expect((conversation as any).transcript).toHaveLength(1);
    expect(emitSpy).toHaveBeenCalledWith('transcriptupdate');
  });

  it('should send ping', async () => {
    const postActivityToBotSpy = jest.spyOn(conversation, 'postActivityToBot').mockResolvedValueOnce(true);
    const emitSpy = jest.spyOn(conversation, 'emit');
    await conversation.sendPing();

    expect(postActivityToBotSpy).toHaveBeenCalledWith({ type: 'ping' }, false);
    expect((conversation as any).transcript).toHaveLength(1);
    expect(emitSpy).toHaveBeenCalledWith('transcriptupdate');
  });

  it('should log an exception when failing to send ping', async () => {
    jest.spyOn(conversation, 'postActivityToBot').mockRejectedValue(new Error('Something went wrong.'));
    const emitSpy = jest.spyOn(conversation, 'emit');
    await conversation.sendPing();

    expect(conversation.emulatorServer.logger.logException).toHaveBeenCalledWith(
      conversation.conversationId,
      new Error('Something went wrong.')
    );
    expect((conversation as any).transcript).toHaveLength(1);
    expect(emitSpy).toHaveBeenCalledWith('transcriptupdate');
  });

  it('should send delete user data', async () => {
    const postActivityToBotSpy = jest.spyOn(conversation, 'postActivityToBot').mockResolvedValueOnce(true);
    const emitSpy = jest.spyOn(conversation, 'emit');
    await conversation.sendDeleteUserData();

    expect(postActivityToBotSpy).toHaveBeenCalledWith({ type: 'deleteUserData' }, false);
    expect((conversation as any).transcript).toHaveLength(1);
    expect(emitSpy).toHaveBeenCalledWith('transcriptupdate');
  });

  it('should log an exception when failing to send delete user data', async () => {
    jest.spyOn(conversation, 'postActivityToBot').mockRejectedValue(new Error('Something went wrong.'));
    const emitSpy = jest.spyOn(conversation, 'emit');
    await conversation.sendDeleteUserData();

    expect(conversation.emulatorServer.logger.logException).toHaveBeenCalledWith(
      conversation.conversationId,
      new Error('Something went wrong.')
    );
    expect((conversation as any).transcript).toHaveLength(1);
    expect(emitSpy).toHaveBeenCalledWith('transcriptupdate');
  });

  it('should send a token response', async () => {
    const mockUser: any = {
      id: 'someUserId',
    };
    const mockChildBotLocation = 'http://localhost:3978/some/skill/api/messages';
    conversation.childBotLocation = mockChildBotLocation;
    conversation.user = mockUser;
    const mockConnectionName = 'oauth:connection';
    const mockToken = 'someToken';
    const addTokenToCacheSpy = jest.spyOn(TokenCache, 'addTokenToCache').mockImplementation(() => null);
    const postActivityToBotSpy = jest.spyOn(conversation, 'postActivityToBot').mockResolvedValue(null);
    await conversation.sendTokenResponse(mockConnectionName, mockToken, false);

    expect(addTokenToCacheSpy).toHaveBeenCalledWith(botEndpointBotId, mockUser.id, mockConnectionName, mockToken);
    expect(postActivityToBotSpy).toHaveBeenCalledWith(
      {
        type: 'event',
        name: 'tokens/response',
        value: {
          connectionName: mockConnectionName,
          token: mockToken,
        },
      },
      false,
      mockChildBotLocation
    );
    expect(conversation.childBotLocation).toBe(undefined);
    addTokenToCacheSpy.mockRestore();
    postActivityToBotSpy.mockRestore();
  });
});
