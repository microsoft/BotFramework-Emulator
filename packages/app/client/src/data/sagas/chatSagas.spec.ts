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
import { applyMiddleware, combineReducers, createStore } from 'redux';
import sagaMiddlewareFactory from 'redux-saga';
import { ActivityTypes } from 'botframework-schema';
import * as Electron from 'electron';

import { bot } from '../reducer/bot';
import { chat } from '../reducer/chat';
import { editor } from '../reducer/editor';
import { presentation } from '../reducer/presentation';
import * as Constants from '../../constants';
import { CommandServiceImpl } from '../../platform/commands/commandServiceImpl';
import { showContextMenuForActivity } from '../action/chatActions';

import { chatSagas } from './chatSagas';

const sagaMiddleWare = sagaMiddlewareFactory();
let mockStore;
let mockStoreState;
const mockUnsubscribe = jest.fn(() => null);
jest.mock('../../ui/dialogs', () => ({}));
jest.mock('../store', () => ({
  get store() {
    return mockStore;
  },
}));

jest.mock('electron', () => {
  return {
    clipboard: { writeText: () => true },
  };
});

const log = {
  entries: [
    {
      items: [
        {
          payload: {
            obj: {
              channelId: 'emulator',
              conversation: {
                conversationType: 'personal',
                id: '9fb93120-5713-11e9-a20f-e185020ba18b|livechat',
              },
              from: {
                aadObjectId: '8d81b1c4-a057-4d27-a41d-e40b3105e6ee',
                id: '29:1roELw8-HUdxuNSlGwtGqacHW_y-tsmLhvs42duabIDv0JFovw3WX7QC-syrrAYRt0RHBqoS1i0Mt18un1YZmyw',
                name: 'Justin Wilaby',
                role: 'user',
              },
              id: 'a075a350-5713-11e9-a20f-e185020ba18b',
              label: 'Bot State',
              localTimestamp: '2019-04-04T12:55:41-07:00',
              locale: 'en',
              name: 'BotState',
              recipient: {
                id: '28:825059e1-0dd5-4a90-9136-121a702c18ca',
                role: 'user',
              },
              serviceUrl: 'http://localhost:9000',
              timestamp: '2019-04-04T19:55:41.957Z',
              type: 'trace',
              value: {
                conversationState: {
                  dialogState: {
                    conversationState: {},
                    dialogStack: [
                      {
                        id: 'root',
                        state: {
                          options: {},
                          stepIndex: 0,
                          values: {
                            instanceId: '6938f312-523a-2db2-92ba-9680f559dd2d',
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
                    userState: {},
                  },
                  eTag: '2',
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
                conversationType: 'personal',
                id: '9fb93120-5713-11e9-a20f-e185020ba18b|livechat',
              },
              from: {
                aadObjectId: '8d81b1c4-a057-4d27-a41d-e40b3105e6ee',
                id: '29:1roELw8-HUdxuNSlGwtGqacHW_y-tsmLhvs42duabIDv0JFovw3WX7QC-syrrAYRt0RHBqoS1i0Mt18un1YZmyw',
                name: 'Justin Wilaby',
                role: 'user',
              },
              id: 'a075a350-5713-11e9-a20f-e185020ba18b',
              label: 'Bot State',
              localTimestamp: '2019-04-04T12:55:41-07:00',
              locale: 'en',
              name: 'BotState',
              recipient: {
                id: '28:825059e1-0dd5-4a90-9136-121a702c18ca',
                role: 'user',
              },
              serviceUrl: 'http://localhost:9000',
              timestamp: '2019-04-04T19:55:41.957Z',
              type: 'trace',
              value: {
                conversationState: {
                  dialogState: {
                    conversationState: {},
                    dialogStack: [
                      {
                        id: 'root',
                        state: {
                          options: {},
                          stepIndex: 0,
                          values: {
                            instanceId: '6938f312-523a-2db2-92ba-9680f559dd2d',
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
                    userState: {},
                  },
                  eTag: '2',
                },
                userState: {},
              },
              valueType: 'https://www.botframework.com/schemas/botState',
            },
          },
          type: 'summary-text',
        },
      ],
      timestamp: 1554407741957,
    },
    {
      items: [
        {
          payload: {
            obj: {
              channelId: 'emulator',
              conversation: {
                conversationType: 'personal',
                id: '9fb93120-5713-11e9-a20f-e185020ba18b|livechat',
              },
              from: {
                aadObjectId: '8d81b1c4-a057-4d27-a41d-e40b3105e6ee',
                id: '29:1roELw8-HUdxuNSlGwtGqacHW_y-tsmLhvs42duabIDv0JFovw3WX7QC-syrrAYRt0RHBqoS1i0Mt18un1YZmyw',
                name: 'Justin Wilaby',
                role: 'user',
              },
              id: 'a498c020-5713-11e9-a20f-e185020ba18b',
              label: 'Bot State',
              localTimestamp: '2019-04-04T12:55:48-07:00',
              locale: 'en',
              name: 'BotState',
              recipient: {
                id: '28:825059e1-0dd5-4a90-9136-121a702c18ca',
                role: 'user',
              },
              serviceUrl: 'http://localhost:9000',
              timestamp: '2019-04-04T19:55:48.898Z',
              type: 'trace',
              value: {
                conversationState: {
                  dialogState: {
                    conversationState: {},
                    dialogStack: [
                      {
                        id: 'root',
                        state: {
                          options: {},
                          stepIndex: 0,
                          values: {
                            instanceId: '6938f312-523a-2db2-92ba-9680f559dd2d',
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
                            first: 'Justin ',
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
                    userState: {},
                  },
                  eTag: '3',
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
                conversationType: 'personal',
                id: '9fb93120-5713-11e9-a20f-e185020ba18b|livechat',
              },
              from: {
                aadObjectId: '8d81b1c4-a057-4d27-a41d-e40b3105e6ee',
                id: '29:1roELw8-HUdxuNSlGwtGqacHW_y-tsmLhvs42duabIDv0JFovw3WX7QC-syrrAYRt0RHBqoS1i0Mt18un1YZmyw',
                name: 'Justin Wilaby',
                role: 'user',
              },
              id: 'a498c020-5713-11e9-a20f-e185020ba18b',
              label: 'Bot State',
              localTimestamp: '2019-04-04T12:55:48-07:00',
              locale: 'en',
              name: 'BotState',
              recipient: {
                id: '28:825059e1-0dd5-4a90-9136-121a702c18ca',
                role: 'user',
              },
              serviceUrl: 'http://localhost:9000',
              timestamp: '2019-04-04T19:55:48.898Z',
              type: 'trace',
              value: {
                conversationState: {
                  dialogState: {
                    conversationState: {},
                    dialogStack: [
                      {
                        id: 'root',
                        state: {
                          options: {},
                          stepIndex: 0,
                          values: {
                            instanceId: '6938f312-523a-2db2-92ba-9680f559dd2d',
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
                            first: 'Justin ',
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
                    userState: {},
                  },
                  eTag: '3',
                },
                userState: {},
              },
              valueType: 'https://www.botframework.com/schemas/botState',
            },
          },
          type: 'summary-text',
        },
      ],
      timestamp: 1554407748898,
    },
    {
      items: [
        {
          payload: {
            obj: {
              channelId: 'emulator',
              conversation: {
                conversationType: 'personal',
                id: '9fb93120-5713-11e9-a20f-e185020ba18b|livechat',
              },
              from: {
                aadObjectId: '8d81b1c4-a057-4d27-a41d-e40b3105e6ee',
                id: '29:1roELw8-HUdxuNSlGwtGqacHW_y-tsmLhvs42duabIDv0JFovw3WX7QC-syrrAYRt0RHBqoS1i0Mt18un1YZmyw',
                name: 'Justin Wilaby',
                role: 'user',
              },
              id: 'a65d2c70-5713-11e9-a20f-e185020ba18b',
              label: 'Bot State',
              localTimestamp: '2019-04-04T12:55:51-07:00',
              locale: 'en',
              name: 'BotState',
              recipient: {
                id: '28:825059e1-0dd5-4a90-9136-121a702c18ca',
                role: 'user',
              },
              serviceUrl: 'http://localhost:9000',
              timestamp: '2019-04-04T19:55:51.863Z',
              type: 'trace',
              value: {
                conversationState: {
                  dialogState: {
                    conversationState: {},
                    dialogStack: [
                      {
                        id: 'root',
                        state: {
                          options: {},
                          stepIndex: 0,
                          values: {
                            instanceId: '6938f312-523a-2db2-92ba-9680f559dd2d',
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
                                first: 'Justin ',
                                last: 'Wilaby',
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
                    userState: {},
                  },
                  eTag: '4',
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
                conversationType: 'personal',
                id: '9fb93120-5713-11e9-a20f-e185020ba18b|livechat',
              },
              from: {
                aadObjectId: '8d81b1c4-a057-4d27-a41d-e40b3105e6ee',
                id: '29:1roELw8-HUdxuNSlGwtGqacHW_y-tsmLhvs42duabIDv0JFovw3WX7QC-syrrAYRt0RHBqoS1i0Mt18un1YZmyw',
                name: 'Justin Wilaby',
                role: 'user',
              },
              id: 'a65d2c70-5713-11e9-a20f-e185020ba18b',
              label: 'Bot State',
              localTimestamp: '2019-04-04T12:55:51-07:00',
              locale: 'en',
              name: 'BotState',
              recipient: {
                id: '28:825059e1-0dd5-4a90-9136-121a702c18ca',
                role: 'user',
              },
              serviceUrl: 'http://localhost:9000',
              timestamp: '2019-04-04T19:55:51.863Z',
              type: 'trace',
              value: {
                conversationState: {
                  dialogState: {
                    conversationState: {},
                    dialogStack: [
                      {
                        id: 'root',
                        state: {
                          options: {},
                          stepIndex: 0,
                          values: {
                            instanceId: '6938f312-523a-2db2-92ba-9680f559dd2d',
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
                                first: 'Justin ',
                                last: 'Wilaby',
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
                    userState: {},
                  },
                  eTag: '4',
                },
                userState: {},
              },
              valueType: 'https://www.botframework.com/schemas/botState',
            },
          },
          type: 'summary-text',
        },
      ],
      timestamp: 1554407751863,
    },
  ],
};

describe('The ChatSagas,', () => {
  beforeEach(() => {
    mockStoreState = {
      chat: {
        chats: {
          doc1: {
            log,
            conversationId: 'convo1',
            documentId: 'doc1',
            endpointId: 'endpoint1',
            userId: 'someUserId',
            subscription: { unsubscribe: mockUnsubscribe },
          },
        },
      },
      editor: {
        activeEditor: Constants.EDITOR_KEY_PRIMARY,
        editors: {
          [Constants.EDITOR_KEY_PRIMARY]: {
            activeDocumentId: 'doc1',
          },
        },
      },
      presentation: { enabled: true },
    };

    mockStore = createStore(
      combineReducers({
        bot,
        chat,
        editor,
        presentation,
      }),
      mockStoreState,
      applyMiddleware(sagaMiddleWare)
    );
    sagaMiddleWare.run(chatSagas);
  });

  describe('when showing a context menu for an activity', () => {
    it('should handle the "copy message" selection', async () => {
      const commandServiceSpy = jest.spyOn(CommandServiceImpl, 'remoteCall').mockResolvedValue({ id: 'copy' });
      const clipboardSpy = jest.spyOn(Electron.clipboard, 'writeText');
      const activity = {
        valueType: '',
        type: ActivityTypes.Trace,
        value: { type: ActivityTypes.Message, text: 'Hello Bot!' },
      };
      mockStore.dispatch(showContextMenuForActivity(activity));
      await Promise.resolve(true);
      expect(commandServiceSpy).toHaveBeenCalled();
      expect(clipboardSpy).toHaveBeenCalledWith('Hello Bot!');
    });

    it('should handle the "copy json" selection', async () => {
      const commandServiceSpy = jest.spyOn(CommandServiceImpl, 'remoteCall').mockResolvedValue({ id: 'json' });
      const clipboardSpy = jest.spyOn(Electron.clipboard, 'writeText');
      const activity = {
        valueType: '',
        type: ActivityTypes.Trace,
        value: { type: ActivityTypes.Message, text: 'Hello Bot!' },
      };
      mockStore.dispatch(showContextMenuForActivity(activity));
      await Promise.resolve(true);
      expect(commandServiceSpy).toHaveBeenCalled();
      expect(clipboardSpy).toHaveBeenCalledWith(JSON.stringify(activity, null, 2));
    });

    it('should handle the "Compare with previous" selection', async () => {
      const commandServiceSpy = jest.spyOn(CommandServiceImpl, 'remoteCall').mockResolvedValue({ id: 'diff' });
      const activity = mockStoreState.chat.chats.doc1.log.entries[2].items[0].payload.obj;
      mockStore.dispatch(showContextMenuForActivity(activity));
      await Promise.resolve(true);
      expect(commandServiceSpy).toHaveBeenCalled();
      const state = mockStore.getState();
      expect(JSON.stringify(state.chat.chats.doc1.inspectorObjects)).toEqual(
        JSON.stringify([
          {
            channelId: 'emulator',
            conversation: {
              conversationType: 'personal',
              id: '9fb93120-5713-11e9-a20f-e185020ba18b|livechat',
            },
            from: {
              aadObjectId: '8d81b1c4-a057-4d27-a41d-e40b3105e6ee',
              id: '29:1roELw8-HUdxuNSlGwtGqacHW_y-tsmLhvs42duabIDv0JFovw3WX7QC-syrrAYRt0RHBqoS1i0Mt18un1YZmyw',
              name: 'Justin Wilaby',
              role: 'user',
            },
            id: 'a65d2c70-5713-11e9-a20f-e185020ba18b',
            label: 'Bot State',
            localTimestamp: '2019-04-04T12:55:51-07:00',
            locale: 'en',
            name: 'BotState',
            recipient: {
              id: '28:825059e1-0dd5-4a90-9136-121a702c18ca',
              role: 'user',
            },
            serviceUrl: 'http://localhost:9000',
            timestamp: '2019-04-04T19:55:51.863Z',
            type: 'trace',
            value: {
              conversationState: {
                dialogState: {
                  conversationState: {},
                  dialogStack: [
                    {
                      id: 'root',
                      state: {
                        options: {},
                        stepIndex: 0,
                        values: {
                          instanceId: '6938f312-523a-2db2-92ba-9680f559dd2d',
                        },
                      },
                    },
                    {
                      id: 'slot-dialog',
                      state: {
                        values: {
                          fullname: {
                            values: {
                              '+first': 'Justin ',
                              '+last': 'Wilaby',
                            },
                            '+slot': 'last',
                          },
                        },
                        '+slot': 'age',
                        '-slot': 'fullname',
                      },
                    },
                    {
                      state: {
                        options: {
                          '+prompt': 'Please enter your age.',
                        },
                        state: {},
                        '-slot': 'last',
                        '-values': {
                          first: 'Justin ',
                        },
                      },
                      '+id': 'number',
                      '-id': 'fullname',
                    },
                  ],
                  userState: {},
                },
                '+eTag': '4',
                '-eTag': '3',
              },
              userState: {},
            },
            valueType: 'https://www.botframework.com/schemas/diff',
          },
        ])
      );
    });
  });
});
