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
/* eslint-disable typescript/camelcase */
import * as HttpStatus from 'http-status-codes';
import { ConversationParameters } from '@bfemulator/sdk-shared';

import { BotEmulator } from '../../botEmulator';
import Conversation from '../../facility/conversation';
import BotEndpoint from '../../facility/botEndpoint';
import createConversation from '../../conversations/middleware/createConversation';
import ConversationSet from '../../facility/conversationSet';
import Users from '../../facility/users';
import Attachments from '../../facility/attachments';

import getActivities from './getActivities';
import getConversation from './getConversation';
import options from './options';
import postActivity from './postActivity';
import reconnectToConversation from './reconnectToConversation';
import startConversation from './startConversation';
import stream from './stream';
import upload from './upload';

jest.mock('formidable', () => ({
  IncomingForm: class {
    // jest won't allow the use of args in this callback signature unless they are prefaced with 'mock'
    parse(req: any, callback: (mockErr: any, mockFields: any, mockFiles: any) => any) {
      return callback(null, null, { activity: req.activity, file: req.file });
    }
  },
}));

jest.mock('fs', () => ({
  readFileSync: () => '{}',
}));

describe('The directLine middleware', () => {
  let emulator: BotEmulator;
  let res;
  beforeEach(() => {
    res = {
      send: () => null,
      end: () => null,
      json: () => null,
      contentType: '',
    };
    emulator = {
      facilities: {
        logger: {
          logMessage: () => true,
          logActivity: () => true,
          logException: () => null,
        },
      },
    } as any;
    emulator.facilities.conversations = new ConversationSet();
    emulator.facilities.users = new Users();
    emulator.facilities.users.currentUserId = '456';
    emulator.facilities.users.users = {
      '456': { id: '456', name: 'emulator' },
    };
    emulator.facilities.attachments = new Attachments();
    // @ts-ignore
    emulator.getServiceUrl = () => 'https://localhost:8888/api/message';
    emulator.options = {
      // @ts-ignore
      tunnelingServiceUrl: 'https://localhost:3333',
    };
  });

  it('should getActivities', () => {
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
    conversation.feedActivities(mockActivities);

    const getActivitiesMiddleware = getActivities(emulator);
    const req = {
      query: { watermark: 0 },
      conversation,
    };

    const jsonSpy = jest.spyOn(res, 'json');
    getActivitiesMiddleware(req as any, res, (() => null) as any);
    // mockActivities.forEach(activity => activity.localTimestamp = jasmine.any(String) as any);
    expect(jsonSpy).toHaveBeenCalledWith(HttpStatus.OK, {
      activities: mockActivities,
      watermark: mockActivities.length,
    });
  });

  it('should get a conversation', () => {
    const conversation = createConversationUtil(emulator);
    const getConversationMiddleware = getConversation(emulator);
    const req = {
      params: { conversationId: conversation.conversationId },
      conversation: null,
    };

    getConversationMiddleware(req as any, res, (() => null) as any);

    expect(req.conversation).toBe(conversation);
  });

  it('should send a 200 when the OPTIONS pre-flight is requested', () => {
    const sendSpy = jest.spyOn(res, 'send');
    options(emulator)({} as any, res, (() => null) as any);
    expect(sendSpy).toHaveBeenCalledWith(HttpStatus.OK);
  });

  it('should post activity to the bot', async () => {
    const mockActivity = {
      conversation: {
        id: 'vY4U6Daqs1rrWK5uIDlp8eFHHq0=',
      },
      id: '5',
      recipient: {
        id: 'jopVZjYqyE3A5EnA8dYrlA+Mubw=',
        name: 'cafebot',
        role: 'bot',
      },
      from: {
        id: 'aqMkJoc/DqiL+cgiJhoUJCxSZ+U=',
        name: 'vishwac',
        role: 'user',
      },
      text: 'How about seattle?',
      timestamp: '2018-08-28T16:34:57.100Z',
      type: 'message',
      channelId: 'chatdown',
    };

    const conversation = createConversationUtil(emulator);
    const postActivityMiddleware = postActivity(emulator);
    const sendSpy = jest.spyOn(res, 'send');
    const req = {
      conversation,
      body: mockActivity,
      params: {
        conversationId: conversation.conversationId,
      },
    };

    await postActivityMiddleware(req as any, res, (() => null) as any);

    expect(sendSpy).toHaveBeenCalledWith(HttpStatus.OK, { id: '5' });
    expect((conversation as any).activities[0]).toEqual({
      activity: {
        ...mockActivity,
        serviceUrl: 'https://localhost:8888/api/message',
        channelId: 'emulator',
        recipient: {
          id: '456',
          name: 'Bot',
          role: 'bot',
        },
        timestamp: jasmine.any(String),
        localTimestamp: jasmine.any(String),
      },
      watermark: 0,
    });
  });

  it('should reconnect to the conversation', () => {
    const conversation = createConversationUtil(emulator);
    const reconnectToConversationMiddleware = reconnectToConversation(emulator);
    const req = {
      conversation,
      params: { conversationId: conversation.conversationId },
    };

    const jsonSpy = jest.spyOn(res, 'json');
    reconnectToConversationMiddleware(req as any, res, (() => null) as any);

    expect(jsonSpy).toHaveBeenCalledWith(HttpStatus.OK, {
      conversationId: 'transcript-007|livechat',
      expires_in: 2147483647,
      streamUrl: '',
      token: 'transcript-007|livechat',
    });
  });

  describe('when starting a new conversation', () => {
    it('should create a new conversation if one does not already exist', async () => {
      const req = {
        header: () => 'bm90aGluZw.eyJjb252ZXJzYXRpb25JZCI6InRyYW5zY3JpcHQtMDA3In0=.7gjdshgfdsk98458205jfds9843fjds',
        botEndpoint: new BotEndpoint('12', '456', 'http://localhost:12345', '', '', false, '', {
          fetch: async () => true,
        }),
        conversation: null,
      };
      const jsonSpy = jest.spyOn(res, 'json');
      await startConversation(emulator)(req as any, res, (() => null) as any);

      expect(jsonSpy).toHaveBeenCalledWith(HttpStatus.CREATED, {
        conversationId: jasmine.any(String),
        expires_in: 2147483647,
        streamUrl: '',
        token: '12',
      });
      expect(req.conversation).toBeTruthy();
    });

    it('should add members when the conversation exists', async () => {
      const conversation = createConversationUtil(emulator);
      const req = {
        header: () => 'Bearer eyJjb252ZXJzYXRpb25JZCI6InRyYW5zY3JpcHQtMDA3In0=',
        botEndpoint: new BotEndpoint('456', '1234', 'http://localhost:12345', '', '', false, '', {
          fetch: async () => true,
        }),
        conversation: null,
      };
      const jsonSpy = jest.spyOn(res, 'json');
      await startConversation(emulator)(req as any, res, (() => null) as any);

      expect(jsonSpy).toHaveBeenCalledWith(HttpStatus.CREATED, {
        conversationId: 'transcript-007|livechat',
        expires_in: 2147483647,
        streamUrl: '',
        token: '456',
      });
      expect(req.conversation).toBeTruthy();
      expect(conversation.members.length).toBe(2);
    });
  });

  it('should send a 501 when stream is requested', () => {
    const streamMiddleware = stream(emulator);
    const sendSpy = jest.spyOn(res, 'send');
    streamMiddleware({} as any, res, (() => null) as any);

    expect(sendSpy).toHaveBeenCalledWith(HttpStatus.NOT_IMPLEMENTED);
  });

  it('should upload attachments', async () => {
    const conversation = createConversationUtil(emulator, '00000');
    const req = {
      conversation,
      params: { conversationId: '00000' },
      activity: { path: '' },
      file: {
        name: 'attachment',
        type: 'image',
        path: '/user/data/attachment.png',
      },
      getContentType: () => 'multipart/form-data',
      isChunked: () => true,
      getContentLength: () => 8,
      botEndpoint: conversation.botEndpoint,
    };
    res.send = () => void 0;
    await upload(emulator)(req as any, res, (() => null) as any);
    await Promise.resolve(true);
    await Promise.resolve(true);
    const { activities } = conversation as any;
    expect(activities.length).toBe(1);
    expect(activities[0].activity.attachments[0].name).toEqual('attachment');
  });
});

function createConversationUtil(emulator: BotEmulator, conversationId: string = 'transcript-007'): Conversation {
  // create the conversation with an activity
  const bot = { role: 'bot', name: 'thebot', id: '456' };
  const req: any = {
    botEndpoint: new BotEndpoint('12', '456', 'http://localhost:12345', '', '', false, '', {
      fetch: async () => ({
        json: async () => ({}),
        text: async () => 'hello',
        status: 200,
      }),
    }),
    body: {
      members: [{ id: '456', name: 'emulator', role: 'user' }],
      bot,
      conversationId,
    } as ConversationParameters,
  };
  const createConversationMiddleware = createConversation.bind({
    botId: bot.id,
  })(emulator);
  createConversationMiddleware(req as any, { send: () => null, end: () => null }, (() => null) as any);

  return emulator.facilities.conversations.conversationById(conversationId + '|livechat');
}
