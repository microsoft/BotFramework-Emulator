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
export const mockChatLogs = [
  {
    items: [
      {
        payload: {
          level: 0,
          text: 'Emulator listening on http://localhost:60002',
        },
        type: 'text',
      },
    ],
    timestamp: 1561995656213,
  },
  {
    items: [
      {
        payload: {
          hyperlink: 'https://aka.ms/cnjvpo',
          text: 'Connecting to bots hosted remotely',
        },
        type: 'external-link',
      },
    ],
    timestamp: 1561995656213,
  },
  {
    items: [
      {
        payload: {
          level: 0,
          text: '<- ',
        },
        type: 'text',
      },
      {
        payload: {
          obj: {
            channelId: 'emulator',
            conversation: {
              id: '9dc7ee90-9c16-11e9-a2fc-f170e382beae|livechat',
            },
            from: {
              id: '552539a0-9c15-11e9-b530-d5773e50965f',
              name: 'Bot',
              role: 'bot',
            },
            id: '9dcd6cd0-9c16-11e9-a2fc-f170e382beae',
            label: 'Command',
            localTimestamp: '2019-07-01T08:40:56-07:00',
            locale: 'en-US',
            name: 'Command',
            recipient: {
              id: '99b60ee8-3ffc-45c0-88cc-59b598641827',
              role: 'user',
            },
            replyToId: '9dcc5b62-9c16-11e9-a2fc-f170e382beae',
            serviceUrl: 'http://localhost:60002',
            timestamp: '2019-07-01T15:40:56.221Z',
            type: 'trace',
            value: '/INSPECT attach d40aac28-2948-7d20-0b45-218e4e3aac47',
            valueType: 'https://www.botframework.com/schemas/command',
          },
          text: 'trace',
        },
        type: 'inspectable-object',
      },
      {
        payload: {
          obj: {
            channelId: 'emulator',
            conversation: {
              id: '9dc7ee90-9c16-11e9-a2fc-f170e382beae|livechat',
            },
            from: {
              id: '552539a0-9c15-11e9-b530-d5773e50965f',
              name: 'Bot',
              role: 'bot',
            },
            id: '9dcd6cd0-9c16-11e9-a2fc-f170e382beae',
            label: 'Command',
            localTimestamp: '2019-07-01T08:40:56-07:00',
            locale: 'en-US',
            name: 'Command',
            recipient: {
              id: '99b60ee8-3ffc-45c0-88cc-59b598641827',
              role: 'user',
            },
            replyToId: '9dcc5b62-9c16-11e9-a2fc-f170e382beae',
            serviceUrl: 'http://localhost:60002',
            timestamp: '2019-07-01T15:40:56.221Z',
            type: 'trace',
            value: '/INSPECT attach d40aac28-2948-7d20-0b45-218e4e3aac47',
            valueType: 'https://www.botframework.com/schemas/command',
          },
        },
        type: 'summary-text',
      },
    ],
    timestamp: 1561995656222,
  },
  {
    items: [
      {
        payload: {
          level: 0,
          text: '<- ',
        },
        type: 'text',
      },
      {
        payload: {
          obj: {
            channelId: 'emulator',
            conversation: {
              id: '9dc7ee90-9c16-11e9-a2fc-f170e382beae|livechat',
            },
            from: {
              id: '552539a0-9c15-11e9-b530-d5773e50965f',
              name: 'Bot',
              role: 'bot',
            },
            id: 'a3ead300-9c16-11e9-a2fc-f170e382beae',
            label: 'Received Activity',
            localTimestamp: '2019-07-01T08:41:06-07:00',
            locale: 'en-US',
            name: 'ReceivedActivity',
            recipient: {
              id: '99b60ee8-3ffc-45c0-88cc-59b598641827',
              role: 'user',
            },
            serviceUrl: 'http://localhost:60002',
            timestamp: '2019-07-01T15:41:06.480Z',
            type: 'trace',
            value: {
              channelData: {
                clientActivityID: '15619956664690.bduatnj3x2',
              },
              channelId: 'emulator',
              conversation: {
                id: '6a3c96c1-9c16-11e9-b530-d5773e50965f|livechat',
              },
              from: {
                id: '99b60ee8-3ffc-45c0-88cc-59b598641827',
                name: 'User',
                role: 'user',
              },
              id: 'a3e9e8a0-9c16-11e9-a2fc-f170e382beae',
              localTimestamp: '2019-07-01T15:41:06.000Z',
              locale: 'en-US',
              recipient: {
                id: '123',
                name: 'Bot',
                role: 'bot',
              },
              serviceUrl: 'http://localhost:60002',
              text: 'Hi',
              textFormat: 'plain',
              timestamp: '2019-07-01T15:41:06.474Z',
              type: 'message',
            },
            valueType: 'https://www.botframework.com/schemas/activity',
          },
          text: 'trace',
        },
        type: 'inspectable-object',
      },
      {
        payload: {
          obj: {
            channelId: 'emulator',
            conversation: {
              id: '9dc7ee90-9c16-11e9-a2fc-f170e382beae|livechat',
            },
            from: {
              id: '552539a0-9c15-11e9-b530-d5773e50965f',
              name: 'Bot',
              role: 'bot',
            },
            id: 'a3ead300-9c16-11e9-a2fc-f170e382beae',
            label: 'Received Activity',
            localTimestamp: '2019-07-01T08:41:06-07:00',
            locale: 'en-US',
            name: 'ReceivedActivity',
            recipient: {
              id: '99b60ee8-3ffc-45c0-88cc-59b598641827',
              role: 'user',
            },
            serviceUrl: 'http://localhost:60002',
            timestamp: '2019-07-01T15:41:06.480Z',
            type: 'trace',
            value: {
              channelData: {
                clientActivityID: '15619956664690.bduatnj3x2',
              },
              channelId: 'emulator',
              conversation: {
                id: '6a3c96c1-9c16-11e9-b530-d5773e50965f|livechat',
              },
              from: {
                id: '99b60ee8-3ffc-45c0-88cc-59b598641827',
                name: 'User',
                role: 'user',
              },
              id: 'a3e9e8a0-9c16-11e9-a2fc-f170e382beae',
              localTimestamp: '2019-07-01T15:41:06.000Z',
              locale: 'en-US',
              recipient: {
                id: '123',
                name: 'Bot',
                role: 'bot',
              },
              serviceUrl: 'http://localhost:60002',
              text: 'Hi',
              textFormat: 'plain',
              timestamp: '2019-07-01T15:41:06.474Z',
              type: 'message',
            },
            valueType: 'https://www.botframework.com/schemas/activity',
          },
        },
        type: 'summary-text',
      },
      {
        payload: {
          level: 0,
          text: '<- ',
        },
        type: 'text',
      },
      {
        payload: {
          obj: {
            channelData: {
              clientActivityID: '15619956664690.bduatnj3x2',
            },
            channelId: 'emulator',
            conversation: {
              id: '6a3c96c1-9c16-11e9-b530-d5773e50965f|livechat',
            },
            from: {
              id: '99b60ee8-3ffc-45c0-88cc-59b598641827',
              name: 'User',
              role: 'user',
            },
            id: 'a3e9e8a0-9c16-11e9-a2fc-f170e382beae',
            localTimestamp: '2019-07-01T15:41:06.000Z',
            locale: 'en-US',
            recipient: {
              id: '123',
              name: 'Bot',
              role: 'bot',
            },
            serviceUrl: 'http://localhost:60002',
            text: 'Hi',
            textFormat: 'plain',
            timestamp: '2019-07-01T15:41:06.474Z',
            type: 'message',
          },
          text: 'message',
        },
        type: 'inspectable-object',
      },
      {
        payload: {
          obj: {
            channelData: {
              clientActivityID: '15619956664690.bduatnj3x2',
            },
            channelId: 'emulator',
            conversation: {
              id: '6a3c96c1-9c16-11e9-b530-d5773e50965f|livechat',
            },
            from: {
              id: '99b60ee8-3ffc-45c0-88cc-59b598641827',
              name: 'User',
              role: 'user',
            },
            id: 'a3e9e8a0-9c16-11e9-a2fc-f170e382beae',
            localTimestamp: '2019-07-01T15:41:06.000Z',
            locale: 'en-US',
            recipient: {
              id: '123',
              name: 'Bot',
              role: 'bot',
            },
            serviceUrl: 'http://localhost:60002',
            text: 'Hi',
            textFormat: 'plain',
            timestamp: '2019-07-01T15:41:06.474Z',
            type: 'message',
          },
        },
        type: 'summary-text',
      },
    ],
    timestamp: 1561995666480,
  },
  {
    items: [
      {
        payload: {
          level: 0,
          text: '<- ',
        },
        type: 'text',
      },
      {
        payload: {
          obj: {
            channelId: 'emulator',
            conversation: {
              id: '9dc7ee90-9c16-11e9-a2fc-f170e382beae|livechat',
            },
            from: {
              id: '552539a0-9c15-11e9-b530-d5773e50965f',
              name: 'Bot',
              role: 'bot',
            },
            id: 'a3ebe470-9c16-11e9-a2fc-f170e382beae',
            label: 'Sent Activity',
            localTimestamp: '2019-07-01T08:41:06-07:00',
            locale: 'en-US',
            name: 'SentActivity',
            recipient: {
              id: '99b60ee8-3ffc-45c0-88cc-59b598641827',
              role: 'user',
            },
            serviceUrl: 'http://localhost:60002',
            timestamp: '2019-07-01T15:41:06.487Z',
            type: 'trace',
            value: {
              channelId: 'emulator',
              conversation: {
                id: '6a3c96c1-9c16-11e9-b530-d5773e50965f|livechat',
              },
              from: {
                id: '123',
                name: 'Bot',
                role: 'bot',
              },
              id: 'emulator-required-id-a3ebe470-9c16-11e9-a2fc-f170e382beae',
              inputHint: 'expectingInput',
              recipient: {
                id: '99b60ee8-3ffc-45c0-88cc-59b598641827',
                name: 'User',
                role: 'user',
              },
              replyToId: 'a3e9e8a0-9c16-11e9-a2fc-f170e382beae',
              serviceUrl: 'http://localhost:60002',
              text: 'Please enter your first name.',
              type: 'message',
            },
            valueType: 'https://www.botframework.com/schemas/activity',
          },
          text: 'trace',
        },
        type: 'inspectable-object',
      },
      {
        payload: {
          obj: {
            channelId: 'emulator',
            conversation: {
              id: '9dc7ee90-9c16-11e9-a2fc-f170e382beae|livechat',
            },
            from: {
              id: '552539a0-9c15-11e9-b530-d5773e50965f',
              name: 'Bot',
              role: 'bot',
            },
            id: 'a3ebe470-9c16-11e9-a2fc-f170e382beae',
            label: 'Sent Activity',
            localTimestamp: '2019-07-01T08:41:06-07:00',
            locale: 'en-US',
            name: 'SentActivity',
            recipient: {
              id: '99b60ee8-3ffc-45c0-88cc-59b598641827',
              role: 'user',
            },
            serviceUrl: 'http://localhost:60002',
            timestamp: '2019-07-01T15:41:06.487Z',
            type: 'trace',
            value: {
              channelId: 'emulator',
              conversation: {
                id: '6a3c96c1-9c16-11e9-b530-d5773e50965f|livechat',
              },
              from: {
                id: '123',
                name: 'Bot',
                role: 'bot',
              },
              id: 'emulator-required-id-a3ebe470-9c16-11e9-a2fc-f170e382beae',
              inputHint: 'expectingInput',
              recipient: {
                id: '99b60ee8-3ffc-45c0-88cc-59b598641827',
                name: 'User',
                role: 'user',
              },
              replyToId: 'a3e9e8a0-9c16-11e9-a2fc-f170e382beae',
              serviceUrl: 'http://localhost:60002',
              text: 'Please enter your first name.',
              type: 'message',
            },
            valueType: 'https://www.botframework.com/schemas/activity',
          },
        },
        type: 'summary-text',
      },
      {
        payload: {
          level: 0,
          text: '-> ',
        },
        type: 'text',
      },
      {
        payload: {
          obj: {
            channelId: 'emulator',
            conversation: {
              id: '6a3c96c1-9c16-11e9-b530-d5773e50965f|livechat',
            },
            from: {
              id: '123',
              name: 'Bot',
              role: 'bot',
            },
            id: 'emulator-required-id-a3ebe470-9c16-11e9-a2fc-f170e382beae',
            inputHint: 'expectingInput',
            recipient: {
              id: '99b60ee8-3ffc-45c0-88cc-59b598641827',
              name: 'User',
              role: 'user',
            },
            replyToId: 'a3e9e8a0-9c16-11e9-a2fc-f170e382beae',
            serviceUrl: 'http://localhost:60002',
            text: 'Please enter your first name.',
            type: 'message',
          },
          text: 'message',
        },
        type: 'inspectable-object',
      },
      {
        payload: {
          obj: {
            channelId: 'emulator',
            conversation: {
              id: '6a3c96c1-9c16-11e9-b530-d5773e50965f|livechat',
            },
            from: {
              id: '123',
              name: 'Bot',
              role: 'bot',
            },
            id: 'emulator-required-id-a3ebe470-9c16-11e9-a2fc-f170e382beae',
            inputHint: 'expectingInput',
            recipient: {
              id: '99b60ee8-3ffc-45c0-88cc-59b598641827',
              name: 'User',
              role: 'user',
            },
            replyToId: 'a3e9e8a0-9c16-11e9-a2fc-f170e382beae',
            serviceUrl: 'http://localhost:60002',
            text: 'Please enter your first name.',
            type: 'message',
          },
        },
        type: 'summary-text',
      },
    ],
    timestamp: 1561995666487,
  },
  {
    items: [
      {
        payload: {
          level: 0,
          text: '<- ',
        },
        type: 'text',
      },
      {
        payload: {
          obj: {
            channelId: 'emulator',
            conversation: {
              id: '9dc7ee90-9c16-11e9-a2fc-f170e382beae|livechat',
            },
            from: {
              id: '552539a0-9c15-11e9-b530-d5773e50965f',
              name: 'Bot',
              role: 'bot',
            },
            id: 'a3ed6b10-9c16-11e9-a2fc-f170e382beae',
            label: 'Bot State',
            localTimestamp: '2019-07-01T08:41:06-07:00',
            locale: 'en-US',
            name: 'BotState',
            recipient: {
              id: '99b60ee8-3ffc-45c0-88cc-59b598641827',
              role: 'user',
            },
            serviceUrl: 'http://localhost:60002',
            timestamp: '2019-07-01T15:41:06.497Z',
            type: 'trace',
            value: {
              conversationState: {
                dialogState: {
                  dialogStack: [
                    {
                      id: 'root',
                      state: {
                        options: {},
                        stepIndex: 0,
                        values: {
                          instanceId: '6e732f12-4b0e-1b19-95c6-50213cd9ec1d',
                        },
                      },
                    },
                    {
                      id: 'slot-dialog',
                      state: {
                        slot: 'fullname',
                        values: {},
                      },
                    },
                    {
                      id: 'fullname',
                      state: {
                        slot: 'first',
                        values: {},
                      },
                    },
                    {
                      id: 'text',
                      state: {
                        options: {
                          prompt: 'Please enter your first name.',
                        },
                        state: {},
                      },
                    },
                  ],
                },
                eTag: '*',
              },
              userState: {},
            },
            valueType: 'https://www.botframework.com/schemas/botState',
          },
          text: 'trace',
        },
        type: 'inspectable-object',
      },
      {
        payload: {
          obj: {
            channelId: 'emulator',
            conversation: {
              id: '9dc7ee90-9c16-11e9-a2fc-f170e382beae|livechat',
            },
            from: {
              id: '552539a0-9c15-11e9-b530-d5773e50965f',
              name: 'Bot',
              role: 'bot',
            },
            id: 'a3ed6b10-9c16-11e9-a2fc-f170e382beae',
            label: 'Bot State',
            localTimestamp: '2019-07-01T08:41:06-07:00',
            locale: 'en-US',
            name: 'BotState',
            recipient: {
              id: '99b60ee8-3ffc-45c0-88cc-59b598641827',
              role: 'user',
            },
            serviceUrl: 'http://localhost:60002',
            timestamp: '2019-07-01T15:41:06.497Z',
            type: 'trace',
            value: {
              conversationState: {
                dialogState: {
                  dialogStack: [
                    {
                      id: 'root',
                      state: {
                        options: {},
                        stepIndex: 0,
                        values: {
                          instanceId: '6e732f12-4b0e-1b19-95c6-50213cd9ec1d',
                        },
                      },
                    },
                    {
                      id: 'slot-dialog',
                      state: {
                        slot: 'fullname',
                        values: {},
                      },
                    },
                    {
                      id: 'fullname',
                      state: {
                        slot: 'first',
                        values: {},
                      },
                    },
                    {
                      id: 'text',
                      state: {
                        options: {
                          prompt: 'Please enter your first name.',
                        },
                        state: {},
                      },
                    },
                  ],
                },
                eTag: '*',
              },
              userState: {},
            },
            valueType: 'https://www.botframework.com/schemas/botState',
          },
        },
        type: 'summary-text',
      },
    ],
    timestamp: 1561995666497,
  },
  {
    items: [
      {
        payload: {
          level: 0,
          text: '<- ',
        },
        type: 'text',
      },
      {
        payload: {
          obj: {
            channelId: 'emulator',
            conversation: {
              id: '9dc7ee90-9c16-11e9-a2fc-f170e382beae|livechat',
            },
            from: {
              id: '552539a0-9c15-11e9-b530-d5773e50965f',
              name: 'Bot',
              role: 'bot',
            },
            id: 'a5c6bef0-9c16-11e9-a2fc-f170e382beae',
            label: 'Received Activity',
            localTimestamp: '2019-07-01T08:41:09-07:00',
            locale: 'en-US',
            name: 'ReceivedActivity',
            recipient: {
              id: '99b60ee8-3ffc-45c0-88cc-59b598641827',
              role: 'user',
            },
            serviceUrl: 'http://localhost:60002',
            timestamp: '2019-07-01T15:41:09.599Z',
            type: 'trace',
            value: {
              channelData: {
                clientActivityID: '15619956695770.qysf656hq9o',
              },
              channelId: 'emulator',
              conversation: {
                id: '6a3c96c1-9c16-11e9-b530-d5773e50965f|livechat',
              },
              from: {
                id: '99b60ee8-3ffc-45c0-88cc-59b598641827',
                name: 'User',
                role: 'user',
              },
              id: 'a5c5d490-9c16-11e9-a2fc-f170e382beae',
              localTimestamp: '2019-07-01T15:41:09.000Z',
              locale: 'en-US',
              recipient: {
                id: '123',
                name: 'Bot',
                role: 'bot',
              },
              serviceUrl: 'http://localhost:60002',
              text: 'Joe',
              textFormat: 'plain',
              timestamp: '2019-07-01T15:41:09.593Z',
              type: 'message',
            },
            valueType: 'https://www.botframework.com/schemas/activity',
          },
          text: 'trace',
        },
        type: 'inspectable-object',
      },
      {
        payload: {
          obj: {
            channelId: 'emulator',
            conversation: {
              id: '9dc7ee90-9c16-11e9-a2fc-f170e382beae|livechat',
            },
            from: {
              id: '552539a0-9c15-11e9-b530-d5773e50965f',
              name: 'Bot',
              role: 'bot',
            },
            id: 'a5c6bef0-9c16-11e9-a2fc-f170e382beae',
            label: 'Received Activity',
            localTimestamp: '2019-07-01T08:41:09-07:00',
            locale: 'en-US',
            name: 'ReceivedActivity',
            recipient: {
              id: '99b60ee8-3ffc-45c0-88cc-59b598641827',
              role: 'user',
            },
            serviceUrl: 'http://localhost:60002',
            timestamp: '2019-07-01T15:41:09.599Z',
            type: 'trace',
            value: {
              channelData: {
                clientActivityID: '15619956695770.qysf656hq9o',
              },
              channelId: 'emulator',
              conversation: {
                id: '6a3c96c1-9c16-11e9-b530-d5773e50965f|livechat',
              },
              from: {
                id: '99b60ee8-3ffc-45c0-88cc-59b598641827',
                name: 'User',
                role: 'user',
              },
              id: 'a5c5d490-9c16-11e9-a2fc-f170e382beae',
              localTimestamp: '2019-07-01T15:41:09.000Z',
              locale: 'en-US',
              recipient: {
                id: '123',
                name: 'Bot',
                role: 'bot',
              },
              serviceUrl: 'http://localhost:60002',
              text: 'Joe',
              textFormat: 'plain',
              timestamp: '2019-07-01T15:41:09.593Z',
              type: 'message',
            },
            valueType: 'https://www.botframework.com/schemas/activity',
          },
        },
        type: 'summary-text',
      },
      {
        payload: {
          level: 0,
          text: '<- ',
        },
        type: 'text',
      },
      {
        payload: {
          obj: {
            channelData: {
              clientActivityID: '15619956695770.qysf656hq9o',
            },
            channelId: 'emulator',
            conversation: {
              id: '6a3c96c1-9c16-11e9-b530-d5773e50965f|livechat',
            },
            from: {
              id: '99b60ee8-3ffc-45c0-88cc-59b598641827',
              name: 'User',
              role: 'user',
            },
            id: 'a5c5d490-9c16-11e9-a2fc-f170e382beae',
            localTimestamp: '2019-07-01T15:41:09.000Z',
            locale: 'en-US',
            recipient: {
              id: '123',
              name: 'Bot',
              role: 'bot',
            },
            serviceUrl: 'http://localhost:60002',
            text: 'Joe',
            textFormat: 'plain',
            timestamp: '2019-07-01T15:41:09.593Z',
            type: 'message',
          },
          text: 'message',
        },
        type: 'inspectable-object',
      },
      {
        payload: {
          obj: {
            channelData: {
              clientActivityID: '15619956695770.qysf656hq9o',
            },
            channelId: 'emulator',
            conversation: {
              id: '6a3c96c1-9c16-11e9-b530-d5773e50965f|livechat',
            },
            from: {
              id: '99b60ee8-3ffc-45c0-88cc-59b598641827',
              name: 'User',
              role: 'user',
            },
            id: 'a5c5d490-9c16-11e9-a2fc-f170e382beae',
            localTimestamp: '2019-07-01T15:41:09.000Z',
            locale: 'en-US',
            recipient: {
              id: '123',
              name: 'Bot',
              role: 'bot',
            },
            serviceUrl: 'http://localhost:60002',
            text: 'Joe',
            textFormat: 'plain',
            timestamp: '2019-07-01T15:41:09.593Z',
            type: 'message',
          },
        },
        type: 'summary-text',
      },
    ],
    timestamp: 1561995669599,
  },
  {
    items: [
      {
        payload: {
          level: 0,
          text: '<- ',
        },
        type: 'text',
      },
      {
        payload: {
          obj: {
            channelId: 'emulator',
            conversation: {
              id: '9dc7ee90-9c16-11e9-a2fc-f170e382beae|livechat',
            },
            from: {
              id: '552539a0-9c15-11e9-b530-d5773e50965f',
              name: 'Bot',
              role: 'bot',
            },
            id: 'a5c7a950-9c16-11e9-a2fc-f170e382beae',
            label: 'Sent Activity',
            localTimestamp: '2019-07-01T08:41:09-07:00',
            locale: 'en-US',
            name: 'SentActivity',
            recipient: {
              id: '99b60ee8-3ffc-45c0-88cc-59b598641827',
              role: 'user',
            },
            serviceUrl: 'http://localhost:60002',
            timestamp: '2019-07-01T15:41:09.605Z',
            type: 'trace',
            value: {
              channelId: 'emulator',
              conversation: {
                id: '6a3c96c1-9c16-11e9-b530-d5773e50965f|livechat',
              },
              from: {
                id: '123',
                name: 'Bot',
                role: 'bot',
              },
              id: 'emulator-required-id-a5c7a950-9c16-11e9-a2fc-f170e382beae',
              inputHint: 'expectingInput',
              recipient: {
                id: '99b60ee8-3ffc-45c0-88cc-59b598641827',
                name: 'User',
                role: 'user',
              },
              replyToId: 'a5c5d490-9c16-11e9-a2fc-f170e382beae',
              serviceUrl: 'http://localhost:60002',
              text: 'Please enter your last name.',
              type: 'message',
            },
            valueType: 'https://www.botframework.com/schemas/activity',
          },
          text: 'trace',
        },
        type: 'inspectable-object',
      },
      {
        payload: {
          obj: {
            channelId: 'emulator',
            conversation: {
              id: '9dc7ee90-9c16-11e9-a2fc-f170e382beae|livechat',
            },
            from: {
              id: '552539a0-9c15-11e9-b530-d5773e50965f',
              name: 'Bot',
              role: 'bot',
            },
            id: 'a5c7a950-9c16-11e9-a2fc-f170e382beae',
            label: 'Sent Activity',
            localTimestamp: '2019-07-01T08:41:09-07:00',
            locale: 'en-US',
            name: 'SentActivity',
            recipient: {
              id: '99b60ee8-3ffc-45c0-88cc-59b598641827',
              role: 'user',
            },
            serviceUrl: 'http://localhost:60002',
            timestamp: '2019-07-01T15:41:09.605Z',
            type: 'trace',
            value: {
              channelId: 'emulator',
              conversation: {
                id: '6a3c96c1-9c16-11e9-b530-d5773e50965f|livechat',
              },
              from: {
                id: '123',
                name: 'Bot',
                role: 'bot',
              },
              id: 'emulator-required-id-a5c7a950-9c16-11e9-a2fc-f170e382beae',
              inputHint: 'expectingInput',
              recipient: {
                id: '99b60ee8-3ffc-45c0-88cc-59b598641827',
                name: 'User',
                role: 'user',
              },
              replyToId: 'a5c5d490-9c16-11e9-a2fc-f170e382beae',
              serviceUrl: 'http://localhost:60002',
              text: 'Please enter your last name.',
              type: 'message',
            },
            valueType: 'https://www.botframework.com/schemas/activity',
          },
        },
        type: 'summary-text',
      },
      {
        payload: {
          level: 0,
          text: '-> ',
        },
        type: 'text',
      },
      {
        payload: {
          obj: {
            channelId: 'emulator',
            conversation: {
              id: '6a3c96c1-9c16-11e9-b530-d5773e50965f|livechat',
            },
            from: {
              id: '123',
              name: 'Bot',
              role: 'bot',
            },
            id: 'emulator-required-id-a5c7a950-9c16-11e9-a2fc-f170e382beae',
            inputHint: 'expectingInput',
            recipient: {
              id: '99b60ee8-3ffc-45c0-88cc-59b598641827',
              name: 'User',
              role: 'user',
            },
            replyToId: 'a5c5d490-9c16-11e9-a2fc-f170e382beae',
            serviceUrl: 'http://localhost:60002',
            text: 'Please enter your last name.',
            type: 'message',
          },
          text: 'message',
        },
        type: 'inspectable-object',
      },
      {
        payload: {
          obj: {
            channelId: 'emulator',
            conversation: {
              id: '6a3c96c1-9c16-11e9-b530-d5773e50965f|livechat',
            },
            from: {
              id: '123',
              name: 'Bot',
              role: 'bot',
            },
            id: 'emulator-required-id-a5c7a950-9c16-11e9-a2fc-f170e382beae',
            inputHint: 'expectingInput',
            recipient: {
              id: '99b60ee8-3ffc-45c0-88cc-59b598641827',
              name: 'User',
              role: 'user',
            },
            replyToId: 'a5c5d490-9c16-11e9-a2fc-f170e382beae',
            serviceUrl: 'http://localhost:60002',
            text: 'Please enter your last name.',
            type: 'message',
          },
        },
        type: 'summary-text',
      },
    ],
    timestamp: 1561995669605,
  },
  {
    items: [
      {
        payload: {
          level: 0,
          text: '<- ',
        },
        type: 'text',
      },
      {
        payload: {
          obj: {
            channelId: 'emulator',
            conversation: {
              id: '9dc7ee90-9c16-11e9-a2fc-f170e382beae|livechat',
            },
            from: {
              id: '552539a0-9c15-11e9-b530-d5773e50965f',
              name: 'Bot',
              role: 'bot',
            },
            id: 'a5c95700-9c16-11e9-a2fc-f170e382beae',
            label: 'Bot State',
            localTimestamp: '2019-07-01T08:41:09-07:00',
            locale: 'en-US',
            name: 'BotState',
            recipient: {
              id: '99b60ee8-3ffc-45c0-88cc-59b598641827',
              role: 'user',
            },
            serviceUrl: 'http://localhost:60002',
            timestamp: '2019-07-01T15:41:09.616Z',
            type: 'trace',
            value: {
              conversationState: {
                dialogState: {
                  dialogStack: [
                    {
                      id: 'root',
                      state: {
                        options: {},
                        stepIndex: 0,
                        values: {
                          instanceId: '6e732f12-4b0e-1b19-95c6-50213cd9ec1d',
                        },
                      },
                    },
                    {
                      id: 'slot-dialog',
                      state: {
                        slot: 'fullname',
                        values: {},
                      },
                    },
                    {
                      id: 'fullname',
                      state: {
                        slot: 'last',
                        values: {
                          first: 'Joe',
                        },
                      },
                    },
                    {
                      id: 'text',
                      state: {
                        options: {
                          prompt: 'Please enter your last name.',
                        },
                        state: {},
                      },
                    },
                  ],
                },
                eTag: '*',
              },
              userState: {},
            },
            valueType: 'https://www.botframework.com/schemas/botState',
          },
          text: 'trace',
        },
        type: 'inspectable-object',
      },
      {
        payload: {
          obj: {
            channelId: 'emulator',
            conversation: {
              id: '9dc7ee90-9c16-11e9-a2fc-f170e382beae|livechat',
            },
            from: {
              id: '552539a0-9c15-11e9-b530-d5773e50965f',
              name: 'Bot',
              role: 'bot',
            },
            id: 'a5c95700-9c16-11e9-a2fc-f170e382beae',
            label: 'Bot State',
            localTimestamp: '2019-07-01T08:41:09-07:00',
            locale: 'en-US',
            name: 'BotState',
            recipient: {
              id: '99b60ee8-3ffc-45c0-88cc-59b598641827',
              role: 'user',
            },
            serviceUrl: 'http://localhost:60002',
            timestamp: '2019-07-01T15:41:09.616Z',
            type: 'trace',
            value: {
              conversationState: {
                dialogState: {
                  dialogStack: [
                    {
                      id: 'root',
                      state: {
                        options: {},
                        stepIndex: 0,
                        values: {
                          instanceId: '6e732f12-4b0e-1b19-95c6-50213cd9ec1d',
                        },
                      },
                    },
                    {
                      id: 'slot-dialog',
                      state: {
                        slot: 'fullname',
                        values: {},
                      },
                    },
                    {
                      id: 'fullname',
                      state: {
                        slot: 'last',
                        values: {
                          first: 'Joe',
                        },
                      },
                    },
                    {
                      id: 'text',
                      state: {
                        options: {
                          prompt: 'Please enter your last name.',
                        },
                        state: {},
                      },
                    },
                  ],
                },
                eTag: '*',
              },
              userState: {},
            },
            valueType: 'https://www.botframework.com/schemas/botState',
          },
        },
        type: 'summary-text',
      },
    ],
    timestamp: 1561995669616,
  },
  {
    items: [
      {
        payload: {
          level: 0,
          text: '<- ',
        },
        type: 'text',
      },
      {
        payload: {
          obj: {
            channelId: 'emulator',
            conversation: {
              id: '9dc7ee90-9c16-11e9-a2fc-f170e382beae|livechat',
            },
            from: {
              id: '552539a0-9c15-11e9-b530-d5773e50965f',
              name: 'Bot',
              role: 'bot',
            },
            id: 'a7f27890-9c16-11e9-a2fc-f170e382beae',
            label: 'Received Activity',
            localTimestamp: '2019-07-01T08:41:13-07:00',
            locale: 'en-US',
            name: 'ReceivedActivity',
            recipient: {
              id: '99b60ee8-3ffc-45c0-88cc-59b598641827',
              role: 'user',
            },
            serviceUrl: 'http://localhost:60002',
            timestamp: '2019-07-01T15:41:13.241Z',
            type: 'trace',
            value: {
              channelData: {
                clientActivityID: '15619956732300.j0slyoyawej',
              },
              channelId: 'emulator',
              conversation: {
                id: '6a3c96c1-9c16-11e9-b530-d5773e50965f|livechat',
              },
              from: {
                id: '99b60ee8-3ffc-45c0-88cc-59b598641827',
                name: 'User',
                role: 'user',
              },
              id: 'a7f16720-9c16-11e9-a2fc-f170e382beae',
              localTimestamp: '2019-07-01T15:41:13.000Z',
              locale: 'en-US',
              recipient: {
                id: '123',
                name: 'Bot',
                role: 'bot',
              },
              serviceUrl: 'http://localhost:60002',
              text: 'Schmo',
              textFormat: 'plain',
              timestamp: '2019-07-01T15:41:13.234Z',
              type: 'message',
            },
            valueType: 'https://www.botframework.com/schemas/activity',
          },
          text: 'trace',
        },
        type: 'inspectable-object',
      },
      {
        payload: {
          obj: {
            channelId: 'emulator',
            conversation: {
              id: '9dc7ee90-9c16-11e9-a2fc-f170e382beae|livechat',
            },
            from: {
              id: '552539a0-9c15-11e9-b530-d5773e50965f',
              name: 'Bot',
              role: 'bot',
            },
            id: 'a7f27890-9c16-11e9-a2fc-f170e382beae',
            label: 'Received Activity',
            localTimestamp: '2019-07-01T08:41:13-07:00',
            locale: 'en-US',
            name: 'ReceivedActivity',
            recipient: {
              id: '99b60ee8-3ffc-45c0-88cc-59b598641827',
              role: 'user',
            },
            serviceUrl: 'http://localhost:60002',
            timestamp: '2019-07-01T15:41:13.241Z',
            type: 'trace',
            value: {
              channelData: {
                clientActivityID: '15619956732300.j0slyoyawej',
              },
              channelId: 'emulator',
              conversation: {
                id: '6a3c96c1-9c16-11e9-b530-d5773e50965f|livechat',
              },
              from: {
                id: '99b60ee8-3ffc-45c0-88cc-59b598641827',
                name: 'User',
                role: 'user',
              },
              id: 'a7f16720-9c16-11e9-a2fc-f170e382beae',
              localTimestamp: '2019-07-01T15:41:13.000Z',
              locale: 'en-US',
              recipient: {
                id: '123',
                name: 'Bot',
                role: 'bot',
              },
              serviceUrl: 'http://localhost:60002',
              text: 'Schmo',
              textFormat: 'plain',
              timestamp: '2019-07-01T15:41:13.234Z',
              type: 'message',
            },
            valueType: 'https://www.botframework.com/schemas/activity',
          },
        },
        type: 'summary-text',
      },
      {
        payload: {
          level: 0,
          text: '<- ',
        },
        type: 'text',
      },
      {
        payload: {
          obj: {
            channelData: {
              clientActivityID: '15619956732300.j0slyoyawej',
            },
            channelId: 'emulator',
            conversation: {
              id: '6a3c96c1-9c16-11e9-b530-d5773e50965f|livechat',
            },
            from: {
              id: '99b60ee8-3ffc-45c0-88cc-59b598641827',
              name: 'User',
              role: 'user',
            },
            id: 'a7f16720-9c16-11e9-a2fc-f170e382beae',
            localTimestamp: '2019-07-01T15:41:13.000Z',
            locale: 'en-US',
            recipient: {
              id: '123',
              name: 'Bot',
              role: 'bot',
            },
            serviceUrl: 'http://localhost:60002',
            text: 'Schmo',
            textFormat: 'plain',
            timestamp: '2019-07-01T15:41:13.234Z',
            type: 'message',
          },
          text: 'message',
        },
        type: 'inspectable-object',
      },
      {
        payload: {
          obj: {
            channelData: {
              clientActivityID: '15619956732300.j0slyoyawej',
            },
            channelId: 'emulator',
            conversation: {
              id: '6a3c96c1-9c16-11e9-b530-d5773e50965f|livechat',
            },
            from: {
              id: '99b60ee8-3ffc-45c0-88cc-59b598641827',
              name: 'User',
              role: 'user',
            },
            id: 'a7f16720-9c16-11e9-a2fc-f170e382beae',
            localTimestamp: '2019-07-01T15:41:13.000Z',
            locale: 'en-US',
            recipient: {
              id: '123',
              name: 'Bot',
              role: 'bot',
            },
            serviceUrl: 'http://localhost:60002',
            text: 'Schmo',
            textFormat: 'plain',
            timestamp: '2019-07-01T15:41:13.234Z',
            type: 'message',
          },
        },
        type: 'summary-text',
      },
    ],
    timestamp: 1561995673241,
  },
  {
    items: [
      {
        payload: {
          level: 0,
          text: '<- ',
        },
        type: 'text',
      },
      {
        payload: {
          obj: {
            channelId: 'emulator',
            conversation: {
              id: '9dc7ee90-9c16-11e9-a2fc-f170e382beae|livechat',
            },
            from: {
              id: '552539a0-9c15-11e9-b530-d5773e50965f',
              name: 'Bot',
              role: 'bot',
            },
            id: 'a7f362f0-9c16-11e9-a2fc-f170e382beae',
            label: 'Sent Activity',
            localTimestamp: '2019-07-01T08:41:13-07:00',
            locale: 'en-US',
            name: 'SentActivity',
            recipient: {
              id: '99b60ee8-3ffc-45c0-88cc-59b598641827',
              role: 'user',
            },
            serviceUrl: 'http://localhost:60002',
            timestamp: '2019-07-01T15:41:13.247Z',
            type: 'trace',
            value: {
              channelId: 'emulator',
              conversation: {
                id: '6a3c96c1-9c16-11e9-b530-d5773e50965f|livechat',
              },
              from: {
                id: '123',
                name: 'Bot',
                role: 'bot',
              },
              id: 'emulator-required-id-a7f362f0-9c16-11e9-a2fc-f170e382beae',
              inputHint: 'expectingInput',
              recipient: {
                id: '99b60ee8-3ffc-45c0-88cc-59b598641827',
                name: 'User',
                role: 'user',
              },
              replyToId: 'a7f16720-9c16-11e9-a2fc-f170e382beae',
              serviceUrl: 'http://localhost:60002',
              text: 'Please enter your age.',
              type: 'message',
            },
            valueType: 'https://www.botframework.com/schemas/activity',
          },
          text: 'trace',
        },
        type: 'inspectable-object',
      },
      {
        payload: {
          obj: {
            channelId: 'emulator',
            conversation: {
              id: '9dc7ee90-9c16-11e9-a2fc-f170e382beae|livechat',
            },
            from: {
              id: '552539a0-9c15-11e9-b530-d5773e50965f',
              name: 'Bot',
              role: 'bot',
            },
            id: 'a7f362f0-9c16-11e9-a2fc-f170e382beae',
            label: 'Sent Activity',
            localTimestamp: '2019-07-01T08:41:13-07:00',
            locale: 'en-US',
            name: 'SentActivity',
            recipient: {
              id: '99b60ee8-3ffc-45c0-88cc-59b598641827',
              role: 'user',
            },
            serviceUrl: 'http://localhost:60002',
            timestamp: '2019-07-01T15:41:13.247Z',
            type: 'trace',
            value: {
              channelId: 'emulator',
              conversation: {
                id: '6a3c96c1-9c16-11e9-b530-d5773e50965f|livechat',
              },
              from: {
                id: '123',
                name: 'Bot',
                role: 'bot',
              },
              id: 'emulator-required-id-a7f362f0-9c16-11e9-a2fc-f170e382beae',
              inputHint: 'expectingInput',
              recipient: {
                id: '99b60ee8-3ffc-45c0-88cc-59b598641827',
                name: 'User',
                role: 'user',
              },
              replyToId: 'a7f16720-9c16-11e9-a2fc-f170e382beae',
              serviceUrl: 'http://localhost:60002',
              text: 'Please enter your age.',
              type: 'message',
            },
            valueType: 'https://www.botframework.com/schemas/activity',
          },
        },
        type: 'summary-text',
      },
      {
        payload: {
          level: 0,
          text: '-> ',
        },
        type: 'text',
      },
      {
        payload: {
          obj: {
            channelId: 'emulator',
            conversation: {
              id: '6a3c96c1-9c16-11e9-b530-d5773e50965f|livechat',
            },
            from: {
              id: '123',
              name: 'Bot',
              role: 'bot',
            },
            id: 'emulator-required-id-a7f362f0-9c16-11e9-a2fc-f170e382beae',
            inputHint: 'expectingInput',
            recipient: {
              id: '99b60ee8-3ffc-45c0-88cc-59b598641827',
              name: 'User',
              role: 'user',
            },
            replyToId: 'a7f16720-9c16-11e9-a2fc-f170e382beae',
            serviceUrl: 'http://localhost:60002',
            text: 'Please enter your age.',
            type: 'message',
          },
          text: 'message',
        },
        type: 'inspectable-object',
      },
      {
        payload: {
          obj: {
            channelId: 'emulator',
            conversation: {
              id: '6a3c96c1-9c16-11e9-b530-d5773e50965f|livechat',
            },
            from: {
              id: '123',
              name: 'Bot',
              role: 'bot',
            },
            id: 'emulator-required-id-a7f362f0-9c16-11e9-a2fc-f170e382beae',
            inputHint: 'expectingInput',
            recipient: {
              id: '99b60ee8-3ffc-45c0-88cc-59b598641827',
              name: 'User',
              role: 'user',
            },
            replyToId: 'a7f16720-9c16-11e9-a2fc-f170e382beae',
            serviceUrl: 'http://localhost:60002',
            text: 'Please enter your age.',
            type: 'message',
          },
        },
        type: 'summary-text',
      },
    ],
    timestamp: 1561995673247,
  },
  {
    items: [
      {
        payload: {
          level: 0,
          text: '<- ',
        },
        type: 'text',
      },
      {
        payload: {
          obj: {
            channelId: 'emulator',
            conversation: {
              id: '9dc7ee90-9c16-11e9-a2fc-f170e382beae|livechat',
            },
            from: {
              id: '552539a0-9c15-11e9-b530-d5773e50965f',
              name: 'Bot',
              role: 'bot',
            },
            id: 'a7f4e990-9c16-11e9-a2fc-f170e382beae',
            label: 'Bot State',
            localTimestamp: '2019-07-01T08:41:13-07:00',
            locale: 'en-US',
            name: 'BotState',
            recipient: {
              id: '99b60ee8-3ffc-45c0-88cc-59b598641827',
              role: 'user',
            },
            serviceUrl: 'http://localhost:60002',
            timestamp: '2019-07-01T15:41:13.257Z',
            type: 'trace',
            value: {
              conversationState: {
                dialogState: {
                  dialogStack: [
                    {
                      id: 'root',
                      state: {
                        options: {},
                        stepIndex: 0,
                        values: {
                          instanceId: '6e732f12-4b0e-1b19-95c6-50213cd9ec1d',
                        },
                      },
                    },
                    {
                      id: 'slot-dialog',
                      state: {
                        slot: 'age',
                        values: {
                          fullname: {
                            slot: 'last',
                            values: {
                              first: 'Joe',
                              last: 'Schmo',
                            },
                          },
                        },
                      },
                    },
                    {
                      id: 'number',
                      state: {
                        options: {
                          prompt: 'Please enter your age.',
                        },
                        state: {},
                      },
                    },
                  ],
                },
                eTag: '*',
              },
              userState: {},
            },
            valueType: 'https://www.botframework.com/schemas/botState',
          },
          text: 'trace',
        },
        type: 'inspectable-object',
      },
      {
        payload: {
          obj: {
            channelId: 'emulator',
            conversation: {
              id: '9dc7ee90-9c16-11e9-a2fc-f170e382beae|livechat',
            },
            from: {
              id: '552539a0-9c15-11e9-b530-d5773e50965f',
              name: 'Bot',
              role: 'bot',
            },
            id: 'a7f4e990-9c16-11e9-a2fc-f170e382beae',
            label: 'Bot State',
            localTimestamp: '2019-07-01T08:41:13-07:00',
            locale: 'en-US',
            name: 'BotState',
            recipient: {
              id: '99b60ee8-3ffc-45c0-88cc-59b598641827',
              role: 'user',
            },
            serviceUrl: 'http://localhost:60002',
            timestamp: '2019-07-01T15:41:13.257Z',
            type: 'trace',
            value: {
              conversationState: {
                dialogState: {
                  dialogStack: [
                    {
                      id: 'root',
                      state: {
                        options: {},
                        stepIndex: 0,
                        values: {
                          instanceId: '6e732f12-4b0e-1b19-95c6-50213cd9ec1d',
                        },
                      },
                    },
                    {
                      id: 'slot-dialog',
                      state: {
                        slot: 'age',
                        values: {
                          fullname: {
                            slot: 'last',
                            values: {
                              first: 'Joe',
                              last: 'Schmo',
                            },
                          },
                        },
                      },
                    },
                    {
                      id: 'number',
                      state: {
                        options: {
                          prompt: 'Please enter your age.',
                        },
                        state: {},
                      },
                    },
                  ],
                },
                eTag: '*',
              },
              userState: {},
            },
            valueType: 'https://www.botframework.com/schemas/botState',
          },
        },
        type: 'summary-text',
      },
    ],
    timestamp: 1561995673257,
  },
  {
    items: [
      {
        payload: {
          level: 0,
          text: '<- ',
        },
        type: 'text',
      },
      {
        payload: {
          obj: {
            channelId: 'emulator',
            conversation: {
              id: '9dc7ee90-9c16-11e9-a2fc-f170e382beae|livechat',
            },
            from: {
              id: '552539a0-9c15-11e9-b530-d5773e50965f',
              name: 'Bot',
              role: 'bot',
            },
            id: 'aa680c70-9c16-11e9-a2fc-f170e382beae',
            label: 'Received Activity',
            localTimestamp: '2019-07-01T08:41:17-07:00',
            locale: 'en-US',
            name: 'ReceivedActivity',
            recipient: {
              id: '99b60ee8-3ffc-45c0-88cc-59b598641827',
              role: 'user',
            },
            serviceUrl: 'http://localhost:60002',
            timestamp: '2019-07-01T15:41:17.367Z',
            type: 'trace',
            value: {
              channelData: {
                clientActivityID: '15619956773390.fiog39rlqcl',
              },
              channelId: 'emulator',
              conversation: {
                id: '6a3c96c1-9c16-11e9-b530-d5773e50965f|livechat',
              },
              from: {
                id: '99b60ee8-3ffc-45c0-88cc-59b598641827',
                name: 'User',
                role: 'user',
              },
              id: 'aa672210-9c16-11e9-a2fc-f170e382beae',
              localTimestamp: '2019-07-01T15:41:17.000Z',
              locale: 'en-US',
              recipient: {
                id: '123',
                name: 'Bot',
                role: 'bot',
              },
              serviceUrl: 'http://localhost:60002',
              text: '21',
              textFormat: 'plain',
              timestamp: '2019-07-01T15:41:17.361Z',
              type: 'message',
            },
            valueType: 'https://www.botframework.com/schemas/activity',
          },
          text: 'trace',
        },
        type: 'inspectable-object',
      },
      {
        payload: {
          obj: {
            channelId: 'emulator',
            conversation: {
              id: '9dc7ee90-9c16-11e9-a2fc-f170e382beae|livechat',
            },
            from: {
              id: '552539a0-9c15-11e9-b530-d5773e50965f',
              name: 'Bot',
              role: 'bot',
            },
            id: 'aa680c70-9c16-11e9-a2fc-f170e382beae',
            label: 'Received Activity',
            localTimestamp: '2019-07-01T08:41:17-07:00',
            locale: 'en-US',
            name: 'ReceivedActivity',
            recipient: {
              id: '99b60ee8-3ffc-45c0-88cc-59b598641827',
              role: 'user',
            },
            serviceUrl: 'http://localhost:60002',
            timestamp: '2019-07-01T15:41:17.367Z',
            type: 'trace',
            value: {
              channelData: {
                clientActivityID: '15619956773390.fiog39rlqcl',
              },
              channelId: 'emulator',
              conversation: {
                id: '6a3c96c1-9c16-11e9-b530-d5773e50965f|livechat',
              },
              from: {
                id: '99b60ee8-3ffc-45c0-88cc-59b598641827',
                name: 'User',
                role: 'user',
              },
              id: 'aa672210-9c16-11e9-a2fc-f170e382beae',
              localTimestamp: '2019-07-01T15:41:17.000Z',
              locale: 'en-US',
              recipient: {
                id: '123',
                name: 'Bot',
                role: 'bot',
              },
              serviceUrl: 'http://localhost:60002',
              text: '21',
              textFormat: 'plain',
              timestamp: '2019-07-01T15:41:17.361Z',
              type: 'message',
            },
            valueType: 'https://www.botframework.com/schemas/activity',
          },
        },
        type: 'summary-text',
      },
      {
        payload: {
          level: 0,
          text: '<- ',
        },
        type: 'text',
      },
      {
        payload: {
          obj: {
            channelData: {
              clientActivityID: '15619956773390.fiog39rlqcl',
            },
            channelId: 'emulator',
            conversation: {
              id: '6a3c96c1-9c16-11e9-b530-d5773e50965f|livechat',
            },
            from: {
              id: '99b60ee8-3ffc-45c0-88cc-59b598641827',
              name: 'User',
              role: 'user',
            },
            id: 'aa672210-9c16-11e9-a2fc-f170e382beae',
            localTimestamp: '2019-07-01T15:41:17.000Z',
            locale: 'en-US',
            recipient: {
              id: '123',
              name: 'Bot',
              role: 'bot',
            },
            serviceUrl: 'http://localhost:60002',
            text: '21',
            textFormat: 'plain',
            timestamp: '2019-07-01T15:41:17.361Z',
            type: 'message',
          },
          text: 'message',
        },
        type: 'inspectable-object',
      },
      {
        payload: {
          obj: {
            channelData: {
              clientActivityID: '15619956773390.fiog39rlqcl',
            },
            channelId: 'emulator',
            conversation: {
              id: '6a3c96c1-9c16-11e9-b530-d5773e50965f|livechat',
            },
            from: {
              id: '99b60ee8-3ffc-45c0-88cc-59b598641827',
              name: 'User',
              role: 'user',
            },
            id: 'aa672210-9c16-11e9-a2fc-f170e382beae',
            localTimestamp: '2019-07-01T15:41:17.000Z',
            locale: 'en-US',
            recipient: {
              id: '123',
              name: 'Bot',
              role: 'bot',
            },
            serviceUrl: 'http://localhost:60002',
            text: '21',
            textFormat: 'plain',
            timestamp: '2019-07-01T15:41:17.361Z',
            type: 'message',
          },
        },
        type: 'summary-text',
      },
    ],
    timestamp: 1561995677367,
  },
  {
    items: [
      {
        payload: {
          level: 0,
          text: '<- ',
        },
        type: 'text',
      },
      {
        payload: {
          obj: {
            channelId: 'emulator',
            conversation: {
              id: '9dc7ee90-9c16-11e9-a2fc-f170e382beae|livechat',
            },
            from: {
              id: '552539a0-9c15-11e9-b530-d5773e50965f',
              name: 'Bot',
              role: 'bot',
            },
            id: 'aa69ba20-9c16-11e9-a2fc-f170e382beae',
            label: 'Sent Activity',
            localTimestamp: '2019-07-01T08:41:17-07:00',
            locale: 'en-US',
            name: 'SentActivity',
            recipient: {
              id: '99b60ee8-3ffc-45c0-88cc-59b598641827',
              role: 'user',
            },
            serviceUrl: 'http://localhost:60002',
            timestamp: '2019-07-01T15:41:17.378Z',
            type: 'trace',
            value: {
              channelId: 'emulator',
              conversation: {
                id: '6a3c96c1-9c16-11e9-b530-d5773e50965f|livechat',
              },
              from: {
                id: '123',
                name: 'Bot',
                role: 'bot',
              },
              id: 'emulator-required-id-aa69ba20-9c16-11e9-a2fc-f170e382beae',
              inputHint: 'expectingInput',
              recipient: {
                id: '99b60ee8-3ffc-45c0-88cc-59b598641827',
                name: 'User',
                role: 'user',
              },
              replyToId: 'aa672210-9c16-11e9-a2fc-f170e382beae',
              serviceUrl: 'http://localhost:60002',
              text: 'Please enter your shoe size.',
              type: 'message',
            },
            valueType: 'https://www.botframework.com/schemas/activity',
          },
          text: 'trace',
        },
        type: 'inspectable-object',
      },
      {
        payload: {
          obj: {
            channelId: 'emulator',
            conversation: {
              id: '9dc7ee90-9c16-11e9-a2fc-f170e382beae|livechat',
            },
            from: {
              id: '552539a0-9c15-11e9-b530-d5773e50965f',
              name: 'Bot',
              role: 'bot',
            },
            id: 'aa69ba20-9c16-11e9-a2fc-f170e382beae',
            label: 'Sent Activity',
            localTimestamp: '2019-07-01T08:41:17-07:00',
            locale: 'en-US',
            name: 'SentActivity',
            recipient: {
              id: '99b60ee8-3ffc-45c0-88cc-59b598641827',
              role: 'user',
            },
            serviceUrl: 'http://localhost:60002',
            timestamp: '2019-07-01T15:41:17.378Z',
            type: 'trace',
            value: {
              channelId: 'emulator',
              conversation: {
                id: '6a3c96c1-9c16-11e9-b530-d5773e50965f|livechat',
              },
              from: {
                id: '123',
                name: 'Bot',
                role: 'bot',
              },
              id: 'emulator-required-id-aa69ba20-9c16-11e9-a2fc-f170e382beae',
              inputHint: 'expectingInput',
              recipient: {
                id: '99b60ee8-3ffc-45c0-88cc-59b598641827',
                name: 'User',
                role: 'user',
              },
              replyToId: 'aa672210-9c16-11e9-a2fc-f170e382beae',
              serviceUrl: 'http://localhost:60002',
              text: 'Please enter your shoe size.',
              type: 'message',
            },
            valueType: 'https://www.botframework.com/schemas/activity',
          },
        },
        type: 'summary-text',
      },
      {
        payload: {
          level: 0,
          text: '-> ',
        },
        type: 'text',
      },
      {
        payload: {
          obj: {
            channelId: 'emulator',
            conversation: {
              id: '6a3c96c1-9c16-11e9-b530-d5773e50965f|livechat',
            },
            from: {
              id: '123',
              name: 'Bot',
              role: 'bot',
            },
            id: 'emulator-required-id-aa69ba20-9c16-11e9-a2fc-f170e382beae',
            inputHint: 'expectingInput',
            recipient: {
              id: '99b60ee8-3ffc-45c0-88cc-59b598641827',
              name: 'User',
              role: 'user',
            },
            replyToId: 'aa672210-9c16-11e9-a2fc-f170e382beae',
            serviceUrl: 'http://localhost:60002',
            text: 'Please enter your shoe size.',
            type: 'message',
          },
          text: 'message',
        },
        type: 'inspectable-object',
      },
      {
        payload: {
          obj: {
            channelId: 'emulator',
            conversation: {
              id: '6a3c96c1-9c16-11e9-b530-d5773e50965f|livechat',
            },
            from: {
              id: '123',
              name: 'Bot',
              role: 'bot',
            },
            id: 'emulator-required-id-aa69ba20-9c16-11e9-a2fc-f170e382beae',
            inputHint: 'expectingInput',
            recipient: {
              id: '99b60ee8-3ffc-45c0-88cc-59b598641827',
              name: 'User',
              role: 'user',
            },
            replyToId: 'aa672210-9c16-11e9-a2fc-f170e382beae',
            serviceUrl: 'http://localhost:60002',
            text: 'Please enter your shoe size.',
            type: 'message',
          },
        },
        type: 'summary-text',
      },
    ],
    timestamp: 1561995677378,
  },
  {
    items: [
      {
        payload: {
          level: 0,
          text: '<- ',
        },
        type: 'text',
      },
      {
        payload: {
          obj: {
            channelId: 'emulator',
            conversation: {
              id: '9dc7ee90-9c16-11e9-a2fc-f170e382beae|livechat',
            },
            from: {
              id: '552539a0-9c15-11e9-b530-d5773e50965f',
              name: 'Bot',
              role: 'bot',
            },
            id: 'aa6b67d0-9c16-11e9-a2fc-f170e382beae',
            label: 'Bot State',
            localTimestamp: '2019-07-01T08:41:17-07:00',
            locale: 'en-US',
            name: 'BotState',
            recipient: {
              id: '99b60ee8-3ffc-45c0-88cc-59b598641827',
              role: 'user',
            },
            serviceUrl: 'http://localhost:60002',
            timestamp: '2019-07-01T15:41:17.389Z',
            type: 'trace',
            value: {
              conversationState: {
                dialogState: {
                  dialogStack: [
                    {
                      id: 'root',
                      state: {
                        options: {},
                        stepIndex: 0,
                        values: {
                          instanceId: '6e732f12-4b0e-1b19-95c6-50213cd9ec1d',
                        },
                      },
                    },
                    {
                      id: 'slot-dialog',
                      state: {
                        slot: 'shoesize',
                        values: {
                          age: 21,
                          fullname: {
                            slot: 'last',
                            values: {
                              first: 'Joe',
                              last: 'Schmo',
                            },
                          },
                        },
                      },
                    },
                    {
                      id: 'shoesize',
                      state: {
                        options: {
                          prompt: 'Please enter your shoe size.',
                          retryPrompt: 'You must enter a size between 0 and 16. Half sizes are acceptable.',
                        },
                        state: {},
                      },
                    },
                  ],
                },
                eTag: '*',
              },
              userState: {},
            },
            valueType: 'https://www.botframework.com/schemas/botState',
          },
          text: 'trace',
        },
        type: 'inspectable-object',
      },
      {
        payload: {
          obj: {
            channelId: 'emulator',
            conversation: {
              id: '9dc7ee90-9c16-11e9-a2fc-f170e382beae|livechat',
            },
            from: {
              id: '552539a0-9c15-11e9-b530-d5773e50965f',
              name: 'Bot',
              role: 'bot',
            },
            id: 'aa6b67d0-9c16-11e9-a2fc-f170e382beae',
            label: 'Bot State',
            localTimestamp: '2019-07-01T08:41:17-07:00',
            locale: 'en-US',
            name: 'BotState',
            recipient: {
              id: '99b60ee8-3ffc-45c0-88cc-59b598641827',
              role: 'user',
            },
            serviceUrl: 'http://localhost:60002',
            timestamp: '2019-07-01T15:41:17.389Z',
            type: 'trace',
            value: {
              conversationState: {
                dialogState: {
                  dialogStack: [
                    {
                      id: 'root',
                      state: {
                        options: {},
                        stepIndex: 0,
                        values: {
                          instanceId: '6e732f12-4b0e-1b19-95c6-50213cd9ec1d',
                        },
                      },
                    },
                    {
                      id: 'slot-dialog',
                      state: {
                        slot: 'shoesize',
                        values: {
                          age: 21,
                          fullname: {
                            slot: 'last',
                            values: {
                              first: 'Joe',
                              last: 'Schmo',
                            },
                          },
                        },
                      },
                    },
                    {
                      id: 'shoesize',
                      state: {
                        options: {
                          prompt: 'Please enter your shoe size.',
                          retryPrompt: 'You must enter a size between 0 and 16. Half sizes are acceptable.',
                        },
                        state: {},
                      },
                    },
                  ],
                },
                eTag: '*',
              },
              userState: {},
            },
            valueType: 'https://www.botframework.com/schemas/botState',
          },
        },
        type: 'summary-text',
      },
    ],
    timestamp: 1561995677389,
  },
];

