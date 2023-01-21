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

import { call, put, select, takeEvery, fork } from 'redux-saga/effects';
import {
  CommandServiceImpl,
  CommandServiceInstance,
  ConversationService,
  json2HTML,
  logEntry,
  textItem,
  LogLevel,
  EmulatorMode,
} from '@bfemulator/sdk-shared';
import * as sdkSharedUtils from '@bfemulator/sdk-shared/build/utils/misc';
import {
  clearLog,
  closeDocument,
  newChat,
  open as openDocument,
  setInspectorObjects,
  webChatStoreUpdated,
  webSpeechFactoryUpdated,
  updatePendingSpeechTokenRetrieval,
  ChatActions,
  SharedConstants,
  updateSpeechAdapters,
  incomingActivity,
  postActivity,
  RestartConversationStatus,
  setRestartConversationStatus,
  RestartConversationPayload,
  RestartConversationOptions,
} from '@bfemulator/app-shared';
import {
  createCognitiveServicesSpeechServicesPonyfillFactory,
  createDirectLineSpeechAdapters,
} from 'botframework-webchat';
import { Activity } from 'botframework-schema';

import { WebChatEvents, ConversationQueue } from '../../utils/restartConversationQueue';
import { logService } from '../../platform/log/logService';

import {
  chatSagas,
  ChatSagas,
  getConversationIdFromDocumentId,
  getChatFromDocumentId,
  getServerUrl,
  getCustomUserGUID,
  getWebSpeechFactoryForDocumentId,
} from './chatSagas';
import { createWebChatActivityChannel, ChannelPayload } from './webChatActivityChannel';

const mockChatStore = jest.fn((args = undefined) => {
  return {};
});

jest.mock('botframework-webchat-core', () => ({
  createStore: (...args) => mockChatStore({ ...args }),
}));

jest.mock('../../ui/dialogs', () => ({}));

jest.mock('../../platform/log/logService', () => ({
  logService: {
    logToDocument: jest.fn(),
  },
}));

const mockWriteText = jest.fn();
jest.mock('electron', () => {
  return {
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
    clipboard: { writeText: (textFromActivity: string) => mockWriteText(textFromActivity) },
  };
});

jest.mock('botframework-webchat', () => {
  return {
    createCognitiveServicesSpeechServicesPonyfillFactory: () => () => 'Yay! ponyfill!',
    createDirectLineSpeechAdapters: () => undefined,
  };
});

