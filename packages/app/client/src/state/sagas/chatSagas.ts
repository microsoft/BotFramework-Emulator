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
  ChatDocument,
  DocumentIdPayload,
  OpenTranscriptPayload,
  RestartConversationPayload,
  SharedConstants,
  ValueTypes,
  incomingActivity,
  postActivity,
  RestartConversationStatus,
  setRestartConversationStatus,
  newNotification,
  beginAdd,
  NotificationType,
  updateSpeechAdapters,
} from '@bfemulator/app-shared';
import {
  CommandServiceImpl,
  CommandServiceInstance,
  ConversationService,
  uniqueIdv4,
  uniqueId,
  EmulatorMode,
  User,
  logEntry,
  textItem,
  LogLevel,
} from '@bfemulator/sdk-shared';
import { createStore as createWebChatStore } from 'botframework-webchat-core';
import { call, ForkEffect, put, select, takeEvery, fork, take } from 'redux-saga/effects';
import { encode } from 'base64url';
import { ChatActions } from '@bfemulator/app-shared';
import {
  createCognitiveServicesSpeechServicesPonyfillFactory,
  createDirectLine,
  createDirectLineSpeechAdapters,
} from 'botframework-webchat';

import { logService } from '../../platform/log/logService';
import { RootState } from '../store';
import { ConversationQueue, WebChatEvents, webChatEventsToWatch } from '../../utils/restartConversationQueue';
import { throwErrorFromResponse } from '../utils/throwErrorFromResponse';

import {
  createWebChatActivityChannel,
  WebChatActivityChannel,
  ChannelPayload,
  ReplayActivitySnifferProps,
} from './webChatActivityChannel';

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

export const getChatStoreFromDocumentId = (state: RootState, documentId: string): string => {
  return state.chat.webChatStores[documentId];
};

export const getRestartStatus = (state: RootState, documentId: string): RestartConversationStatus => {
  if (!state.chat.restartStatus) {
    return undefined;
  }
  return state.chat.restartStatus[documentId];
};

export const getCurrentEmulatorMode = (state: RootState, documentId: string): EmulatorMode => {
  return state.chat.chats[documentId].mode;
};

export const create = (classToInstantiate, ...args) => call(() => new classToInstantiate(...args));

const dispatchActivityToWebChat = (dispatch: Function, postActivity: Activity) => {
  dispatch({
    type: WebChatEvents.postActivity,
    payload: {
      activity: {
        ...postActivity,
      },
    },
    meta: {
      method: 'keyboard',
    },
  });
};

function createDLSpeechBotSniffer(isDLSpeechBot: boolean, conversationId: string, serverUrl: string) {
  return () => next => async action => {
    if (isDLSpeechBot && action.type === 'DIRECT_LINE/INCOMING_ACTIVITY') {
      const res = await ConversationService.performTrackingForActivity(
        serverUrl,
        conversationId,
        action.payload.activity
      );
      if (!res.ok) {
        let errText = '';
        if (res.text) {
          errText = await res.text();
        }
        console.error(`Failed to log DL Speech activity: ${errText}`); // eslint-disable-line no-console
      }
    }
    return next(action);
  };
}

function createReplayActivitySniffer(documentId: string, meta: ReplayActivitySnifferProps = undefined) {
  return ({ dispatch }) => next => action => {
    if (action.payload && webChatEventsToWatch.includes(action.type)) {
      ChatSagas.wcActivityChannel.sendWebChatEvents({
        documentId,
        action,
        dispatch,
        meta,
      });
    }
    return next(action);
  };
}

interface BootstrapChatPayload {
  conversationId: string;
  documentId: string;
  endpointId: string;
  mode: EmulatorMode;
  msaAppId?: string;
  msaPassword?: string;
  speechKey?: string;
  speechRegion?: string;
  user: User;
}

export class ChatSagas {
  @CommandServiceInstance()
  private static commandService: CommandServiceImpl;
  public static wcActivityChannel: WebChatActivityChannel;

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
    const customUserId = yield select(getCustomUserGUID);
    const user = { id: customUserId || uniqueIdv4(), name: 'User', role: 'user' };
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
      yield* throwErrorFromResponse('Error occurred while starting a new conversation', res);
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
      yield* throwErrorFromResponse('Error occurred while feeding activities as a transcript', res);
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

