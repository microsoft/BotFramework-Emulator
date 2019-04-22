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
/* eslint-disable typescript/no-use-before-define */

import '../fetchProxy';
import * as path from 'path';

import { combineReducers, createStore } from 'redux';
import { BotConfigWithPathImpl, CommandRegistryImpl } from '@bfemulator/sdk-shared';
import { BotConfiguration } from 'botframework-config';
import { newBot, newEndpoint, SharedConstants } from '@bfemulator/app-shared';
import { Conversation } from '@bfemulator/emulator-core';

import * as store from '../botData/store';
import { getStore as getSettingsStore } from '../settingsData/store';
import * as utils from '../utils';
import * as botHelpers from '../botHelpers';
import { bot } from '../botData/reducers/bot';
import * as BotActions from '../botData/actions/botActions';
import { TelemetryService } from '../telemetry';
import { mainWindow } from '../main';
import { setCurrentUser } from '../settingsData/actions/userActions';
import { pushClientAwareSettings } from '../settingsData/actions/frameworkActions';

import { registerCommands } from './emulatorCommands';

const mockBotConfig = BotConfiguration;
const mockConversationConstructor = Conversation;

let mockStore;
(store as any).getStore = function() {
  return mockStore || (mockStore = createStore(combineReducers({ bot })));
};

const mockOn = { on: () => mockOn };
jest.mock('chokidar', () => ({
  watch: () => ({
    on: () => mockOn,
  }),
}));

jest.mock('fs-extra', () => ({
  stat: async () => ({ isFile: () => true }),
}));

jest.mock('mkdirp', () => ({
  sync: () => ({}),
}));

jest.mock('../botHelpers', () => ({
  saveBot: async () => void 0,
  toSavableBot: () => mockBotConfig.fromJSON(mockBot),
  patchBotsJson: async () => true,
  pathExistsInRecentBots: () => true,
  getBotInfoByPath: () => ({ secret: 'secret' }),
  loadBotWithRetry: () => mockBot,
  getActiveBot: () => mockBot,
  getTranscriptsPath: () => 'Users/blerg/Documents/testbot/transcripts',
}));

jest.mock('../utils', () => ({
  parseActivitiesFromChatFile: () => [],
  showSaveDialog: async () => 'save/to/this/path',
  writeFile: async () => true,
  loadSettings: () => ({ windowState: {} }),
  getThemes: async () => [],
  readFileSync: () => JSON.stringify((mockConversation as any).transcript),
}));

jest.mock('../utils/ensureStoragePath', () => ({
  ensureStoragePath: () => '',
}));

let mockUsers;
const mockEmulator = {
  startup: () => ({}),
  framework: {
    server: {
      botEmulator: {
        facilities: {
          logger: {
            logActivity: () => true,
          },
          conversations: {
            conversationById: () => mockConversation,
            newConversation: (...args: any[]) =>
              new mockConversationConstructor(args[0], args[1], args[3], args[2], 'livechat'),
            deleteConversation: () => true,
          },
          endpoints: {
            reset: () => null,
            push: () => null,
          },
          get users() {
            return mockUsers;
          },
          set users(users: any) {
            mockUsers = users;
          },
        },
      },
    },
  },
};
jest.mock('../emulator', () => ({
  Emulator: {
    getInstance: () => mockEmulator,
  },
}));

let mockCallsMade = [];
jest.mock('../main', () => ({
  mainWindow: {
    commandService: {
      call: async (commandName, ...args) => {
        mockCallsMade.push({ commandName, args });
        return Promise.resolve(true);
      },
      remoteCall: async () => true,
    },
    browserWindow: {},
  },
}));

const mockBot = BotConfigWithPathImpl.fromJSON({
  path: 'some/path',
  name: 'AuthBot',
  description: '',
  padlock: '',
  services: [
    {
      appId: '4f8fde3f-48d3-4d8a-a954-393efe39809e',
      id: 'cded37c0-83f2-11e8-ac6d-b7172cd24b28',
      type: 'endpoint',
      appPassword: 'REDACTED',
      endpoint: 'http://localhost:55697/api/messages',
      name: 'authsample',
    },
  ],
} as any);

const mockInfo = {
  secret: 'shhh!',
  path: path.normalize('Users/blerg/Documents/testbot/contoso-cafe-bot.bot'),
  displayName: 'contoso-cafe-bot',
  transcriptsPath: path.normalize('Users/blerg/Documents/testbot/transcripts'),
  chatsPath: path.normalize('Users/blerg/Documents/testbot/dialogs'),
};

