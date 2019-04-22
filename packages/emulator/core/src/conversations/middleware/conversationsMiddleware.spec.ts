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
import { AttachmentData, ConversationParameters, GenericActivity } from '@bfemulator/sdk-shared';
import * as HttpStatus from 'http-status-codes';

import { BotEmulator } from '../../botEmulator';
import Attachments from '../../facility/attachments';
import BotEndpoint from '../../facility/botEndpoint';
import Conversation from '../../facility/conversation';
import ConversationSet from '../../facility/conversationSet';
import Endpoints from '../../facility/endpointSet';
import Users from '../../facility/users';

import createConversation from './createConversation';
import deleteActivity from './deleteActivity';
import fetchConversation from './fetchConversation';
import getActivityMembers from './getActivityMembers';
import getBotEndpoint from './getBotEndpoint';
import replyToActivity from './replyToActivity';
import sendActivityToConversation from './sendActivityToConversation';
import sendHistoryToConversation from './sendHistoryToConversation';
import updateActivity from './updateActivity';
import uploadAttachment from './uploadAttachment';
import createFetchConversationMiddleware from './getConversations';

describe('The conversations middleware', () => {
  let emulator: BotEmulator;
  let res;
  beforeEach(() => {
    res = {
      send: () => null,
      end: () => null,
      contentType: '',
    };
    emulator = createEmulatorUtil();
  });

  it('should create a new conversation', () => {
    const bot = { role: 'bot', name: 'thebot', id: '456' };
    const req = {
      botEndpoint: new BotEndpoint('12', '456', 'http://localhost:12345', '', '', false, '', {}),
      body: {
        members: [{ id: '456', name: 'emulator', role: 'user' }],
        bot,
        conversationId: '007',
        activity: {},
      } as ConversationParameters,
    };
    // Bind to an object with a botId property.
    // TODO - determine if this is a potential defect.
    const createConversationMiddleware = createConversation.bind({
      botId: bot.id,
    })(emulator);
    const sendSpy = jest.spyOn(res, 'send');
    createConversationMiddleware(req as any, res, (() => null) as any);

    expect(sendSpy).toHaveBeenCalledWith(HttpStatus.OK, {
      activityId: jasmine.any(String),
      id: '007|livechat',
    });

    const newConversation = emulator.facilities.conversations.conversationById('007|livechat');
    expect(newConversation).toBeTruthy();
    expect(newConversation.botEndpoint).toEqual(req.botEndpoint);
    expect(newConversation.user).toEqual({ id: '456', name: 'emulator' });
    expect(newConversation.members).toEqual([{ id: '456', name: 'Bot' }, { id: '456', name: 'emulator' }]);
  });

  it('should delete an activity', () => {
    // create the conversation with an activity
    const bot = { role: 'bot', name: 'thebot', id: '456' };
    let req: any = {
      botEndpoint: new BotEndpoint('12', '456', 'http://localhost:12345', '', '', false, '', {}),
      body: {
        members: [{ id: '456', name: 'emulator', role: 'user' }],
        bot,
        conversationId: '007',
        activity: {},
      } as ConversationParameters,
    };
    const createConversationMiddleware = createConversation.bind({
      botId: bot.id,
    })(emulator);
    let activity = { activityId: '' };
    res.send = (_, actvty) => (activity = actvty);
    createConversationMiddleware(req as any, res, (() => null) as any);
    const conversation = emulator.facilities.conversations.conversationById('007|livechat');
    req = {
      params: {
        activityId: activity.activityId,
      },
      conversation,
    };
    expect((conversation as any).activities.length).toBe(1);
    const deleteActivityMiddleware = deleteActivity(emulator);
    const sendSpy = jest.spyOn(res, 'send');
    deleteActivityMiddleware(req, res, (() => null) as any);

    expect(sendSpy).toHaveBeenCalledWith(HttpStatus.OK);
    expect((conversation as any).activities.length).toBeFalsy();
  });

  it('should fetch a conversation', () => {
    const targetConversation = createConversationUtil(emulator);

    const req = {
      params: {
        conversationId: '007|livechat',
      },
      conversation: null,
    };

    const fetchConversationMiddleware = fetchConversation(emulator);
    fetchConversationMiddleware(req as any, res, (() => null) as any);
    expect(req.conversation).toBe(targetConversation);
  });

  it('should get activity members', () => {
    const conversation = createConversationUtil(emulator);

    const getActivityMembersMiddleware = getActivityMembers(emulator);
    const sendSpy = jest.spyOn(res, 'send');
    const req = {
      conversation,
    };

    getActivityMembersMiddleware(req as any, res, (() => null) as any);
    expect(sendSpy).toHaveBeenCalledWith(HttpStatus.OK, conversation.members);
  });

  it('should reply to an activity', async () => {
    const conversation = createConversationUtil(emulator);
    const mockActivity = {
      conversation: {
        id: '007',
      },
      id: '1',
      recipient: {
        id: 'jopVZjYqyE3A5EnA8dYrlA+Mubw=',
        name: 'cafebot',
        role: 'bot',
      },
      from: {
        id: 'vY4U6Daqs1rrWK5uIDlp8eFHHq0=',
      },
      timestamp: '2018-08-28T16:34:49.100Z',
      type: 'conversationUpdate',
      channelId: 'chatdown',
      membersAdded: [
        {
          id: 'jopVZjYqyE3A5EnA8dYrlA+Mubw=',
          name: 'cafebot',
          role: 'bot',
        },
      ],
      membersRemoved: [],
    };
    const replyToActivityMiddleware = replyToActivity(emulator);
    const req = {
      conversation,
      body: mockActivity,
      params: {
        activityId: '456',
      },
      headers: {
        authorization: Buffer.from('authtoken').toString('base64'),
      },
    };
    const sendSpy = jest.spyOn(res, 'send');
    await replyToActivityMiddleware(req as any, res, (() => null) as any);
    const { activities } = conversation.getActivitiesSince(0);
    expect(activities.length).toBe(1);
    expect(activities[0].replyToId).toBe('456');
    expect(sendSpy).toHaveBeenCalledWith(HttpStatus.OK, {
      id: activities[0].id,
    });
  });

  it('should send an activity to the conversation', () => {
    const conversation = createConversationUtil(emulator);
    const mockActivity = {
      conversation: {
        id: '007',
      },
      id: '1',
      recipient: {
        id: 'jopVZjYqyE3A5EnA8dYrlA+Mubw=',
        name: 'cafebot',
        role: 'bot',
      },
      from: {
        id: 'vY4U6Daqs1rrWK5uIDlp8eFHHq0=',
      },
      timestamp: '2018-08-28T16:34:49.100Z',
      type: 'conversationUpdate',
      channelId: 'chatdown',
      membersAdded: [
        {
          id: 'jopVZjYqyE3A5EnA8dYrlA+Mubw=',
          name: 'cafebot',
          role: 'bot',
        },
      ],
      membersRemoved: [],
    };
    const req = {
      conversation,
      body: mockActivity,
      params: {
        activityId: '1234',
      },
    };
    const sendActivityMiddleware = sendActivityToConversation(emulator);
    const sendSpy = jest.spyOn(res, 'send');
    sendActivityMiddleware(req as any, res, (() => null) as any);
    const { activities } = conversation.getActivitiesSince(0);
    expect(activities.length).toBe(1);
    expect(activities[0].replyToId).toBe('1234');
    expect(sendSpy).toHaveBeenCalledWith(HttpStatus.OK, {
      id: activities[0].id,
    });
  });

  it('should send history to the conversation', () => {
    const mockActivities = [
      {
        type: 'conversationUpdate',
        membersAdded: [
          {
            id: 'http://localhost:3978/api/messages',
            name: 'Bot',
          },
        ],
        channelId: 'emulator',
        conversation: {
          id: '6e8b5950-bcec-11e8-97ca-bd586926880a|livechat',
        },
        id: '6e9e1e00-bcec-11e8-a0e5-939fd8c687fd',
        localTimestamp: '2018-09-20T08:47:08-07:00',
        recipient: {
          id: 'http://localhost:3978/api/messages',
          name: 'Bot',
          role: 'bot',
        },
        timestamp: '2018-09-20T15:47:08.895Z',
        from: {
          id: '0a441b55-d1d6-4015-bbb4-2e7f44fa9f42',
          name: 'User',
        },
        serviceUrl: 'https://a457e760.ngrok.io',
      },
      {
        type: 'conversationUpdate',
        membersAdded: [
          {
            id: '0a441b55-d1d6-4015-bbb4-2e7f44fa9f42',
            name: 'User',
          },
        ],
        channelId: 'emulator',
        conversation: {
          id: '6e8b5950-bcec-11e8-97ca-bd586926880a|livechat',
        },
        id: '6e9fcbb0-bcec-11e8-a0e5-939fd8c687fd',
        localTimestamp: '2018-09-20T08:47:08-07:00',
        recipient: {
          id: 'http://localhost:3978/api/messages',
          name: 'Bot',
          role: 'bot',
        },
        timestamp: '2018-09-20T15:47:08.907Z',
        from: {
          id: '0a441b55-d1d6-4015-bbb4-2e7f44fa9f42',
          name: 'User',
        },
        serviceUrl: 'https://a457e760.ngrok.io',
      },
      {
        type: 'message',
        serviceUrl: 'https://a457e760.ngrok.io',
        channelId: 'emulator',
        from: {
          id: 'http://localhost:3978/api/messages',
          name: 'Bot',
          role: 'bot',
        },
        conversation: {
          id: '6e8b5950-bcec-11e8-97ca-bd586926880a|livechat',
        },
        recipient: {
          id: '0a441b55-d1d6-4015-bbb4-2e7f44fa9f42',
          role: 'user',
        },
        text: 'Hello, I am the Contoso Cafe Bot!',
        inputHint: 'acceptingInput',
        replyToId: '6e9fcbb0-bcec-11e8-a0e5-939fd8c687fd',
        id: '6edf1ea0-bcec-11e8-a0e5-939fd8c687fd',
        localTimestamp: '2018-09-20T08:47:09-07:00',
        timestamp: '2018-09-20T15:47:09.322Z',
      },
      {
        type: 'message',
        serviceUrl: 'https://a457e760.ngrok.io',
        channelId: 'emulator',
        from: {
          id: 'http://localhost:3978/api/messages',
          name: 'Bot',
          role: 'bot',
        },
        conversation: {
          id: '6e8b5950-bcec-11e8-97ca-bd586926880a|livechat',
        },
        recipient: {
          id: '0a441b55-d1d6-4015-bbb4-2e7f44fa9f42',
          role: 'user',
        },
        text: 'I can help book a table, find cafe locations and more..',
        inputHint: 'acceptingInput',
        replyToId: '6e9fcbb0-bcec-11e8-a0e5-939fd8c687fd',
        id: '6f141151-bcec-11e8-a0e5-939fd8c687fd',
        localTimestamp: '2018-09-20T08:47:09-07:00',
        timestamp: '2018-09-20T15:47:09.669Z',
      },
      {
        type: 'message',
        serviceUrl: 'https://a457e760.ngrok.io',
        channelId: 'emulator',
        from: {
          id: 'http://localhost:3978/api/messages',
          name: 'Bot',
          role: 'bot',
        },
        conversation: {
          id: '6e8b5950-bcec-11e8-97ca-bd586926880a|livechat',
        },
        recipient: {
          id: '0a441b55-d1d6-4015-bbb4-2e7f44fa9f42',
          role: 'user',
        },
        attachments: [
          {
            contentType: 'application/vnd.microsoft.card.adaptive',
            content: {
              type: 'AdaptiveCard',
              horizontalAlignment: 'Center',
              separator: true,
              height: 'stretch',
              body: [
                {
                  type: 'ColumnSet',
                  horizontalAlignment: 'Center',
                  spacing: 'large',
                  height: 'stretch',
                  columns: [
                    {
                      type: 'Column',
                      spacing: 'large',
                      items: [
                        {
                          type: 'TextBlock',
                          size: 'extraLarge',
                          weight: 'bolder',
                          text: 'Contoso Cafe',
                        },
                        {
                          type: 'TextBlock',
                          size: 'Medium',
                          text: "Hello, I'm the Cafe bot! How can I be of help today?",
                          wrap: true,
                        },
                      ],
                    },
                    {
                      type: 'Column',
                      spacing: 'small',
                      items: [
                        {
                          type: 'Image',
                          horizontalAlignment: 'center',
                          url: 'http://contosocafeontheweb.azurewebsites.net/assets/contoso_logo_black.png',
                          size: 'medium',
                        },
                      ],
                      width: 'auto',
                    },
                  ],
                },
              ],
              actions: [
                {
                  type: 'Action.Submit',
                  title: 'Book table',
                  data: {
                    intent: 'Book_Table',
                  },
                },
                {
                  type: 'Action.Submit',
                  title: 'What can you do?',
                  data: {
                    intent: 'What_can_you_do',
                  },
                },
              ],
              $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
              version: '1.0',
            },
          },
        ],
        replyToId: '6e9fcbb0-bcec-11e8-a0e5-939fd8c687fd',
        id: '6f47f290-bcec-11e8-a0e5-939fd8c687fd',
        localTimestamp: '2018-09-20T08:47:10-07:00',
        timestamp: '2018-09-20T15:47:10.009Z',
      },
    ];
    const conversation = createConversationUtil(emulator);
    const req = {
      conversation,
      body: { activities: mockActivities },
    };
    const sendHistoryToConversationMiddleware = sendHistoryToConversation(emulator);
    const sendSpy = jest.spyOn(res, 'send');
    sendHistoryToConversationMiddleware(req as any, res, (() => null) as any);
    const { activities } = conversation.getActivitiesSince(0);
    expect(activities.length).toBe(5);
    activities.forEach((activity, index) => {
      expect(activity).toEqual({
        ...mockActivities[index],
        localTimestamp: jasmine.any(String),
      });
    });
    expect(sendSpy).toHaveBeenCalledWith(HttpStatus.OK, {
      id: jasmine.any(String),
    });
  });

  it('should update an activity', () => {
    const mockActivity = {
      conversation: {
        id: '007',
      },
      id: '1234',
      recipient: {
        id: 'jopVZjYqyE3A5EnA8dYrlA+Mubw=',
        name: 'cafebot',
        role: 'bot',
      },
      from: {
        id: 'vY4U6Daqs1rrWK5uIDlp8eFHHq0=',
      },
      attachments: [],
      timestamp: '2018-08-28T16:34:49.100Z',
      type: 'conversationUpdate',
      channelId: 'chatdown',
      membersAdded: [
        {
          id: 'jopVZjYqyE3A5EnA8dYrlA+Mubw=',
          name: 'cafebot',
          role: 'bot',
        },
      ],
      membersRemoved: [],
    };
    const conversation = createConversationUtil(emulator);
    const req = {
      conversation,
      body: mockActivity as any,
      params: {
        activityId: mockActivity.id,
      },
    };
    sendActivityToConversation(emulator)(req as any, res, (() => null) as any);
    const { activities } = conversation.getActivitiesSince(0);
    const [activity] = activities;
    const updateActivityMiddleware = updateActivity(emulator);
    req.body = {
      ...req.body,
      text: 'Hi there!',
      id: activity.id,
    } as GenericActivity;
    req.params.activityId = activity.id;

    const sendSpy = jest.spyOn(res, 'send');
    updateActivityMiddleware(req as any, res, (() => null) as any);

    expect(sendSpy).toHaveBeenCalledWith(HttpStatus.OK, {
      id: jasmine.any(String),
    });
    expect((conversation.getActivitiesSince(0).activities[0] as GenericActivity).text).toBe('Hi there!');
  });

  it('should upload an attachment', () => {
    const mockAttachment = {
      type: 'application/json',
      originalBase64: Buffer.from('{}').toString('base64'),
    } as AttachmentData;

    const uploadAttachmentMiddleware = uploadAttachment(emulator);
    const req = {
      body: mockAttachment,
    };

    const sendSpy = jest.spyOn(res, 'send');
    uploadAttachmentMiddleware(req as any, res, (() => null) as any);

    expect(sendSpy).toHaveBeenCalledWith(HttpStatus.OK, {
      id: jasmine.any(String),
    });
    expect(Object.keys((emulator.facilities.attachments as any).attachments).length).toBe(1);
  });
});