  public static *handleReplayIfRequired({ documentId, action, dispatch, meta }: ChannelPayload): IterableIterator<any> {
    const conversationQueue: ConversationQueue | undefined = meta ? meta.conversationQueue : undefined;
    const replayStatus: RestartConversationStatus | undefined = yield select(getRestartStatus, documentId);

    if (conversationQueue && conversationQueue.validateIfReplayFlow(replayStatus, action.type)) {
      const activityFlowError: string = yield call(
        [conversationQueue, conversationQueue.handleIncomingActivity],
        action.payload.activity
      );

      if (activityFlowError || action.type === WebChatEvents.rejectedActivity) {
        yield put(setRestartConversationStatus(RestartConversationStatus.Rejected, documentId));
        const errorMessage: string =
          'There was an error replaying the conversation. ' +
          'The Bot code seems to have changed causing an error while replaying.';

        yield fork(logService.logToDocument, documentId, logEntry(textItem(LogLevel.Error, errorMessage)));

        const replayErrorNotification = yield call(newNotification, errorMessage, NotificationType.Error);
        yield put(beginAdd(replayErrorNotification));
        return;
      }
      if (conversationQueue.replayComplete) {
        yield put(setRestartConversationStatus(RestartConversationStatus.Completed, documentId));
        return;
      }

      const postActivity: Activity | undefined = yield call([
        meta.conversationQueue,
        meta.conversationQueue.getNextActivityForPost,
      ]);
      if (postActivity) {
        yield call(dispatchActivityToWebChat, dispatch, postActivity);
      }
    }
  }

  public static *watchForWebchatEvents() {
    const webChatEventChannel = ChatSagas.wcActivityChannel.getWebChatChannelSubscriber();
    while (true) {
      const { documentId, action, dispatch, meta }: ChannelPayload = yield take(webChatEventChannel);
      try {
        switch (action.type) {
          case WebChatEvents.postActivity: {
            const activity: Activity = action.payload.activity;
            yield put(postActivity(activity, documentId));
            break;
          }

          case WebChatEvents.incomingActivity: {
            const activity: Activity = action.payload.activity;
            yield put(incomingActivity(activity, documentId));
            break;
          }
        }
      } catch (err) {
        webChatEventChannel.close();
        // Restart the channel if error occurs
        ChatSagas.wcActivityChannel = createWebChatActivityChannel();
      } finally {
        yield fork(ChatSagas.handleReplayIfRequired, { documentId, action, dispatch, meta });
      }
    }
  }

