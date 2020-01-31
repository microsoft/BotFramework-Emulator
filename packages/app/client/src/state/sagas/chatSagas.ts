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

import * as Electron from 'electron';
import { MenuItemConstructorOptions } from 'electron';
import { Activity } from 'botframework-schema';
import {
  clearLog,
  closeDocument,
  newChat,
  open as openDocument,
  setInspectorObjects,
  updatePendingSpeechTokenRetrieval,
  webChatStoreUpdated,
  webSpeechFactoryUpdated,
  ChatAction,
  ChatActions,
  ChatDocument,
  DocumentIdPayload,
  OpenTranscriptPayload,
  RestartConversationPayload,
  SharedConstants,
  ValueTypes,
} from '@bfemulator/app-shared';
import {
  CommandServiceImpl,
  CommandServiceInstance,
  ConversationService,
  uniqueIdv4,
  uniqueId,
  EmulatorMode,
  User,
} from '@bfemulator/sdk-shared';
import { createCognitiveServicesSpeechServicesPonyfillFactory, createDirectLine } from 'botframework-webchat';
import { createStore as createWebChatStore } from 'botframework-webchat-core';
import { call, ForkEffect, put, select, takeEvery } from 'redux-saga/effects';
import { encode } from 'base64url';

import { RootState } from '../store';

export const getConversationIdFromDocumentId = (state: RootState, documentId: string) => {
  return (state.chat.chats[documentId] || { conversationId: null }).conversationId;
};

export const getWebSpeechFactoryForDocumentId = (state: RootState, documentId: string): (() => any) => {
  return state.chat.webSpeechFactories[documentId];
};

export const getChatFromDocumentId = (state: RootState, documentId: string): ChatDocument => {
  return state.chat.chats[documentId];
};

export const getCustomUserGUID = (state: RootState): string => {
  return state.framework.userGUID;
};

export const getServerUrl = (state: RootState): string => {
  return state.clientAwareSettings.serverUrl;
};

interface BootstrapChatPayload {
  conversationId: string;
  documentId: string;
  endpointId: string;
  mode: EmulatorMode;
  msaAppId?: string;
  msaPassword?: string;
  user: User;
}

export class ChatSagas {
  @CommandServiceInstance()
  private static commandService: CommandServiceImpl;

  public static *showContextMenuForActivity(action: ChatAction<Activity>): IterableIterator<any> {
    const { payload: activity } = action;
    const menuItems = [
      { label: 'Copy text', id: 'copy' },
      { label: 'Copy json', id: 'json' },
    ] as MenuItemConstructorOptions[];

    const { DisplayContextMenu } = SharedConstants.Commands.Electron;
    const response: { id: string } = yield call(
      [ChatSagas.commandService, ChatSagas.commandService.remoteCall],
      DisplayContextMenu,
      menuItems
    );

    if (!response) {
      return; // canceled context menu
    }
    switch (response.id) {
      case 'copy':
        return Electron.clipboard.writeText(ChatSagas.getTextFromActivity(activity));

      case 'json':
        return Electron.clipboard.writeText(JSON.stringify(activity, null, 2));

      default:
        return;
    }
  }

  public static *closeConversation(action: ChatAction<DocumentIdPayload>): IterableIterator<any> {
    const conversationId = yield select(getConversationIdFromDocumentId, action.payload.documentId);
    const { DeleteConversation } = SharedConstants.Commands.Emulator;
    const { documentId } = action.payload;
    const chat: ChatDocument = yield select(getChatFromDocumentId, documentId);
    if (chat && chat.directLine) {
      chat.directLine.end(); // stop polling
    }
    yield put(closeDocument(documentId));
    // remove the webchat store when the document is closed
    yield put(webChatStoreUpdated(documentId, null));
    yield call([ChatSagas.commandService, ChatSagas.commandService.remoteCall], DeleteConversation, conversationId);
  }