describe('The getBotEndpoint middleware', () => {
  let emulator: BotEmulator;
  let res;
  let getBotEndpointMiddleware;
  let sentResponses;
  beforeEach(() => {
    sentResponses = [];
    res = {
      send: (...args) => sentResponses.push(args),
      end: () => null,
      contentType: '',
    };
    emulator = createEmulatorUtil();
    getBotEndpointMiddleware = getBotEndpoint(emulator);
  });

  it('should push a new endpoint to the EndpointSet when the params contain the appropriate data', () => {
    const req = {
      body: {
        bot: {
          id: '1234',
        },
      },
      headers: {
        'x-emulator-botendpoint': 'http://localhost:5050/api/messages',
        'x-emulator-appid': '12e34',
        'x-emulator-apppassword': '54543',
      },
    } as any;
    getBotEndpointMiddleware(req as any, res, (() => null) as any);

    expect(emulator.facilities.endpoints.get('http://localhost:5050/api/messages')).not.toBeNull();
  });

  it('should retrieve the endpoint from the jwt when one exists', () => {
    const req = {
      jwt: {
        appId: '1234',
      },
    } as any;

    emulator.facilities.endpoints.push(null, {
      botId: 'vfgdsfgds',
      botUrl: 'http://localhost/api/messages',
      msaAppId: '1234',
      msaPassword: 'fdsa',
    });

    getBotEndpointMiddleware(req as any, res, (() => null) as any);
    expect(req.botEndpoint).not.toBeNull();
  });

  it('should update the msaAppId and msaAppPassword if the exist in the query', () => {
    emulator.facilities.endpoints.push(null, {
      botId: 'vfgdsfgds',
      botUrl: 'http://localhost/api/messages',
      msaAppId: 'oldAppId',
      msaPassword: 'oldPassword',
    });
    const bot = { role: 'bot', name: 'thebot', id: '456' };
    const req = {
      headers: {
        'x-emulator-botendpoint': 'http://localhost:5050/api/messages',
        'x-emulator-appid': 'newAppId',
        'x-emulator-apppassword': 'newPassword',
      },
      body: {
        members: [{ id: '456', name: 'emulator', role: 'user' }],
        bot,
        conversationId: '007',
      } as ConversationParameters,
    } as any;
    getBotEndpointMiddleware(req as any, res, (() => null) as any);
    expect(req.botEndpoint.msaAppId).toBe('newAppId');
    expect(req.botEndpoint.msaPassword).toBe('newPassword');
  });

  it('should retrieve all conversations', () => {
    const mockConversations = {
      '1234abcd': { conversationId: '1234abcd', members: [] },
      '1234abcde': { conversationId: '1234abcde', members: [] },
      '1234abcdf': { conversationId: '1234abcdf', members: [] },
    };
    (emulator.facilities.conversations as any)['conversations'] = mockConversations;
    const req = { params: { continuationToken: '1234abcde' } } as any;
    const fetchConversationMiddleware = createFetchConversationMiddleware(emulator);
    fetchConversationMiddleware(req as any, res, (() => null) as any);
    expect(sentResponses[0][1]).toEqual({
      conversations: [
        {
          id: '1234abcde',
          members: [],
        },
        {
          id: '1234abcdf',
          members: [],
        },
      ],
    });
  });
});

function createConversationUtil(emulator: BotEmulator): Conversation {
  // create the conversation with an activity
  const bot = { role: 'bot', name: 'thebot', id: '456' };
  const req: any = {
    botEndpoint: new BotEndpoint('12', '456', 'http://localhost:12345', '', '', false, '', {}),
    body: {
      members: [{ id: '456', name: 'emulator', role: 'user' }],
      bot,
      conversationId: '007',
    } as ConversationParameters,
  };
  const createConversationMiddleware = createConversation.bind({
    botId: bot.id,
  })(emulator);
  createConversationMiddleware(req as any, { send: () => null, end: () => null }, (() => null) as any);

  return emulator.facilities.conversations.conversationById('007|livechat');
}

function createEmulatorUtil(): BotEmulator {
  const emulator = {
    facilities: { logger: { logMessage: () => true } },
  } as any;
  emulator.facilities.conversations = new ConversationSet();
  emulator.facilities.users = new Users();
  emulator.facilities.users.currentUserId = '456';
  emulator.facilities.endpoints = new Endpoints(emulator);
  emulator.facilities.logger = { logActivity: () => null } as any;
  emulator.facilities.attachments = new Attachments();
  emulator.options = {};

  return emulator;
}