  public static *bootstrapChat(payload: BootstrapChatPayload): IterableIterator<any> {
    try {
      const {
        conversationId,
        documentId,
        endpointId,
        mode,
        msaAppId,
        msaPassword,
        user,
        speechKey,
        speechRegion,
      } = payload;
      const isDLSpeechBot: boolean = !!(speechKey && speechRegion);
      const serverUrl = yield select(getServerUrl);

      yield put(
        webChatStoreUpdated(
          documentId,
          createWebChatStore(
            {},
            createDLSpeechBotSniffer(isDLSpeechBot, conversationId, serverUrl),
            createReplayActivitySniffer(documentId)
          )
        )
      );
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
          speechKey,
          speechRegion,
        })
      );

      if (isDLSpeechBot) {
        yield put(updatePendingSpeechTokenRetrieval(documentId, true));
        try {
          const { directLine, webSpeechPonyfillFactory } = yield call(createDirectLineSpeechAdapters, {
            fetchCredentials: {
              region: speechRegion,
              subscriptionKey: speechKey,
            },
          });
          yield put(updateSpeechAdapters(documentId, directLine, webSpeechPonyfillFactory));
        } catch (e) {
          throw new Error(`There was an error while initializing DL Speech: ${e}`);
        } finally {
          yield put(updatePendingSpeechTokenRetrieval(documentId, false));
        }
        return;
      }

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
    } catch (ex) {
      throw new Error(`Error occurred while bootstrapping a new chat: ${ex}`);
    }
  }

  public static *restartConversation(action: ChatAction<RestartConversationPayload>): IterableIterator<any> {
    const { documentId, requireNewConversationId, requireNewUserId } = action.payload;
    const replayToActivity: Activity = action.payload.activity || undefined;
    const chat: ChatDocument = yield select(getChatFromDocumentId, documentId);
    const serverUrl = yield select(getServerUrl);
    const isDLSpeechBot: boolean = !!(chat.speechKey && chat.speechRegion);
    let conversationQueue: ConversationQueue;

    if (chat.directLine) {
      chat.directLine.end();
    }

    let conversationId;
    if (requireNewConversationId) {
      conversationId = `${uniqueId()}|${chat.mode}`;
    } else {
      // preserve the current conversation id
      conversationId = chat.conversationId || `${uniqueId()}|${chat.mode}`;
    }
    if (replayToActivity) {
      const res = yield call(
        [ConversationService, ConversationService.fetchActivitiesForAConversation],
        serverUrl,
        chat.conversationId
      );

      if (!res.ok) {
        yield* throwErrorFromResponse('Error occurred while fetching activities in transcript while replaying', res);
      }
      const activities: Activity[] = yield res.json();
      yield put(setRestartConversationStatus(RestartConversationStatus.Started, documentId));

      conversationQueue = yield create(
        ConversationQueue,
        activities,
        chat.replayData,
        conversationId,
        replayToActivity
      );
    }

    yield put(clearLog(documentId));
    yield put(setInspectorObjects(documentId, []));
    yield put(
      webChatStoreUpdated(
        documentId,
        createWebChatStore(
          {},
          createDLSpeechBotSniffer(isDLSpeechBot, conversationId, serverUrl),
          createReplayActivitySniffer(documentId, {
            conversationQueue,
          })
        )
      )
    );

    yield put(webSpeechFactoryUpdated(documentId, undefined)); // remove old speech token factory

    // re-init new directline object & update conversation object in server state
    // set user id
    let userId;
    if (requireNewUserId) {
      userId = uniqueIdv4();
    } else {
      // use the previous id or the custom id from settings
      const customUserId = yield select(getCustomUserGUID);
      userId = chat.userId || customUserId;
    }

    // update the main-side conversation object with conversation & user IDs,
    // and ensure that conversation is in a fresh state
    let res: Response = yield call(
      [ConversationService, ConversationService.updateConversation],
      serverUrl,
      chat.conversationId,
      {
        conversationId,
        userId,
      }
    );
    if (!res.ok) {
      yield* throwErrorFromResponse('Error occurred while updating a conversation', res);
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
        speechKey: chat.speechKey,
        speechRegion: chat.speechRegion,
        userId,
        restartConversationOption: chat.restartConversationOption,
      })
    );

    // initial report
    res = yield call(
      [ConversationService, ConversationService.sendInitialLogReport],
      serverUrl,
      conversationId,
      botEndpoint.botUrl
    );
    if (!res.ok) {
      yield* throwErrorFromResponse('Error occurred while sending the initial log report', res);
    }

    // send CU or /INSPECT open (DL Speech will do this automatically)
    if (!isDLSpeechBot) {
      res = yield call([ChatSagas, ChatSagas.sendInitialActivity], { conversationId, members, mode: chat.mode });
      if (!res.ok) {
        yield* throwErrorFromResponse('Error occurred while sending the initial activity', res);
      }
    }

    // initialize DL speech
    if (isDLSpeechBot) {
      yield put(updatePendingSpeechTokenRetrieval(documentId, true));
      try {
        const { directLine, webSpeechPonyfillFactory } = yield call(createDirectLineSpeechAdapters, {
          fetchCredentials: {
            region: chat.speechRegion,
            subscriptionKey: chat.speechKey,
          },
        });
        yield put(updateSpeechAdapters(documentId, directLine, webSpeechPonyfillFactory));
      } catch (e) {
        throw new Error(`There was an error while initializing DL Speech: ${e}`);
      } finally {
        yield put(updatePendingSpeechTokenRetrieval(documentId, false));
      }
      return;
    }

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
      yield* throwErrorFromResponse('Error occurred while retrieving the web socket port', res);
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
  ChatSagas.wcActivityChannel = createWebChatActivityChannel();
  yield fork(ChatSagas.watchForWebchatEvents);
  yield takeEvery(ChatActions.showContextMenuForActivity, ChatSagas.showContextMenuForActivity);
  yield takeEvery(ChatActions.closeConversation, ChatSagas.closeConversation);
  yield takeEvery(ChatActions.restartConversation, ChatSagas.restartConversation);
  yield takeEvery(ChatActions.openTranscript, ChatSagas.newTranscript);
}