describe('The ChatSagas,', () => {
  let commandService: CommandServiceImpl;
  let oldDateNow;
  beforeAll(() => {
    oldDateNow = Date.now;
    Date.now = jest.fn();
    const decorator = CommandServiceInstance();
    const descriptor = decorator({ descriptor: {} }, 'none') as any;
    commandService = descriptor.descriptor.get();
    commandService.call = jest.fn().mockResolvedValue(true);
    commandService.remoteCall = jest.fn().mockResolvedValue(true);
    jest.spyOn(sdkSharedUtils, 'uniqueId').mockReturnValue('someUniqueId');
    jest.spyOn(sdkSharedUtils, 'uniqueIdv4').mockReturnValue('someUniqueIdv4');
  });

  afterAll(() => {
    Date.now = oldDateNow;
  });

  beforeEach(() => {
    mockWriteText.mockClear();
    mockChatStore.mockClear();
  });

  it('should initialize the root saga', () => {
    const gen = chatSagas();
    expect(gen.next().value).toEqual(fork(ChatSagas.watchForWebchatEvents));
    expect(gen.next().value).toEqual(
      takeEvery(ChatActions.showContextMenuForActivity, ChatSagas.showContextMenuForActivity)
    );
    expect(gen.next().value).toEqual(takeEvery(ChatActions.closeConversation, ChatSagas.closeConversation));
    expect(gen.next().value).toEqual(takeEvery(ChatActions.restartConversation, ChatSagas.restartConversation));
    expect(gen.next().value).toEqual(takeEvery(ChatActions.openTranscript, ChatSagas.newTranscript));
    expect(gen.next().done).toBe(true);
  });

  describe('showContextMenuForActivity', () => {
    it('should show a context menu for an activity (cancel menu)', () => {
      const menuItems = [
        { label: 'Copy text', id: 'copy' },
        { label: 'Copy json', id: 'json' },
      ];
      const mockAction: any = {
        payload: {}, // activity
      };
      const gen = ChatSagas.showContextMenuForActivity(mockAction);
      expect(gen.next().value).toEqual(
        call(
          [commandService, commandService.remoteCall],
          SharedConstants.Commands.Electron.DisplayContextMenu,
          menuItems
        )
      ); // call
      expect(gen.next(undefined).done).toBe(true);
      expect(mockWriteText).not.toHaveBeenCalled();
    });

    it('should show a context menu for an acitivity (copy)', () => {
      const menuItems = [
        { label: 'Copy text', id: 'copy' },
        { label: 'Copy json', id: 'json' },
      ];
      const mockAction: any = {
        payload: {}, // activity
      };
      const gen = ChatSagas.showContextMenuForActivity(mockAction);
      expect(gen.next().value).toEqual(
        call(
          [commandService, commandService.remoteCall],
          SharedConstants.Commands.Electron.DisplayContextMenu,
          menuItems
        )
      ); // call
      expect(gen.next({ id: 'copy' }).done).toBe(true);
      expect(mockWriteText).toHaveBeenCalled();
    });

    it('should show a context menu for an acitivity (json)', () => {
      const menuItems = [
        { label: 'Copy text', id: 'copy' },
        { label: 'Copy json', id: 'json' },
      ];
      const mockAction: any = {
        payload: {}, // activity
      };
      const gen = ChatSagas.showContextMenuForActivity(mockAction);
      expect(gen.next().value).toEqual(
        call(
          [commandService, commandService.remoteCall],
          SharedConstants.Commands.Electron.DisplayContextMenu,
          menuItems
        )
      ); // call
      expect(gen.next({ id: 'json' }).done).toBe(true);
      expect(mockWriteText).toHaveBeenCalled();
    });

    it('should show a context menu for an acitivity (default)', () => {
      const menuItems = [
        { label: 'Copy text', id: 'copy' },
        { label: 'Copy json', id: 'json' },
      ];
      const mockAction: any = {
        payload: {}, // activity
      };
      const gen = ChatSagas.showContextMenuForActivity(mockAction);
      expect(gen.next().value).toEqual(
        call(
          [commandService, commandService.remoteCall],
          SharedConstants.Commands.Electron.DisplayContextMenu,
          menuItems
        )
      ); // call
      expect(gen.next({ id: 'something else' }).done).toBe(true);
      expect(mockWriteText).not.toHaveBeenCalled();
    });
  });

  describe('closeConversation', () => {
    it('should close a conversation', () => {
      const mockAction: any = {
        payload: {
          documentId: 'someDocId',
        },
      };
      const mockChat = {
        directLine: {
          end: jest.fn(),
        },
      };
      const gen = ChatSagas.closeConversation(mockAction);

      // select conversation id
      expect(gen.next().value).toEqual(select(getConversationIdFromDocumentId, mockAction.payload.documentId));

      // select chat
      expect(gen.next(mockAction.payload.documentId).value).toEqual(
        select(getChatFromDocumentId, mockAction.payload.documentId)
      );

      // put closeDocument
      expect(gen.next(mockChat).value).toEqual(put(closeDocument(mockAction.payload.documentId)));

      expect(mockChat.directLine.end).toHaveBeenCalled();

      // put webChatStoreUpdated
      expect(gen.next().value).toEqual(put(webChatStoreUpdated(mockAction.payload.documentId, null)));

      // call
      expect(gen.next().value).toEqual(
        call(
          [commandService, commandService.remoteCall],
          SharedConstants.Commands.Emulator.DeleteConversation,
          mockAction.payload.documentId
        )
      );

      expect(gen.next().done).toBe(true);
    });
  });

  describe('newTranscript', () => {
    it('should open a new transcript and parse activities from the file', () => {
      const filename = 'test.transcript';
      const serverUrl = 'http://localhost:52673';
      const userGUID = 'someUserId';
      const conversationId = 'someConvoId';
      const endpointId = 'someEndpointId';
      const mockAction: any = {
        payload: {
          filename,
        },
      };
      const gen = ChatSagas.newTranscript(mockAction);

      // select server url
      expect(gen.next().value).toEqual(select(getServerUrl));

      // select custom user GUID
      expect(gen.next(serverUrl).value).toEqual(select(getCustomUserGUID));

      // startConversation()
      expect(gen.next(userGUID).value).toEqual(
        call([ConversationService, ConversationService.startConversation], serverUrl, {
          botUrl: '',
          channelServiceType: '' as any,
          members: [{ id: userGUID, name: 'User', role: 'user' }],
          mode: 'transcript' as EmulatorMode,
          msaAppId: '',
          msaPassword: '',
        } as any)
      );

      // res.json()
      gen.next({ json: jest.fn(), ok: true });

      // remote call
      expect(gen.next({ conversationId, endpointId }).value).toEqual(
        call(
          [commandService, commandService.remoteCall],
          SharedConstants.Commands.Emulator.ExtractActivitiesFromFile,
          filename
        )
      );

      // bootstrapChat()
      const activities = [];
      expect(gen.next({ activities }).value).toEqual(
        call([ChatSagas, ChatSagas.bootstrapChat], {
          conversationId,
          documentId: conversationId,
          endpointId,
          mode: 'transcript',
          user: { id: userGUID, name: 'User', role: 'user' },
        } as any)
      );

      // put openDocument
      expect(gen.next().value).toEqual(
        put(
          openDocument({
            contentType: SharedConstants.ContentTypes.CONTENT_TYPE_TRANSCRIPT,
            documentId: conversationId,
            fileName: filename,
            isGlobal: false,
          })
        )
      );

      // call feedActivitiesAsTranscript()
      expect(gen.next().value).toEqual(
        call(
          [ConversationService, ConversationService.feedActivitiesAsTranscript],
          serverUrl,
          conversationId,
          activities
        )
      );

      gen.next({ ok: true });

      expect(gen.next().done).toBe(true);
    });

    it('should throw if starting a new conversation fails while opening a transcript', () => {
      const filename = 'test.transcript';
      const serverUrl = 'http://localhost:52673';
      const userGUID = 'someUserId';
      const mockAction: any = {
        payload: {
          filename,
        },
      };
      const gen = ChatSagas.newTranscript(mockAction);

      // select server url
      expect(gen.next().value).toEqual(select(getServerUrl));

      // select custom user GUID
      expect(gen.next(serverUrl).value).toEqual(select(getCustomUserGUID));

      // startConversation()
      expect(gen.next(userGUID).value).toEqual(
        call([ConversationService, ConversationService.startConversation], serverUrl, {
          botUrl: '',
          channelServiceType: '' as any,
          members: [{ id: userGUID, name: 'User', role: 'user' }],
          mode: 'transcript' as EmulatorMode,
          msaAppId: '',
          msaPassword: '',
        } as any)
      );

      // res.json()
      gen.next({ json: jest.fn(), ok: false, status: 500, statusText: 'INTERNAL SERVER ERROR', text: jest.fn() });
      try {
        gen.next('The server could not handle your request.'); // response.text() inside throwErrorFromResponse()
        expect(true).toBe(false); // ensure catch is hit
      } catch (e) {
        expect(e).toEqual({
          description: '500 INTERNAL SERVER ERROR',
          message: 'Error occurred while starting a new conversation',
          innerMessage: 'The server could not handle your request.',
          status: 500,
        });
      }
    });

    it('should throw if feeding activities fails while opening a transcript', () => {
      const filename = 'test.transcript';
      const serverUrl = 'http://localhost:52673';
      const userGUID = 'someUserId';
      const conversationId = 'someConvoId';
      const endpointId = 'someEndpointId';
      const mockAction: any = {
        payload: {
          filename,
        },
      };
      const gen = ChatSagas.newTranscript(mockAction);

      // select server url
      expect(gen.next().value).toEqual(select(getServerUrl));

      // select custom user GUID
      expect(gen.next(serverUrl).value).toEqual(select(getCustomUserGUID));

      // startConversation()
      expect(gen.next(userGUID).value).toEqual(
        call([ConversationService, ConversationService.startConversation], serverUrl, {
          botUrl: '',
          channelServiceType: '' as any,
          members: [{ id: userGUID, name: 'User', role: 'user' }],
          mode: 'transcript' as EmulatorMode,
          msaAppId: '',
          msaPassword: '',
        } as any)
      );

      // res.json()
      gen.next({ json: jest.fn(), ok: true });

      // remote call
      expect(gen.next({ conversationId, endpointId }).value).toEqual(
        call(
          [commandService, commandService.remoteCall],
          SharedConstants.Commands.Emulator.ExtractActivitiesFromFile,
          filename
        )
      );

      // bootstrapChat()
      const activities = [];
      expect(gen.next({ activities }).value).toEqual(
        call([ChatSagas, ChatSagas.bootstrapChat], {
          conversationId,
          documentId: conversationId,
          endpointId,
          mode: 'transcript',
          user: { id: userGUID, name: 'User', role: 'user' },
        } as any)
      );

      // put openDocument
      expect(gen.next().value).toEqual(
        put(
          openDocument({
            contentType: SharedConstants.ContentTypes.CONTENT_TYPE_TRANSCRIPT,
            documentId: conversationId,
            fileName: filename,
            isGlobal: false,
          })
        )
      );

      // call feedActivitiesAsTranscript()
      expect(gen.next().value).toEqual(
        call(
          [ConversationService, ConversationService.feedActivitiesAsTranscript],
          serverUrl,
          conversationId,
          activities
        )
      );

      gen.next({ ok: false, status: 500, statusText: 'INTERNAL SERVER ERROR', text: jest.fn() });
      try {
        gen.next('The server could not handle your request.'); // response.text() inside throwErrorFromResponse()
        expect(true).toBe(false); // ensure catch is hit
      } catch (e) {
        expect(e).toEqual({
          description: '500 INTERNAL SERVER ERROR',
          message: 'Error occurred while feeding activities as a transcript',
          innerMessage: 'The server could not handle your request.',
          status: 500,
        });
      }
    });
  });

  it('should bootstrap a chat', () => {
    const payload: any = {
      conversationId: 'someConvoId',
      documentId: 'someDocId',
      endpointId: 'someEndpointId',
      mode: 'livechat',
      msaAppId: 'someAppId',
      msaPassword: 'someAppPw',
      user: { id: 'user1' },
    };
    const gen = ChatSagas.bootstrapChat(payload);

    // select(getServerUrl)
    expect(gen.next().value).toEqual(select(getServerUrl));

    // put webChatStoreUpdated
    expect(gen.next().value).toEqual(put(webChatStoreUpdated(payload.documentId, mockChatStore())));

    // put webSpeechFactoryUpdated
    expect(gen.next().value).toEqual(put(webSpeechFactoryUpdated(payload.documentId, undefined)));

    // call createDirectLineObject()
    expect(gen.next().value).toEqual(
      call(
        [ChatSagas, (ChatSagas as any).createDirectLineObject],
        payload.conversationId,
        payload.mode,
        payload.endpointId,
        payload.user.id
      )
    );

    // put newChat
    const directLine: any = {};
    expect(gen.next(directLine).value).toEqual(
      put(
        newChat(payload.documentId, payload.mode, {
          conversationId: payload.conversationId,
          directLine,
          userId: payload.user.id,
        })
      )
    );

    // put updatePendingSpeechTokenRetrieval
    expect(gen.next().value).toEqual(put(updatePendingSpeechTokenRetrieval(payload.documentId, true)));

    // select web speech factory
    expect(gen.next().value).toEqual(select(getWebSpeechFactoryForDocumentId, payload.documentId));

    // call createCognitiveServicesSpeechServicesPonyfillFactory
    expect(gen.next({}).value).toEqual(
      call(createCognitiveServicesSpeechServicesPonyfillFactory, {
        credentials: expect.any(Function),
      })
    );

    // put webSpeechFactoryUpdated
    const factory: any = {};
    expect(gen.next(factory).value).toEqual(put(webSpeechFactoryUpdated(payload.documentId, factory)));

    // put updatePendingSpeechTokenRetrieval
    expect(gen.next().value).toEqual(put(updatePendingSpeechTokenRetrieval(payload.documentId, false)));

    expect(gen.next().done).toBe(true);
  });

  it('should bootstrap a chat with DL Speech enabled', () => {
    const payload: any = {
      conversationId: 'someConvoId',
      documentId: 'someDocId',
      endpointId: 'someEndpointId',
      mode: 'livechat',
      speechKey: 'i-am-a-speech-key',
      speechRegion: 'westus',
      user: { id: 'user1' },
    };
    const gen = ChatSagas.bootstrapChat(payload);

    // select(getServerUrl)
    expect(gen.next().value).toEqual(select(getServerUrl));

    // put webChatStoreUpdated
    const result = gen.next();
    expect(result.value).toEqual(put(webChatStoreUpdated(payload.documentId, mockChatStore())));

    // put webSpeechFactoryUpdated
    expect(gen.next().value).toEqual(put(webSpeechFactoryUpdated(payload.documentId, undefined)));

    // call createDirectLineObject()
    expect(gen.next().value).toEqual(
      call(
        [ChatSagas, (ChatSagas as any).createDirectLineObject],
        payload.conversationId,
        payload.mode,
        payload.endpointId,
        payload.user.id
      )
    );

    // put newChat
    const directLine: any = {};
    expect(gen.next(directLine).value).toEqual(
      put(
        newChat(payload.documentId, payload.mode, {
          conversationId: payload.conversationId,
          directLine,
          speechKey: payload.speechKey,
          speechRegion: payload.speechRegion,
          userId: payload.user.id,
        })
      )
    );

    // put updatePendingSpeechTokenRetrieval
    expect(gen.next().value).toEqual(put(updatePendingSpeechTokenRetrieval(payload.documentId, true)));

    // call createDirectLineSpeechAdapters
    expect(gen.next().value).toEqual(
      call(createDirectLineSpeechAdapters, {
        fetchCredentials: {
          region: 'westus',
          subscriptionKey: 'i-am-a-speech-key',
        },
      })
    );

    // put updateSpeechAdapters
    const webSpeechPonyfillFactory: any = {};
    expect(gen.next({ directLine, webSpeechPonyfillFactory }).value).toEqual(
      put(updateSpeechAdapters(payload.documentId, directLine, webSpeechPonyfillFactory))
    );

    // put updatePendingSpeechTokenRetrieval
    expect(gen.next().value).toEqual(put(updatePendingSpeechTokenRetrieval(payload.documentId, false)));

    expect(gen.next().done).toBe(true);
  });

  describe('restartConversation', () => {
    it('should restart a conversation with a new user and conversation ID', () => {
      const serverUrl = 'http://localhost:56273';
      const payload = {
        documentId: 'someDocId',
        requireNewConversationId: true,
        requireNewUserId: true,
      };
      const mockAction: any = {
        payload,
      };
      const gen = ChatSagas.restartConversation(mockAction);

      // select chat from document id
      const chat = {
        conversationId: 'someConvoId',
        directLine: {
          end: jest.fn(),
        },
        mode: 'livechat' as any,
      };
      expect(gen.next().value).toEqual(select(getChatFromDocumentId, payload.documentId));

      // select server url
      expect(gen.next(chat).value).toEqual(select(getServerUrl));

      // put clearLog
      expect(gen.next(serverUrl).value).toEqual(put(clearLog(payload.documentId)));
      expect(chat.directLine.end).toHaveBeenCalled();

      // put setInspectorObjects
      expect(gen.next().value).toEqual(put(setInspectorObjects(payload.documentId, [])));

      // put webChatStoreUpdated
      expect(gen.next().value).toEqual(put(webChatStoreUpdated(payload.documentId, mockChatStore())));

      // put webSpeechFactoryUpdated
      expect(gen.next().value).toEqual(put(webSpeechFactoryUpdated(payload.documentId, undefined)));

      // call updateConversation
      const conversationId = 'someUniqueId|livechat';
      const userId = 'someUniqueIdv4';
      expect(gen.next().value).toEqual(
        call([ConversationService, ConversationService.updateConversation], serverUrl, chat.conversationId, {
          conversationId,
          userId,
        })
      );

      // res.jon()
      const response = {
        botEndpoint: {},
        json: jest.fn(),
        members: [],
        ok: true,
      };
      gen.next(response);

      // call createDirectLineObject
      const json = {
        botEndpoint: {
          botUrl: 'http://localhost:3978',
          id: 'botEndpointId',
          msaAppId: 'someAppId',
          msaPassword: 'someAppPw',
        },
        members: [],
      };
      expect(gen.next(json).value).toEqual(
        call(
          [ChatSagas, (ChatSagas as any).createDirectLineObject],
          conversationId,
          chat.mode,
          json.botEndpoint.id,
          userId
        )
      );

      // put newChat
      const directLine: any = {};
      expect(gen.next(directLine).value).toEqual(
        put(
          newChat(payload.documentId, chat.mode, {
            conversationId,
            directLine,
            userId,
          })
        )
      );

      // call sendInitialLogReport
      expect(gen.next().value).toEqual(
        call(
          [ConversationService, ConversationService.sendInitialLogReport],
          serverUrl,
          conversationId,
          json.botEndpoint.botUrl
        )
      );

      // call sendInitialActivities
      expect(gen.next({ ok: true }).value).toEqual(
        call([ChatSagas, ChatSagas.sendInitialActivities], { conversationId, members: json.members, mode: chat.mode })
      );

      // put updatePendingSpeechTokenRetrieval
      expect(gen.next({ ok: true }).value).toEqual(put(updatePendingSpeechTokenRetrieval(payload.documentId, true)));

      // select web speech factory
      expect(gen.next().value).toEqual(select(getWebSpeechFactoryForDocumentId, payload.documentId));

      // call createCognitiveServicesSpeechServicesPonyfillFactory
      const existingFactory = {};
      expect(gen.next(existingFactory).value).toEqual(
        call(createCognitiveServicesSpeechServicesPonyfillFactory, {
          credentials: expect.any(Function),
        })
      );

      // put webSpeechFactoryUpdated
      const newFactory: any = {};
      expect(gen.next(newFactory).value).toEqual(put(webSpeechFactoryUpdated(payload.documentId, newFactory)));

      // put updatePendingSpeechTokenRetrieval
      expect(gen.next().value).toEqual(put(updatePendingSpeechTokenRetrieval(payload.documentId, false)));

      expect(gen.next().done).toBe(true);
    });

    it('should restart a conversation with the same user and conversation ID', () => {
      const serverUrl = 'http://localhost:56273';
      const payload = {
        documentId: 'someDocId',
        requireNewConversationId: false,
        requireNewUserId: false,
      };
      const mockAction: any = {
        payload,
      };
      const gen = ChatSagas.restartConversation(mockAction);

      // select chat from document id
      const chat = {
        conversationId: 'someConvoId',
        directLine: {
          end: jest.fn(),
        },
        mode: 'livechat' as any,
        userId: 'someUserId',
        restartConversationOption: RestartConversationOptions.NewUserId,
      };
      expect(gen.next().value).toEqual(select(getChatFromDocumentId, payload.documentId));

      // select server url
      expect(gen.next(chat).value).toEqual(select(getServerUrl));

      // put clearLog
      expect(gen.next(serverUrl).value).toEqual(put(clearLog(payload.documentId)));
      expect(chat.directLine.end).toHaveBeenCalled();

      // put setInspectorObjects
      expect(gen.next().value).toEqual(put(setInspectorObjects(payload.documentId, [])));

      // put webChatStoreUpdated
      expect(gen.next().value).toEqual(put(webChatStoreUpdated(payload.documentId, mockChatStore())));

      // put webSpeechFactoryUpdated
      expect(gen.next().value).toEqual(put(webSpeechFactoryUpdated(payload.documentId, undefined)));

      // select custom user GUID
      expect(gen.next().value).toEqual(select(getCustomUserGUID));

      // call updateConversation
      const conversationId = chat.conversationId;
      const userId = chat.userId;
      expect(gen.next('').value).toEqual(
        call([ConversationService, ConversationService.updateConversation], serverUrl, chat.conversationId, {
          conversationId,
          userId,
        })
      );

      // res.jon()
      const response = {
        botEndpoint: {},
        json: jest.fn(),
        members: [],
        ok: true,
      };
      gen.next(response);

      // call createDirectLineObject
      const json = {
        botEndpoint: {
          botUrl: 'http://localhost:3978',
          id: 'botEndpointId',
          msaAppId: 'someAppId',
          msaPassword: 'someAppPw',
        },
        members: [],
      };
      expect(gen.next(json).value).toEqual(
        call(
          [ChatSagas, (ChatSagas as any).createDirectLineObject],
          conversationId,
          chat.mode,
          json.botEndpoint.id,
          userId
        )
      );

      // put newChat
      const directLine: any = {};
      expect(gen.next(directLine).value).toEqual(
        put(
          newChat(payload.documentId, chat.mode, {
            conversationId,
            directLine,
            userId,
            restartConversationOption: chat.restartConversationOption,
          })
        )
      );

      // call sendInitialLogReport
      expect(gen.next().value).toEqual(
        call(
          [ConversationService, ConversationService.sendInitialLogReport],
          serverUrl,
          conversationId,
          json.botEndpoint.botUrl
        )
      );

      // call sendInitialActivities
      expect(gen.next({ ok: true }).value).toEqual(
        call([ChatSagas, ChatSagas.sendInitialActivities], { conversationId, members: json.members, mode: chat.mode })
      );

      // put updatePendingSpeechTokenRetrieval
      expect(gen.next({ ok: true }).value).toEqual(put(updatePendingSpeechTokenRetrieval(payload.documentId, true)));

      // select web speech factory
      expect(gen.next().value).toEqual(select(getWebSpeechFactoryForDocumentId, payload.documentId));

      // call createCognitiveServicesSpeechServicesPonyfillFactory
      const existingFactory = {};
      expect(gen.next(existingFactory).value).toEqual(
        call(createCognitiveServicesSpeechServicesPonyfillFactory, {
          credentials: expect.any(Function),
        })
      );

      // put webSpeechFactoryUpdated
      const newFactory: any = {};
      expect(gen.next(newFactory).value).toEqual(put(webSpeechFactoryUpdated(payload.documentId, newFactory)));

      // put updatePendingSpeechTokenRetrieval
      expect(gen.next().value).toEqual(put(updatePendingSpeechTokenRetrieval(payload.documentId, false)));

      expect(gen.next().done).toBe(true);
    });

    it('should restart a conversation with the same user and conversation ID and initialize DL Speech', () => {
      const serverUrl = 'http://localhost:56273';
      const payload = {
        documentId: 'someDocId',
        requireNewConversationId: false,
        requireNewUserId: false,
      };
      const mockAction: any = {
        payload,
      };
      const gen = ChatSagas.restartConversation(mockAction);

      // select chat from document id
      const chat = {
        conversationId: 'someConvoId',
        directLine: {
          end: jest.fn(),
        },
        mode: 'livechat' as any,
        speechKey: 'i-am-a-speech-key',
        speechRegion: 'westus',
        userId: 'someUserId',
      };
      expect(gen.next().value).toEqual(select(getChatFromDocumentId, payload.documentId));

      // select server url
      expect(gen.next(chat).value).toEqual(select(getServerUrl));

      // put clearLog
      expect(gen.next(serverUrl).value).toEqual(put(clearLog(payload.documentId)));
      expect(chat.directLine.end).toHaveBeenCalled();

      // put setInspectorObjects
      expect(gen.next().value).toEqual(put(setInspectorObjects(payload.documentId, [])));

      // put webChatStoreUpdated
      expect(gen.next().value).toEqual(put(webChatStoreUpdated(payload.documentId, mockChatStore())));

      // put webSpeechFactoryUpdated
      expect(gen.next().value).toEqual(put(webSpeechFactoryUpdated(payload.documentId, undefined)));

      // select custom user GUID
      expect(gen.next().value).toEqual(select(getCustomUserGUID));

      // call updateConversation
      const conversationId = chat.conversationId;
      const userId = chat.userId;
      expect(gen.next('').value).toEqual(
        call([ConversationService, ConversationService.updateConversation], serverUrl, chat.conversationId, {
          conversationId,
          userId,
        })
      );

      // res.jon()
      const response = {
        botEndpoint: {},
        json: jest.fn(),
        members: [],
        ok: true,
      };
      gen.next(response);

      // call createDirectLineObject
      const json = {
        botEndpoint: {
          botUrl: 'http://localhost:3978',
          id: 'botEndpointId',
          msaAppId: 'someAppId',
          msaPassword: 'someAppPw',
        },
        members: [],
      };
      expect(gen.next(json).value).toEqual(
        call(
          [ChatSagas, (ChatSagas as any).createDirectLineObject],
          conversationId,
          chat.mode,
          json.botEndpoint.id,
          userId
        )
      );

      // put newChat
      const directLine: any = {};
      expect(gen.next(directLine).value).toEqual(
        put(
          newChat(payload.documentId, chat.mode, {
            conversationId,
            directLine,
            speechKey: chat.speechKey,
            speechRegion: chat.speechRegion,
            userId,
          })
        )
      );

      // call sendInitialLogReport
      expect(gen.next().value).toEqual(
        call(
          [ConversationService, ConversationService.sendInitialLogReport],
          serverUrl,
          conversationId,
          json.botEndpoint.botUrl
        )
      );

      // put updatePendingSpeechTokenRetrieval
      expect(gen.next({ ok: true }).value).toEqual(put(updatePendingSpeechTokenRetrieval(payload.documentId, true)));

      // call createDirectLineSpeechAdapters
      expect(gen.next().value).toEqual(
        call(createDirectLineSpeechAdapters, {
          fetchCredentials: {
            region: 'westus',
            subscriptionKey: 'i-am-a-speech-key',
          },
        })
      );

      // put updateSpeechAdapters
      const webSpeechPonyfillFactory: any = {};
      expect(gen.next({ directLine, webSpeechPonyfillFactory }).value).toEqual(
        put(updateSpeechAdapters(payload.documentId, directLine, webSpeechPonyfillFactory))
      );

      // put updatePendingSpeechTokenRetrieval
      expect(gen.next().value).toEqual(put(updatePendingSpeechTokenRetrieval(payload.documentId, false)));

      expect(gen.next().done).toBe(true);
    });

    it('should throw if updating the conversation fails while restarting the conversation', () => {
      const serverUrl = 'http://localhost:56273';
      const payload = {
        documentId: 'someDocId',
        requireNewConversationId: true,
        requireNewUserId: true,
      };
      const mockAction: any = {
        payload,
      };
      const gen = ChatSagas.restartConversation(mockAction);

      // select chat from document id
      const chat = {
        conversationId: 'someConvoId',
        directLine: {
          end: jest.fn(),
        },
        mode: 'livechat' as any,
      };
      expect(gen.next().value).toEqual(select(getChatFromDocumentId, payload.documentId));

      // select server url
      expect(gen.next(chat).value).toEqual(select(getServerUrl));

      // put clearLog
      expect(gen.next(serverUrl).value).toEqual(put(clearLog(payload.documentId)));
      expect(chat.directLine.end).toHaveBeenCalled();

      // put setInspectorObjects
      expect(gen.next().value).toEqual(put(setInspectorObjects(payload.documentId, [])));

      // put webChatStoreUpdated
      expect(gen.next().value).toEqual(put(webChatStoreUpdated(payload.documentId, mockChatStore())));

      // put webSpeechFactoryUpdated
      expect(gen.next().value).toEqual(put(webSpeechFactoryUpdated(payload.documentId, undefined)));

      // call updateConversation
      const conversationId = 'someUniqueId|livechat';
      const userId = 'someUniqueIdv4';
      expect(gen.next().value).toEqual(
        call([ConversationService, ConversationService.updateConversation], serverUrl, chat.conversationId, {
          conversationId,
          userId,
        })
      );

      gen.next({ ok: false, status: 500, statusText: 'INTERNAL SERVER ERROR', text: jest.fn() });
      try {
        gen.next('The server could not handle your request.'); // response.text() inside throwErrorFromResponse()
        expect(true).toBe(false);
      } catch (e) {
        expect(e).toEqual({
          description: '500 INTERNAL SERVER ERROR',
          message: 'Error occurred while updating a conversation',
          innerMessage: 'The server could not handle your request.',
          status: 500,
        });
      }
    });
  });

  it('should send a SetTestOptions event activity for non-debug mode conversations', () => {
    const payload = {
      conversationId: 'someConvoId',
      members: [],
      mode: 'livechat' as EmulatorMode,
      randomSeed: 123,
      randomValue: 456,
    };
    const gen = ChatSagas.sendInitialActivities(payload);

    // select server url
    expect(gen.next().value).toEqual(select(getServerUrl));

    // call sendActivityToBot
    const serverUrl = 'http://localhost:58267';
    const activity = {
      name: 'SetTestOptions',
      type: 'event',
      value: {
        randomSeed: payload.randomSeed,
        randomValue: payload.randomValue,
      },
    };
    expect(gen.next(serverUrl).value).toEqual(
      call([ConversationService, ConversationService.sendActivityToBot], serverUrl, payload.conversationId, activity)
    );
  });

  it('should send a conversation update for non-debug mode conversations', () => {
    const payload = {
      conversationId: 'someConvoId',
      members: [],
      mode: 'livechat' as EmulatorMode,
    };
    const gen = ChatSagas.sendInitialActivities(payload);

    // select server url
    expect(gen.next().value).toEqual(select(getServerUrl));

    // call sendActivityToBot
    const serverUrl = 'http://localhost:58267';
    const activity = {
      type: 'conversationUpdate',
      membersAdded: payload.members,
      membersRemoved: [],
    };
    expect(gen.next(serverUrl).value).toEqual(
      call([ConversationService, ConversationService.sendActivityToBot], serverUrl, payload.conversationId, activity)
    );
  });

  it('should send the /INSPECT open command for debug mode conversations', () => {
    const payload = {
      conversationId: 'someConvoId',
      members: [],
      mode: 'debug' as EmulatorMode,
    };
    const gen = ChatSagas.sendInitialActivities(payload);

    // select server url
    expect(gen.next().value).toEqual(select(getServerUrl));

    // call sendActivityToBot
    const serverUrl = 'http://localhost:58267';
    const activity = {
      type: 'message',
      text: '/INSPECT open',
    };
    expect(gen.next(serverUrl).value).toEqual(
      call([ConversationService, ConversationService.sendActivityToBot], serverUrl, payload.conversationId, activity)
    );
  });

  describe('Replay conversation upto selected activity', () => {
    beforeEach(() => {
      const wcMockChannel = createWebChatActivityChannel();
      ChatSagas.wcActivityChannel = wcMockChannel;
    });
    it('should watch for incoming activity events dispatched from webchat store', () => {
      const payload: ChannelPayload = {
        documentId: 'some-id',
        action: {
          type: WebChatEvents.incomingActivity,
          payload: {
            activity: {
              id: 'activity-1',
            } as Activity,
          },
        },
        dispatch: jest.fn(),
        meta: undefined,
      };
      const gen = ChatSagas.watchForWebchatEvents();
      gen.next();
      expect(gen.next(payload).value).toEqual(
        put(incomingActivity(payload.action.payload.activity, payload.documentId))
      );
      expect(gen.next().value).toEqual(fork(ChatSagas.handleReplayIfRequired, payload));
    });

    it('should watch for post activity events dispatched from webchat store', () => {
      const payload: ChannelPayload = {
        documentId: 'some-id',
        action: {
          type: WebChatEvents.postActivity,
          payload: {
            activity: {
              id: 'activity-1',
            } as Activity,
          },
        },
        dispatch: jest.fn(),
        meta: undefined,
      };
      const gen = ChatSagas.watchForWebchatEvents();
      gen.next();
      expect(gen.next(payload).value).toEqual(put(postActivity(payload.action.payload.activity, payload.documentId)));
      expect(gen.next().value).toEqual(fork(ChatSagas.handleReplayIfRequired, payload));
    });

    it('should not dispatch anything for other webchat activities', () => {
      const payload: ChannelPayload = {
        documentId: 'some-id',
        action: {
          type: 'WEBCHAT/SEND_TYPING',
          payload: {
            activity: {
              id: 'activity-1',
            } as Activity,
          },
        },
        dispatch: jest.fn(),
        meta: undefined,
      };
      const gen = ChatSagas.watchForWebchatEvents();
      let res = gen.next();
      res = gen.next(payload);
      expect(res.value).toEqual(fork(ChatSagas.handleReplayIfRequired, payload));
    });

    it('should handle replay only if validateIfReplayFlow is true', () => {
      const validateIfReplayFlow = jest.fn(() => false);
      const mock: any = {
        validateIfReplayFlow,
      };
      const dispatcherMock = jest.fn();
      const payload: ChannelPayload = {
        documentId: 'some-id',
        action: {
          type: WebChatEvents.postActivity,
          payload: {
            activity: {
              id: 'activity-1',
            } as Activity,
          },
        },
        dispatch: dispatcherMock,
        meta: {
          conversationQueue: mock,
        },
      };
      const gen = ChatSagas.handleReplayIfRequired({ ...payload });
      gen.next();
      gen.next();
      expect(dispatcherMock).not.toHaveBeenCalled();
    });

    it('should not dispatch activity to webchat if no activity available to post', () => {
      const mock: Partial<ConversationQueue> = {
        validateIfReplayFlow: jest.fn(() => true),
        handleIncomingActivity: jest.fn(),
        getNextActivityForPost: jest.fn(() => undefined),
      };
      const dispatcherMock = jest.fn();
      const payload: ChannelPayload = {
        documentId: 'some-id',
        action: {
          type: WebChatEvents.postActivity,
          payload: {
            activity: {
              id: 'activity-1',
            } as Activity,
          },
        },
        dispatch: dispatcherMock,
        meta: {
          conversationQueue: mock as ConversationQueue,
        },
      };
      const gen = ChatSagas.handleReplayIfRequired({ ...payload });
      let res;
      res = gen.next();
      res = gen.next(RestartConversationStatus.Started);
      res = gen.next();
      res = gen.next();
      expect(res.done).toBeTruthy();
      expect(dispatcherMock).not.toHaveBeenCalled();
    });

    it('should dispatch activity to webchat if activity available to post', () => {
      const activity: Activity = {
        id: 'activity-1',
      } as Activity;

      const mock: Partial<ConversationQueue> = {
        validateIfReplayFlow: jest.fn(() => true),
        handleIncomingActivity: jest.fn(),
        getNextActivityForPost: jest.fn(() => activity),
      };

      const dispatcherMock = jest.fn();
      const payload: ChannelPayload = {
        documentId: 'some-id',
        action: {
          type: WebChatEvents.postActivity,
          payload: {
            activity: {
              id: '0',
            } as Activity,
          },
        },
        dispatch: dispatcherMock,
        meta: {
          conversationQueue: mock as ConversationQueue,
        },
      };
      const gen = ChatSagas.handleReplayIfRequired({ ...payload });
      let res = gen.next();
      res = gen.next(RestartConversationStatus.Started);
      res = gen.next();
      res = gen.next(activity);
      const args = [...res.value.CALL.args];
      args[0].call(args[1]);
      expect(dispatcherMock).toHaveBeenCalledTimes(1);
      res = gen.next();
      expect(res.done).toBeTruthy();
    });

    it('should throw an error if there was an error replaying the conversation', () => {
      const activity: Activity = {
        id: 'activity-1',
      } as Activity;
      const mock: any = {
        validateIfReplayFlow: jest.fn(() => true),
        handleIncomingActivity: jest.fn(),
        getNextActivityForPost: jest.fn(() => activity),
      };
      const dispatcherMock = jest.fn();
      const payload: ChannelPayload = {
        documentId: 'some-id',
        action: {
          type: WebChatEvents.postActivity,
          payload: {
            activity: {
              id: '0',
            } as Activity,
          },
        },
        dispatch: dispatcherMock,
        meta: {
          conversationQueue: mock,
        },
      };
      const gen = ChatSagas.handleReplayIfRequired({ ...payload });
      let res = gen.next();
      res = gen.next(RestartConversationStatus.Started);
      res = gen.next({
        ex: 'Failed replay',
      });
      expect(res.value).toEqual(
        put(setRestartConversationStatus(RestartConversationStatus.Rejected, payload.documentId))
      );
      res = gen.next();
      const errorMessage = `There was an error replaying the conversation. The Bot code seems to have changed causing an error while replaying.`;
      expect(res.value).toEqual(
        fork(logService.logToDocument, 'some-id', logEntry(textItem(LogLevel.Error, errorMessage)))
      );
    });

    it('should send conversation queue object if its a Conversation replay flow to replayActivitySniffer middleware', done => {
      const webChatEventExpected = {
        type: WebChatEvents.incomingActivity,
        payload: {
          activity: {
            id: '1',
          },
        },
      };
      const activitiesFetched = [
        {
          id: '1',
          from: {
            role: 'user',
          },
        } as Activity,
      ];

      const conversationQueue = new ConversationQueue(
        activitiesFetched,
        {
          incomingActivities: [
            {
              id: '2',
              replyToId: '1',
            },
          ],
          postActivitiesSlots: [1, 3],
        },
        '123',
        {
          id: '2',
        } as Activity
      );

      let eventReceivedCt = 0;
      const channel: any = {
        sendWebChatEvents: args => {
          expect(args.action).toEqual(webChatEventExpected);
          expect(args.meta.conversationQueue).toEqual(conversationQueue);
          eventReceivedCt++;
          if (eventReceivedCt === 1000) {
            done();
          }
        },
      };
      ChatSagas.wcActivityChannel = channel;
      const payload: RestartConversationPayload = {
        documentId: 'someDocId',
        requireNewConversationId: true,
        requireNewUserId: true,
        activity: {
          id: 'act-1',
        } as Activity,
      };
      const mockAction: any = {
        payload,
      };
      const gen = ChatSagas.restartConversation(mockAction);

      // select chat from document id
      const chat = {
        conversationId: 'someConvoId',
        directLine: {
          end: jest.fn(),
        },
        mode: 'livechat' as any,
      };
      gen.next();
      gen.next(chat);
      gen.next();
      gen.next({ ok: true, json: jest.fn() });
      gen.next(activitiesFetched);
      gen.next();
      gen.next(conversationQueue);
      gen.next();
      gen.next();
      const webchatStoreArgs = mockChatStore.mock.calls[0][0];
      const replaySnifferFn = webchatStoreArgs[Object.keys(webchatStoreArgs).pop()];
      const mockDispatcher = {
        dispatch: jest.fn(),
      };
      const mockNext = jest.fn();
      for (let i = 0; i < 1000; i++) {
        replaySnifferFn(mockDispatcher)(mockNext)(webChatEventExpected);
      }
    });
  });
});
