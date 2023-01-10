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

import {
  beginAdd,
  botHashGenerated,
  open as openEditorDocument,
  openBotViaFilePathAction,
  newNotification,
  BotAction,
  BotActionType,
  SharedConstants,
} from '@bfemulator/app-shared';
import { BotConfigWithPath, ConversationService } from '@bfemulator/sdk-shared';
import { call, put, takeEvery, takeLatest } from 'redux-saga/effects';
import { CommandServiceImpl, CommandServiceInstance } from '@bfemulator/sdk-shared';

import { ActiveBotHelper } from '../../ui/helpers/activeBotHelper';
import { generateHash } from '../helpers/botHelpers';

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

(global as any).fetch = (function() {
  const fetch = (url, opts) => {
    return {
      ok: true,
      json: async () => ({ id: "Hi! I'm in ur json" }),
      text: async () => '{}',
    };
  };
  (fetch as any).Headers = class {};
  (fetch as any).Response = class {};
  return fetch;
})();

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
    (errorNotification as any).payload.notification.timestamp = expect.any(Number);
    (errorNotification as any).payload.notification.id = expect.any(String);
    expect(putNotification.value).toEqual(put(errorNotification));
  });

  it('should open a bot via url with the custom user ID', () => {
    const mockAction: any = {
      payload: {
        endpoint: 'http://localhost:3978/api/messages',
        channelService: 'public',
        mode: 'livechat',
        appId: 'someAppId',
        appPassword: 'someAppPw',
      },
    };
    const gen = BotSagas.openBotViaUrl(mockAction);
    gen.next();
    gen.next('userId'); // select custom user GUID

    // select server url
    expect(gen.next('http://localhost:52673').value).toEqual(
      call([ConversationService, ConversationService.startConversation], 'http://localhost:52673', {
        botUrl: mockAction.payload.endpoint,
        channelServiceType: mockAction.payload.channelService,
        members: [{ id: 'userId', name: 'User', role: 'user' }],
        mode: mockAction.payload.mode,
        msaAppId: mockAction.payload.appId,
        msaPassword: mockAction.payload.appPassword,
      })
    );

    const mockStartConvoResponse = {
      json: async () => undefined,
      ok: true,
    };

    // startConversation
    gen.next(mockStartConvoResponse);
    gen.next({
      conversationId: 'someConvoId',
      endpointId: 'someEndpointId',
      members: [],
    }); //res.json()

    let next = gen.next(); // bootstrapChat()

    const putOpenValue = next.value;
    expect(putOpenValue).toEqual(
      put(
        openEditorDocument({
          contentType: SharedConstants.ContentTypes.CONTENT_TYPE_LIVE_CHAT,
          documentId: 'someConvoId',
          isGlobal: false,
        })
      )
    );
    gen.next(); // put open()

    gen.next({ ok: true }); // sendInitialLogReport()
    next = gen.next({ ok: true }); // sendInitialActivity()

    const callValue = next.value;
    expect(callValue).toEqual(
      call(
        [commandService, commandService.remoteCall],
        SharedConstants.Commands.Settings.SaveBotUrl,
        'http://localhost:3978/api/messages'
      )
    );
    expect(gen.next().done).toBe(true);
  });

  it('should open a bot via url with a newly generated user GUID', () => {
    const mockAction: any = {
      payload: {
        endpoint: 'http://localhost:3978/api/messages',
        channelService: 'public',
        mode: 'livechat',
        appId: 'someAppId',
        appPassword: 'someAppPw',
      },
    };
    const gen = BotSagas.openBotViaUrl(mockAction);
    gen.next();
    gen.next(''); // select custom user GUID (force generation of new GUID)

    // select server url
    const startConversationCall = gen.next('http://localhost:52673').value;
    const startConversationPayload = startConversationCall.CALL.args[1];
    expect(startConversationPayload.members[0].id.length).toBeGreaterThan(0);

    const mockStartConvoResponse = {
      json: async () => undefined,
      ok: true,
    };

    // startConversation
    gen.next(mockStartConvoResponse);
    gen.next({
      conversationId: 'someConvoId',
      endpointId: 'someEndpointId',
      members: [],
    }); //res.json()

    let next = gen.next(); // bootstrapChat()

    const putOpenValue = next.value;
    expect(putOpenValue).toEqual(
      put(
        openEditorDocument({
          contentType: SharedConstants.ContentTypes.CONTENT_TYPE_LIVE_CHAT,
          documentId: 'someConvoId',
          isGlobal: false,
        })
      )
    );
    gen.next(); // put open()

    gen.next({ ok: true }); // sendInitialLogReport()
    next = gen.next({ ok: true }); // sendInitialActivity()

    const callValue = next.value;
    expect(callValue).toEqual(
      call(
        [commandService, commandService.remoteCall],
        SharedConstants.Commands.Settings.SaveBotUrl,
        'http://localhost:3978/api/messages'
      )
    );
    expect(gen.next().done).toBe(true);
  });

  it('should throw if starting the conversation fails', () => {
    const mockAction: any = {
      payload: {
        endpoint: 'http://localhost:3978/api/messages',
        channelService: 'public',
        mode: 'livechat',
        appId: 'someAppId',
        appPassword: 'someAppPw',
      },
    };
    const gen = BotSagas.openBotViaUrl(mockAction);
    gen.next();
    gen.next('userId'); // select custom user GUID
    gen.next('http://localhost:52673'); // select server url

    const mockStartConvoResponse = {
      json: async () => undefined,
      ok: false,
      status: 500,
      statusText: 'INTERNAL SERVER ERROR',
      text: async () => undefined,
    };
    gen.next(mockStartConvoResponse); // startConversation
    try {
      gen.next('Cannot read property "id" of undefined.');
      expect(true).toBe(false); // ensure catch is hit
    } catch (e) {
      expect(e).toEqual({
        description: '500 INTERNAL SERVER ERROR',
        message: 'Error occurred while starting a new conversation',
        innerMessage: 'Cannot read property "id" of undefined.',
        status: 500,
      });
    }
  });

  it('should throw if sending the initial log report fails', () => {
    const mockAction: any = {
      payload: {
        endpoint: 'http://localhost:3978/api/messages',
        channelService: 'public',
        mode: 'livechat',
        appId: 'someAppId',
        appPassword: 'someAppPw',
      },
    };
    const gen = BotSagas.openBotViaUrl(mockAction);
    gen.next();
    gen.next('userId'); // select custom user GUID
    gen.next('http://localhost:52673'); // select server url

    const mockStartConvoResponse = {
      json: async () => undefined,
      ok: true,
    };
    gen.next(mockStartConvoResponse); // startConversation
    gen.next({
      conversationId: 'someConvoId',
      endpointId: 'someEndpointId',
      members: [],
    }); //res.json()

    const next = gen.next(); // bootstrapChat()

    const putOpenValue = next.value;
    expect(putOpenValue).toEqual(
      put(
        openEditorDocument({
          contentType: SharedConstants.ContentTypes.CONTENT_TYPE_LIVE_CHAT,
          documentId: 'someConvoId',
          isGlobal: false,
        })
      )
    );
    gen.next(); // put open()

    gen.next({
      ok: false,
      status: 500,
      statusText: 'INTERNAL SERVER ERROR',
      text: async () => undefined,
    }); // sendInitialLogReport()

    try {
      gen.next('Could not read property "id" of undefined.');
      expect(true).toBe(false); // ensure catch is hit
    } catch (e) {
      expect(e).toEqual({
        description: '500 INTERNAL SERVER ERROR',
        message: 'Error occurred while sending the initial log report',
        innerMessage: 'Could not read property "id" of undefined.',
        status: 500,
      });
    }
  });

  it('should throw if sending the initial activity fails', () => {
    const mockAction: any = {
      payload: {
        endpoint: 'http://localhost:3978/api/messages',
        channelService: 'public',
        mode: 'livechat',
        appId: 'someAppId',
        appPassword: 'someAppPw',
      },
    };
    const gen = BotSagas.openBotViaUrl(mockAction);
    gen.next();
    gen.next('userId'); // select custom user GUID
    gen.next('http://localhost:52673'); // select server url

    const mockStartConvoResponse = {
      json: async () => undefined,
      ok: true,
    };
    gen.next(mockStartConvoResponse); // startConversation
    gen.next({
      conversationId: 'someConvoId',
      endpointId: 'someEndpointId',
      members: [],
    }); //res.json()

    const next = gen.next(); // bootstrapChat()

    const putOpenValue = next.value;
    expect(putOpenValue).toEqual(
      put(
        openEditorDocument({
          contentType: SharedConstants.ContentTypes.CONTENT_TYPE_LIVE_CHAT,
          documentId: 'someConvoId',
          isGlobal: false,
        })
      )
    );
    gen.next(); // put open()

    gen.next({ ok: true }); // sendInitialLogReport()

    gen.next({
      ok: false,
      status: 500,
      statusText: 'INTERNAL SERVER ERROR',
      text: async () => undefined,
    }); // sendInitialActivity()

    try {
      gen.next('Could not read property "id" of undefined.');
      expect(true).toBe(false); // ensure catch is hit
    } catch (e) {
      expect(e).toEqual({
        description: '500 INTERNAL SERVER ERROR',
        message: 'Error occurred while sending the initial activity',
        innerMessage: 'Could not read property "id" of undefined.',
        status: 500,
      });
    }
  });
});