export const mockDiff0 = {
  channelId: 'emulator',
  conversation: {
    id: '9dc7ee90-9c16-11e9-a2fc-f170e382beae|livechat',
  },
  from: {
    id: '552539a0-9c15-11e9-b530-d5773e50965f',
    name: 'Bot',
    role: 'bot',
  },
  id: 'a5c95700-9c16-11e9-a2fc-f170e382beae',
  label: 'Bot State',
  localTimestamp: '2019-07-01T08:41:09-07:00',
  locale: 'en-US',
  name: 'BotState',
  recipient: {
    id: '99b60ee8-3ffc-45c0-88cc-59b598641827',
    role: 'user',
  },
  serviceUrl: 'http://localhost:60002',
  timestamp: '2019-07-01T15:41:09.616Z',
  type: 'trace',
  value: {
    conversationState: {
      dialogState: {
        dialogStack: {
          '0': {
            id: 'root',
            state: {
              options: {},
              stepIndex: 0,
              values: {
                instanceId: '6e732f12-4b0e-1b19-95c6-50213cd9ec1d',
              },
            },
          },
          '1': {
            id: 'slot-dialog',
            state: {
              slot: 'fullname',
              values: {},
            },
          },
          '2': {
            id: 'fullname',
            state: {
              '+slot': 'last',
              '-slot': 'first',
              values: {
                '+first': 'Joe',
              },
            },
          },
          '3': {
            id: 'text',
            state: {
              options: {
                '+prompt': 'Please enter your last name.',
                '-prompt': 'Please enter your first name.',
              },
              state: {},
            },
          },
        },
      },
      eTag: '*',
    },
    userState: {},
  },
  valueType: 'https://www.botframework.com/schemas/diff',
};
export const mockDiff1 = {
  channelId: 'emulator',
  conversation: {
    id: '9dc7ee90-9c16-11e9-a2fc-f170e382beae|livechat',
  },
  from: {
    id: '552539a0-9c15-11e9-b530-d5773e50965f',
    name: 'Bot',
    role: 'bot',
  },
  id: 'a7f4e990-9c16-11e9-a2fc-f170e382beae',
  label: 'Bot State',
  localTimestamp: '2019-07-01T08:41:13-07:00',
  locale: 'en-US',
  name: 'BotState',
  recipient: {
    id: '99b60ee8-3ffc-45c0-88cc-59b598641827',
    role: 'user',
  },
  serviceUrl: 'http://localhost:60002',
  timestamp: '2019-07-01T15:41:13.257Z',
  type: 'trace',
  value: {
    conversationState: {
      dialogState: {
        dialogStack: {
          '0': {
            id: 'root',
            state: {
              options: {},
              stepIndex: 0,
              values: {
                instanceId: '6e732f12-4b0e-1b19-95c6-50213cd9ec1d',
              },
            },
          },
          '1': {
            id: 'slot-dialog',
            state: {
              '+slot': 'age',
              '-slot': 'fullname',
              values: {
                fullname: {
                  slot: 'last',
                  values: {
                    first: 'Joe',
                    last: 'Schmo',
                  },
                },
              },
            },
          },
          '2': {
            '+id': 'number',
            '-id': 'fullname',
            state: {
              '-slot': 'last',
              '-values': {
                first: 'Joe',
              },
              options: {
                prompt: 'Please enter your age.',
              },
              state: {},
            },
          },
          '-3': {
            id: 'text',
            state: {
              options: {
                prompt: 'Please enter your last name.',
              },
              state: {},
            },
          },
        },
      },
      eTag: '*',
    },
    userState: {},
  },
  valueType: 'https://www.botframework.com/schemas/diff',
};