const mockConversation = mockEmulator.framework.server.botEmulator.facilities.conversations.newConversation(
  mockEmulator.framework.server.botEmulator,
  null,
  { id: '1234', name: 'User' },
  '1234'
);
(mockConversation as any).transcript = [
  {
    type: 'activity add',
    activity: {
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
  },
  {
    type: 'activity add',
    activity: {
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
  },
  {
    type: 'activity add',
    activity: {
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
  },
  {
    type: 'activity add',
    activity: {
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
  },
  {
    type: 'activity add',
    activity: {
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
  },
];
const mockCommandRegistry = new CommandRegistryImpl();
registerCommands(mockCommandRegistry);

describe('The emulatorCommands', () => {
  let mockTrackEvent;
  const trackEventBackup = TelemetryService.trackEvent;

  beforeEach(() => {
    mockUsers = { users: {} };
    mockTrackEvent = jest.fn(() => Promise.resolve());
    TelemetryService.trackEvent = mockTrackEvent;
    mockCallsMade = [];
  });

  beforeAll(() => {
    TelemetryService.trackEvent = trackEventBackup;
  });

  it('should save a transcript to file based on the transcripts path in the botInfo', async () => {
    const getActiveBotSpy = jest.spyOn((botHelpers as any).default, 'getActiveBot').mockReturnValue(mockBot);

    const conversationByIdSpy = jest
      .spyOn(mockEmulator.framework.server.botEmulator.facilities.conversations, 'conversationById')
      .mockReturnValue(mockConversation);
    const showSaveDialogSpy = jest.spyOn((utils as any).default, 'showSaveDialog').mockReturnValue('chosen/path');

    const getBotInfoByPathSpy = jest.spyOn((botHelpers as any).default, 'getBotInfoByPath').mockReturnValue(mockInfo);
    const toSavableBotSpy = jest
      .spyOn((botHelpers as any).default, 'toSavableBot')
      .mockReturnValue({ save: async () => ({}) });
    const patchBotJsonSpy = jest.spyOn((botHelpers as any).default, 'patchBotsJson').mockResolvedValue(true);

    const command = mockCommandRegistry.getCommand(SharedConstants.Commands.Emulator.SaveTranscriptToFile);
    await command.handler('1234');

    expect(getActiveBotSpy).toHaveBeenCalled();
    expect(conversationByIdSpy).toHaveBeenCalledWith('1234');
    expect(showSaveDialogSpy).toHaveBeenCalledWith(
      {},
      {
        // TODO - Localization
        filters: [
          {
            name: 'Transcript Files',
            extensions: ['transcript'],
          },
        ],
        defaultPath: path.normalize('Users/blerg/Documents/testbot/transcripts'),
        showsTagField: false,
        title: 'Save conversation transcript',
        buttonLabel: 'Save',
      }
    );
    const newPath = path.normalize('chosen/AuthBot.bot');
    expect(getBotInfoByPathSpy).toHaveBeenCalledWith('some/path');
    expect(toSavableBotSpy).toHaveBeenCalledWith(mockBot, mockInfo.secret);
    expect(patchBotJsonSpy).toHaveBeenCalledWith(newPath, Object.assign({}, mockInfo, { path: newPath }));
    expect(mockTrackEvent).toHaveBeenCalledWith('transcript_save');
  });

  it('should feed a transcript from disk to a conversation', async () => {
    const commandServiceSpy = jest.spyOn(mainWindow.commandService, 'call');

    const command = mockCommandRegistry.getCommand(SharedConstants.Commands.Emulator.FeedTranscriptFromDisk);
    const result = await command.handler('12', '12', '12', 'file/path');

    expect(commandServiceSpy).toHaveBeenCalledWith(
      SharedConstants.Commands.Emulator.FeedTranscriptFromMemory,
      '12',
      '12',
      '12',
      (mockConversation as any).transcript
    );
    expect(result).toEqual({
      fileName: 'path',
      filePath: 'file/path',
    });
  });

  it('should feed a deep-linked transcript (array of parsed activities) to a conversation', async () => {
    const feedActivitiesSpy = jest.spyOn(mockConversation, 'feedActivities');
    const activities = await mockConversation.getTranscript();
    const id = 'http://localhost:3978/api/messages';
    mockCommandRegistry
      .getCommand(SharedConstants.Commands.Emulator.FeedTranscriptFromMemory)
      .handler('0a441b55-d1d6-4015-bbb4-2e7f44fa9f4', id, '0a441b55-d1d6-4015-bbb4-2e7f44fa9f42', activities);

    expect(feedActivitiesSpy).toHaveBeenCalledWith(activities);
  });

  it('should create a new conversation object for transcript', async () => {
    const getActiveBotSpy = jest.spyOn((botHelpers as any).default, 'getActiveBot').mockReturnValue(null);
    const dispatchSpy = jest.spyOn(store.getStore(), 'dispatch');
    const { handler } = mockCommandRegistry.getCommand(SharedConstants.Commands.Emulator.NewTranscript);
    const conversation = await handler('1234');

    const newbot = newBot();
    newbot.services.push(newEndpoint());
    (newbot.services[0] as any).id = jasmine.any(String);
    expect(getActiveBotSpy).toHaveBeenCalled();
    expect(dispatchSpy).toHaveBeenCalledWith(BotActions.mockAndSetActive(newbot));
    expect(conversation).not.toBeNull();
  });

  it('should set current user', async () => {
    const dispatchSpy = jest.spyOn(getSettingsStore(), 'dispatch');
    await mockCommandRegistry.getCommand(SharedConstants.Commands.Emulator.SetCurrentUser).handler('userId123');

    expect(mockUsers.currentUserId).toBe('userId123');
    expect(mockUsers.users.userId123).toEqual({
      id: 'userId123',
      name: 'User',
    });
    expect(dispatchSpy).toHaveBeenCalledWith(setCurrentUser({ id: 'userId123', name: 'User' }));
    expect(dispatchSpy).toHaveBeenCalledWith(pushClientAwareSettings());
  });

  it('should delete a conversation', () => {
    const deleteSpy = jest.spyOn(
      mockEmulator.framework.server.botEmulator.facilities.conversations,
      'deleteConversation'
    );
    mockCommandRegistry.getCommand(SharedConstants.Commands.Emulator.DeleteConversation).handler('convo1');
    expect(deleteSpy).toHaveBeenCalledWith('convo1');
  });

  it('shouold open a chat file', async () => {
    const result = await mockCommandRegistry
      .getCommand(SharedConstants.Commands.Emulator.OpenChatFile)
      .handler('chats/myChat.chat');
    expect(result).toEqual({ activities: [], fileName: 'myChat.chat' });
  });
});