  public static *newTranscript(action: ChatAction<OpenTranscriptPayload>): IterableIterator<any> {
    const { filename } = action.payload;
    // start a conversation
    const serverUrl = yield select(getServerUrl);
    const user = { id: yield select(getCustomUserGUID) || uniqueIdv4(), name: 'User', role: 'user' };
    const payload = {
      botUrl: '',
      channelServiceType: '' as any,
      members: [user],
      mode: 'transcript' as EmulatorMode,
      msaAppId: '',
      msaPassword: '',
    };
    let res: Response = yield call([ConversationService, ConversationService.startConversation], serverUrl, payload);
    if (!res.ok) {
      throw new Error(
        `Error occurred while starting a new conversation: ${res.status}: ${res.statusText || 'No status text'}`
      );
    }
    const { conversationId, endpointId }: { conversationId: string; endpointId: string } = yield res.json();
    const documentId = `${conversationId}`;

    let activities;
    if (action.payload.activities && action.payload.activities.length) {
      activities = action.payload.activities;
    } else {
      const result: any = yield call(
        [ChatSagas.commandService, ChatSagas.commandService.remoteCall],
        SharedConstants.Commands.Emulator.ExtractActivitiesFromFile,
        filename
      );
      activities = result.activities;
    }

    // put the chat document into the store
    yield call([ChatSagas, ChatSagas.bootstrapChat], {
      conversationId,
      documentId,
      endpointId,
      mode: 'transcript',
      user,
    });

    // open a document to render the transcript
    yield put(
      openDocument({
        contentType: SharedConstants.ContentTypes.CONTENT_TYPE_TRANSCRIPT,
        documentId,
        fileName: filename,
        isGlobal: false,
      })
    );

    // feed activities into the conversation's transcript
    res = yield call(
      [ConversationService, ConversationService.feedActivitiesAsTranscript],
      serverUrl,
      conversationId,
      activities
    );
    if (!res.ok) {
      throw new Error(
        `Error occurred while feeding activities as a transcript: ${res.status}: ${res.statusText || 'No status text'}`
      );
    }

    if (filename.endsWith('.chat')) {
      ChatSagas.commandService
        .remoteCall(SharedConstants.Commands.Telemetry.TrackEvent, 'chatFile_open')
        .catch(_e => void 0);
    } else if (filename.endsWith('.transcript')) {
      ChatSagas.commandService
        .remoteCall(SharedConstants.Commands.Telemetry.TrackEvent, 'transcriptFile_open')
        .catch(_e => void 0);
    }
  }

  public static *bootstrapChat(payload: BootstrapChatPayload): IterableIterator<any> {
    const { conversationId, documentId, endpointId, mode, msaAppId, msaPassword, user } = payload;
    // Create a new webchat store for this documentId
    yield put(webChatStoreUpdated(documentId, createWebChatStore()));
    // Each time a new chat is open, retrieve the speech token
    // if the endpoint is speech enabled and create a bound speech
    // pony fill factory. This is consumed by WebChat...
    yield put(webSpeechFactoryUpdated(documentId, undefined)); // remove the old factory

    // create the DL object and update the chat in the store
    const directLine = yield call(
      [ChatSagas, ChatSagas.createDirectLineObject],
      conversationId,
      mode,
      endpointId,
      user.id
    );
    yield put(
      newChat(documentId, mode, {
        conversationId,
        directLine,
        userId: user.id,
      })
    );

    // initialize speech
    if (msaAppId && msaPassword) {
      // Get a token for speech and setup speech integration with Web Chat
      yield put(updatePendingSpeechTokenRetrieval(documentId, true));
      // If an existing factory is found, refresh the token
      const existingFactory: string = yield select(getWebSpeechFactoryForDocumentId, documentId);
      const { GetSpeechToken: command } = SharedConstants.Commands.Emulator;

      try {
        const speechAuthenticationToken: Promise<string> = ChatSagas.commandService.remoteCall(
          command,
          endpointId,
          !!existingFactory
        );

        const factory = yield call(createCognitiveServicesSpeechServicesPonyfillFactory, {
          authorizationToken: speechAuthenticationToken,
          region: 'westus', // Currently, the prod speech service is only deployed to westus
        });

        yield put(webSpeechFactoryUpdated(documentId, factory)); // Provide the new factory to the store
      } catch (e) {
        // No-op - this appId/pass combo is not provisioned to use the speech api
      }

      yield put(updatePendingSpeechTokenRetrieval(documentId, false));
    }
  }

