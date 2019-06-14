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

import { newNotification, SharedConstants } from '@bfemulator/app-shared';
import { BotConfigWithPath, ConversationService } from '@bfemulator/sdk-shared';
import { call, put, takeEvery, takeLatest } from 'redux-saga/effects';
import { CommandServiceImpl, CommandServiceInstance } from '@bfemulator/sdk-shared';

import { ActiveBotHelper } from '../../ui/helpers/activeBotHelper';
import {
  BotAction,
  BotActionType,
  botHashGenerated,
  openBotViaFilePathAction,
  openBotViaUrlAction,
} from '../action/botActions';
import { beginAdd } from '../action/notificationActions';
import { generateHash } from '../botHelpers';

import { botSagas, BotSagas } from './botSagas';
import { SharedSagas } from './sharedSagas';

jest.mock('../store', () => ({
  get store() {
    return {};
  },
}));

jest.mock('electron', () => ({
  ipcMain: new Proxy(
    {},
    {
      get(): any {
        return () => ({});
      },
      has() {
        return true;
      },
    }
  ),
  ipcRenderer: new Proxy(
    {},
    {
      get(): any {
        return () => ({});
      },
      has() {
        return true;
      },
    }
  ),
}));

const mockSharedConstants = SharedConstants;
let mockRemoteCommandsCalled = [];
let mockLocalCommandsCalled = [];

describe('The botSagas', () => {
  let commandService: CommandServiceImpl;
  beforeAll(() => {
    const decorator = CommandServiceInstance();
    const descriptor = decorator({ descriptor: {} }, 'none') as any;
    commandService = descriptor.descriptor.get();

    commandService.call = async (commandName: string, ...args: any[]) => {
      mockLocalCommandsCalled.push({ commandName, args: args });

      switch (commandName) {
        case mockSharedConstants.Commands.Bot.OpenBrowse:
          return Promise.resolve(true);
        default:
          return Promise.resolve(true) as any;
      }
    };
    commandService.remoteCall = async (commandName: string, ...args: any[]) => {
      mockRemoteCommandsCalled.push({ commandName, args: args });

      return Promise.resolve(true) as any;
    };
  });

  beforeEach(() => {
    mockRemoteCommandsCalled = [];
    mockLocalCommandsCalled = [];
    ConversationService.startConversation = jest.fn().mockResolvedValue(true);
  });

  it('should initialize the root saga', () => {
    const gen = botSagas();

    expect(gen.next().value).toEqual(takeEvery(BotActionType.browse, BotSagas.browseForBot));

    expect(gen.next().value).toEqual(takeEvery(BotActionType.openViaUrl, BotSagas.openBotViaUrl));
    expect(gen.next().value).toEqual(takeEvery(BotActionType.openViaFilePath, BotSagas.openBotViaFilePath));
    expect(gen.next().value).toEqual(takeEvery(BotActionType.restartConversation, BotSagas.restartConversation));
    expect(gen.next().value).toEqual(takeEvery(BotActionType.setActive, BotSagas.generateHashForActiveBot));

    expect(gen.next().value).toEqual(
      takeLatest(
        [BotActionType.setActive, BotActionType.load, BotActionType.close],
        SharedSagas.refreshConversationMenu
      )
    );

    expect(gen.next().done).toBe(true);
  });

  it('should generate a hash for an active bot', () => {
    const botConfigPath: BotConfigWithPath = {
      name: 'botName',
      description: 'a bot description here',
      padlock: null,
      services: [],
      path: '/some/Path/something',
      version: '0.1',
    };

    const setActiveBotAction: BotAction<any> = {
      type: BotActionType.setActive,
      payload: {
        bot: botConfigPath,
      },
    };
    const gen = BotSagas.generateHashForActiveBot(setActiveBotAction);
    const generatedHash = gen.next().value;

    expect(generatedHash).toEqual(call(generateHash, botConfigPath));

    const putGeneratedHash = gen.next(generatedHash).value;
    expect(putGeneratedHash).toEqual(put(botHashGenerated(generatedHash)));
    expect(gen.next().done).toBe(true);
  });

  it('should open native open file dialog to browse for .bot file', () => {
    const gen = BotSagas.browseForBot();
    expect(gen.next().value).toEqual(call([ActiveBotHelper, ActiveBotHelper.confirmAndOpenBotFromFile]));
    expect(gen.next().done).toBe(true);
  });

  it('should open a bot from a url', () => {
    const gen = BotSagas.openBotViaUrl(
      openBotViaUrlAction({
        appPassword: 'password',
        appId: '1234abcd',
        endpoint: 'http://localhost/api/messages',
      })
    );
    gen.next();
    // select serverUrl
    gen.next('www.serverurl.com');
    // select custom user id
    gen.next('');
    // select users
    const users = { currentUserId: 'user1', usersById: { user1: {} } };
    gen.next(users);
    // startConversation
    const callToSaveUrl = gen.next({ ok: true, json: async () => null });
    expect(callToSaveUrl.value).toEqual(
      call(
        [commandService, commandService.remoteCall],
        SharedConstants.Commands.Settings.SaveBotUrl,
        'http://localhost/api/messages'
      )
    );
    // the saga should be finished
    expect(gen.next().done).toBe(true);
  });

  it('should open a bot from a url with the custom user id', () => {
    const gen = BotSagas.openBotViaUrl(
      openBotViaUrlAction({
        appPassword: 'password',
        appId: '1234abcd',
        endpoint: 'http://localhost/api/messages',
      })
    );
    gen.next();
    // select serverUrl
    gen.next('www.serverurl.com');
    // select custom user id
    gen.next('customUserId');
    // select users
    const users = { currentUserId: 'user1', usersById: { user1: {} } };
    const callToSetCurrentUser = gen.next(users).value;
    expect(callToSetCurrentUser).toEqual(
      call(
        [commandService, commandService.remoteCall],
        SharedConstants.Commands.Emulator.SetCurrentUser,
        'customUserId'
      )
    );
    // call to set current user
    gen.next();
    // startConversation
    const callToSaveUrl = gen.next({ ok: true, json: async () => null });
    expect(callToSaveUrl.value).toEqual(
      call(
        [commandService, commandService.remoteCall],
        SharedConstants.Commands.Settings.SaveBotUrl,
        'http://localhost/api/messages'
      )
    );
    // the saga should be finished
    expect(gen.next().done).toBe(true);
  });

  it('should send a notification if opening a bot from a URL fails', () => {
    const gen = BotSagas.openBotViaUrl(
      openBotViaUrlAction({
        appPassword: 'password',
        appId: '1234abcd',
        endpoint: 'http://localhost/api/messages',
      })
    );
    gen.next();
    // select serverUrl
    gen.next('www.serverurl.com');
    // select custom user id
    gen.next('');
    // select users
    const users = { currentUserId: 'user1', usersById: { user1: {} } };
    gen.next(users);
    const errorNotification = beginAdd(
      newNotification('An Error occurred opening the bot at http://localhost/api/messages: oh noes!')
    );
    (errorNotification as any).payload.notification.timestamp = jasmine.any(Number);
    (errorNotification as any).payload.notification.id = jasmine.any(String);
    expect(
      gen.next({
        statusText: 'oh noes!',
        ok: false,
      }).value
    ).toEqual(put(errorNotification));
  });

  it('should send the "/INSPECT open" command when in debug mode and opening from url', () => {
    const gen = BotSagas.openBotViaUrl(
      openBotViaUrlAction({
        appPassword: 'password',
        appId: '1234abcd',
        endpoint: 'http://localhost/api/messages',
        mode: 'debug',
      })
    );
    gen.next();
    // select serverUrl
    gen.next('www.serverurl.com');
    // select custom user id
    gen.next('');
    // select users
    const users = { currentUserId: 'user1', usersById: { user1: {} } };
    gen.next(users);
    // startConversation
    gen.next({ ok: true, json: async () => null });
    // response.json from starting conversation
    const callToPostActivity = gen.next({ id: 'someConversationId' }).value;
    // posting activity to conversation
    const activity = {
      type: 'message',
      text: '/INSPECT open',
    };
    expect(callToPostActivity).toEqual(
      call(
        [commandService, commandService.remoteCall],
        SharedConstants.Commands.Emulator.PostActivityToConversation,
        'someConversationId',
        activity
      )
    );
    // POSTing the activity to the conversation should return a 200
    const callToRememberEndpoint = gen.next({ statusCode: 200 });
    expect(callToRememberEndpoint.value).toEqual(
      call(
        [commandService, commandService.remoteCall],
        SharedConstants.Commands.Settings.SaveBotUrl,
        'http://localhost/api/messages'
      )
    );
    // the saga should be finished
    expect(gen.next().done).toBe(true);
  });

  it('should spawn a notification if posting the "/INSPECT open" command fails', () => {
    const gen = BotSagas.openBotViaUrl(
      openBotViaUrlAction({
        appPassword: 'password',
        appId: '1234abcd',
        endpoint: 'http://localhost/api/messages',
        mode: 'debug',
      })
    );
    gen.next();
    // select serverUrl
    gen.next('www.serverurl.com');
    // select custom user id
    gen.next('');
    // select users
    const users = { currentUserId: 'user1', usersById: { user1: {} } };
    gen.next(users);
    // startConversation
    gen.next({ ok: true, json: async () => null });
    // response.json from starting conversation
    gen.next({ id: 'someConversationId' });
    // POSTing to the conversation should return a 400
    const errorNotification = beginAdd(
      newNotification('An error occurred while POSTing "/INSPECT open" command to conversation someConversationId')
    );
    (errorNotification as any).payload.notification.timestamp = jasmine.any(Number);
    (errorNotification as any).payload.notification.id = jasmine.any(String);
    expect(gen.next({ statusCode: 400 }).value).toEqual(put(errorNotification));
  });

  it('should spawn a notification if parsing the conversation id from the response fails', () => {
    const gen = BotSagas.openBotViaUrl(
      openBotViaUrlAction({
        appPassword: 'password',
        appId: '1234abcd',
        endpoint: 'http://localhost/api/messages',
        mode: 'debug',
      })
    );
    gen.next();
    // select serverUrl
    gen.next('www.serverurl.com');
    // select custom user id
    gen.next('');
    // select users
    const users = { currentUserId: 'user1', usersById: { user1: {} } };
    gen.next(users);
    // startConversation
    gen.next({ ok: true, json: async () => null });
    // response.json from starting conversation
    const startConversationResponse = gen.next({ id: undefined }).value;
    // POSTing to the conversation should return a 400
    const errorNotification = beginAdd(
      newNotification('An error occurred while trying to grab conversation ID from the new conversation.')
    );
    (errorNotification as any).payload.notification.timestamp = jasmine.any(Number);
    (errorNotification as any).payload.notification.id = jasmine.any(String);
    expect(startConversationResponse).toEqual(put(errorNotification));
  });

  it('should open a bot from a file path', () => {
    const gen = BotSagas.openBotViaFilePath(openBotViaFilePathAction('/some/path.bot'));

    jest.spyOn(ActiveBotHelper, 'confirmAndOpenBotFromFile').mockResolvedValue(true);
    expect(gen.next().value).toEqual(
      call([ActiveBotHelper, ActiveBotHelper.confirmAndOpenBotFromFile], '/some/path.bot')
    );
  });

  it('should send a notification when opening a bot from a file path fails', () => {
    const gen = BotSagas.openBotViaFilePath(openBotViaFilePathAction('/some/path.bot'));
    const callOpenBot = gen.next().value;
    expect(callOpenBot).toEqual(call([ActiveBotHelper, ActiveBotHelper.confirmAndOpenBotFromFile], '/some/path.bot'));
    const putNotification = gen.throw(new Error('oh noes!'));
    const errorNotification = beginAdd(
      newNotification('An Error occurred opening the bot at /some/path.bot: Error: oh noes!')
    );
    (errorNotification as any).payload.notification.timestamp = jasmine.any(Number);
    (errorNotification as any).payload.notification.id = jasmine.any(String);
    expect(putNotification.value).toEqual(put(errorNotification));
  });
});