  public static *restartConversation(action: ChatAction<RestartConversationPayload>): IterableIterator<any> {
    const { documentId, requireNewConversationId, requireNewUserId } = action.payload;
    const chat: ChatDocument = yield select(getChatFromDocumentId, documentId);
    const serverUrl = yield select(getServerUrl);

    if (chat.directLine) {
      chat.directLine.end();
    }
    yield put(clearLog(documentId));
    yield put(setInspectorObjects(documentId, []));
    yield put(webChatStoreUpdated(documentId, createWebChatStore())); // reset web chat store
    yield put(webSpeechFactoryUpdated(documentId, undefined)); // remove old speech token factory

    // re-init new directline object & update conversation object in server state
    // set user id
    let userId;
    if (requireNewUserId) {
      userId = uniqueIdv4();
    } else {
      // use the previous id or the custom id from settings
      userId = chat.userId || (yield select(getCustomUserGUID));
    }

    let conversationId;
    if (requireNewConversationId) {
      conversationId = `${uniqueId()}|${chat.mode}`;
    } else {
      // preserve the current conversation id
      conversationId = chat.conversationId || `${uniqueId()}|${chat.mode}`;
    }

    // update the main-side conversation object with conversation & user IDs,
    // and ensure that conversation is in a fresh state
    const res: Response = yield call(
      [ConversationService, ConversationService.updateConversation],
      serverUrl,
      chat.conversationId,
      {
        conversationId,
        userId,
      }
    );
    if (!res.ok) {
      throw new Error(
        `Error occurred while updating a conversation: ${res.status}: ${res.statusText || 'No status text'}`
      );
    }
    const { botEndpoint, members }: { botEndpoint: any; members: User[] } = yield res.json();

    // create the directline object
    const directLine = yield call(
      [ChatSagas, ChatSagas.createDirectLineObject],
      conversationId,
      chat.mode,
      botEndpoint.id,
      userId
    );

    // update chat document
    yield put(
      newChat(documentId, chat.mode, {
        conversationId,
        directLine,
        userId,
      })
    );

    // initial report
    yield call(
      [ConversationService, ConversationService.sendInitialLogReport],
      serverUrl,
      conversationId,
      botEndpoint.botUrl
    );

    // send CU or /INSPECT open
    yield call([ChatSagas, ChatSagas.sendInitialActivity], { conversationId, members, mode: chat.mode });

    // initialize speech
    if (botEndpoint.msaAppId && botEndpoint.msaPassword) {
      // Get a token for speech and setup speech integration with Web Chat
      yield put(updatePendingSpeechTokenRetrieval(documentId, true));
      // If an existing factory is found, refresh the token
      const existingFactory: string = yield select(getWebSpeechFactoryForDocumentId, documentId);
      const { GetSpeechToken } = SharedConstants.Commands.Emulator;

      try {
        const speechAuthenticationToken: Promise<string> = ChatSagas.commandService.remoteCall(
          GetSpeechToken,
          botEndpoint.id,
          !!existingFactory
        );

        const factory = yield call(createCognitiveServicesSpeechServicesPonyfillFactory, {
          authorizationToken: speechAuthenticationToken,
          region: 'westus', // Currently, the prod speech service is only deployed to westus
        });

        yield put(webSpeechFactoryUpdated(documentId, factory)); // Provide the new factory to the store
      } catch (e) {
        // No-op - this appId/pass combo is not provisioned to use the speech api
      }

      yield put(updatePendingSpeechTokenRetrieval(documentId, false));
    }
  }

  public static *sendInitialActivity(payload: any): Iterator<any> {
    const { conversationId, members, mode } = payload;

    let activity;
    if (mode === 'debug') {
      activity = {
        type: 'message',
        text: '/INSPECT open',
      };
    } else {
      activity = {
        type: 'conversationUpdate',
        membersAdded: members,
        membersRemoved: [],
      };
    }
    const serverUrl = yield select(getServerUrl);
    return yield call(
      [ConversationService, ConversationService.sendActivityToBot],
      serverUrl,
      conversationId,
      activity
    );
  }

  private static *createDirectLineObject(
    conversationId: string,
    mode: EmulatorMode,
    endpointId: string,
    userId: string
  ): Iterator<any> {
    const serverUrl = yield select(getServerUrl);
    const options = {
      conversationId,
      mode,
      endpointId,
      userId,
    };
    const secret = encode(JSON.stringify(options));
    const res: Response = yield fetch(`${serverUrl}/emulator/ws/port`);
    if (!res.ok) {
      throw new Error(
        `Error occurred while retrieving the WebSocket server port: ${res.status}: ${res.statusText ||
          'No status text'}`
      );
    }
    const webSocketPort = yield res.text();
    const directLine = createDirectLine({
      token: 'emulatorToken',
      conversationId,
      secret,
      domain: `${serverUrl}/v3/directline`,
      webSocket: true,
      streamUrl: `ws://localhost:${webSocketPort}/ws/${conversationId}`,
    });
    return directLine;
  }

  private static getTextFromActivity(activity: Activity): string {
    if (activity.valueType === ValueTypes.Command) {
      return activity.value;
    } else if (activity.valueType === ValueTypes.Activity) {
      return 'text' in activity.value ? activity.value.text : activity.label;
    }
    return activity.text || activity.label || '';
  }
}

export function* chatSagas(): IterableIterator<ForkEffect> {
  yield takeEvery(ChatActions.showContextMenuForActivity, ChatSagas.showContextMenuForActivity);
  yield takeEvery(ChatActions.closeConversation, ChatSagas.closeConversation);
  yield takeEvery(ChatActions.restartConversation, ChatSagas.restartConversation);
  yield takeEvery(ChatActions.openTranscript, ChatSagas.newTranscript);
}
