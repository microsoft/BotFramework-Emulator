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
import { SharedConstants, ValueTypes } from '@bfemulator/app-shared';
import {
  CommandServiceImpl,
  CommandServiceInstance,
  InspectableObjectLogItem,
  LogItem,
  LogItemType,
} from '@bfemulator/sdk-shared';
import { diff } from 'deep-diff';
import { IEndpointService } from 'botframework-config/lib/schema';
import { createCognitiveServicesBingSpeechPonyfillFactory } from 'botframework-webchat';
import { createStore as createWebChatStore } from 'botframework-webchat-core';
import { call, ForkEffect, put, select, takeEvery, takeLatest } from 'redux-saga/effects';

import {
  ChatAction,
  ChatActions,
  ClearLogPayload,
  closeDocument,
  DocumentIdPayload,
  setHighlightedObjects,
  setInspectorObjects,
  updatePendingSpeechTokenRetrieval,
  webChatStoreUpdated,
  webSpeechFactoryUpdated,
} from '../action/chatActions';
import { RootState } from '../store';
import { isSpeechEnabled } from '../../utils';
import { ChatDocument } from '../reducer/chat';

const getConversationIdFromDocumentId = (state: RootState, documentId: string) => {
  return (state.chat.chats[documentId] || { conversationId: null }).conversationId;
};

const getWebSpeechFactoryForDocumentId = (state: RootState, documentId: string): (() => any) => {
  return state.chat.webSpeechFactories[documentId];
};

const getEndpointServiceByDocumentId = (state: RootState, documentId: string): IEndpointService => {
  const chat = state.chat.chats[documentId];
  return ((state.bot.activeBot && state.bot.activeBot.services) || []).find(
    s => s.id === chat.endpointId
  ) as IEndpointService;
};

const getCurrentDocumentId = (state: RootState): string => {
  const { editors, activeEditor } = state.editor;
  const { activeDocumentId } = editors[activeEditor];
  return activeDocumentId;
};

const getBotState = (state: RootState, selectedTrace: Activity, botDiff: number): Activity => {
  const { editors, activeEditor } = state.editor;
  const { activeDocumentId } = editors[activeEditor];
  const chat = state.chat.chats[activeDocumentId];
  const entries = chat.log.entries as any[];

  const allEntries: LogItem<InspectableObjectLogItem>[] = entries.reduce(
    (agg: LogItem[], entry) => agg.concat(entry.items),
    []
  );
  const filteredLogItems: LogItem<InspectableObjectLogItem>[] = allEntries.filter(
    (item: LogItem<InspectableObjectLogItem>) => {
      const activity = item.payload.obj as Activity;
      return item.type === LogItemType.InspectableObject && activity.valueType === ValueTypes.BotState;
    }
  );
  const index = filteredLogItems.findIndex(logItem => logItem.payload.obj.id === selectedTrace.id) + botDiff;
  const targetLogEntry = filteredLogItems[index];
  return targetLogEntry && (targetLogEntry.payload.obj as Activity);
};

const getChatFromDocumentId = (state: RootState, documentId: string): any => {
  return state.chat.chats[documentId];
};

export class ChatSagas {
  @CommandServiceInstance()
  private static commandService: CommandServiceImpl;

  public static *showContextMenuForActivity(action: ChatAction<Activity>): Iterable<any> {
    const { payload: activity } = action;
    const previousBotState = yield select(getBotState, activity, -1);
    const diffEnabled = activity.valueType.endsWith('botState') && !!previousBotState;
    const menuItems = [
      { label: 'Copy text', id: 'copy' },
      { label: 'Copy json', id: 'json' },
      { type: 'separator' },
      { label: 'Compare with previous', id: 'diff', enabled: diffEnabled },
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
        yield* ChatSagas.diffWithPreviousBotState(activity);
    }
  }

  public static *closeConversation(action: ChatAction<DocumentIdPayload>): Iterable<any> {
    const conversationId = yield select(getConversationIdFromDocumentId, action.payload.documentId);
    const { DeleteConversation } = SharedConstants.Commands.Emulator;
    const { documentId } = action.payload;
    const chat = yield select(getChatFromDocumentId, documentId);
    if (chat && chat.directLine) {
      chat.directLine.end(); // stop polling
    }
    yield put(closeDocument(documentId));
    // remove the webchat store when the document is closed
    yield put(webChatStoreUpdated(documentId, null));
    yield call([ChatSagas.commandService, ChatSagas.commandService.remoteCall], DeleteConversation, conversationId);
  }

  public static *newChat(action: ChatAction<Partial<ChatDocument & ClearLogPayload>>): Iterable<any> {
    const { documentId, resolver } = action.payload;
    // Create a new webchat store for this documentId
    yield put(webChatStoreUpdated(documentId, createWebChatStore()));
    // Each time a new chat is open, retrieve the speech token
    // if the endpoint is speech enabled and create a bind speech
    // pony fill factory. This is consumed by WebChat...
    yield put(webSpeechFactoryUpdated(documentId, null)); // remove the old factory
    const endpoint: IEndpointService = yield select(getEndpointServiceByDocumentId, documentId);
    if (!isSpeechEnabled(endpoint)) {
      if (resolver) {
        resolver();
      }
      return;
    }
    yield put(updatePendingSpeechTokenRetrieval(true));
    // If an existing factory is found, refresh the token
    const existingFactory: string = yield select(getWebSpeechFactoryForDocumentId, documentId);
    const { GetSpeechToken: command } = SharedConstants.Commands.Emulator;
    let token;
    try {
      token = yield call(
        [ChatSagas.commandService, ChatSagas.commandService.remoteCall],
        command,
        endpoint.id,
        !!existingFactory
      );
    } catch (e) {
      // No-op - this appId/pass combo is not provisioned to use the speech api
    }
    if (token) {
      const factory = yield call(createCognitiveServicesBingSpeechPonyfillFactory, {
        authorizationToken: token,
      });
      yield put(webSpeechFactoryUpdated(documentId, factory)); // Provide the new factory to the store
    }
    yield put(updatePendingSpeechTokenRetrieval(false));
    if (resolver) {
      resolver();
    }
  }

  public static *diffWithPreviousBotState(currentBotState: Activity): Iterable<any> {
    const previousBotState: Activity = yield select(getBotState, currentBotState, -1);

    const lhs = [];
    const rhs = [];
    const deltas = diff(previousBotState.value, currentBotState.value);
    (deltas || []).forEach(diff => {
      switch (diff.kind) {
        case 'A':
          {
            const { item, path } = diff;
            path.push(diff.index);
            if (item.kind === 'D') {
              lhs.push(path);
            } else if (item.kind === 'E') {
              rhs.push(path);
              lhs.push(path);
            } else {
              rhs.push(path);
            }
          }
          break;

        case 'D':
          lhs.push(diff.path);
          break;

        case 'E':
          rhs.push(diff.path);
          lhs.push(diff.path);
          break;

        case 'N':
          rhs.push(diff.path);
          break;
      }
    });

    // Clone the bot state and update the keys to show changes
    const botStateClone: Activity = JSON.parse(
      JSON.stringify(currentBotState, (key: string, value: any) => {
        if (value instanceof Array) {
          return Object.keys(value).reduce((conversion: any, key) => {
            conversion['' + key] = value[key];
            return conversion;
          }, {});
        }
        return value;
      })
    );
    botStateClone.valueType = ValueTypes.Diff;
    // values that were added
    rhs.forEach(path => {
      ChatSagas.buildDiff('+', path, botStateClone.value, botStateClone.value);
    });
    // values that were removed
    lhs.forEach(path => {
      ChatSagas.buildDiff('-', path, botStateClone.value, previousBotState.value);
    });
    const documentId = yield select(getCurrentDocumentId);
    yield put(setHighlightedObjects(documentId, [previousBotState, currentBotState]));
    yield put(setInspectorObjects(documentId, botStateClone));
  }

  private static getTextFromActivity(activity: Activity): string {
    if (activity.valueType === ValueTypes.Command) {
      return activity.value;
    } else if (activity.valueType === ValueTypes.Activity) {
      return 'text' in activity.value ? activity.value.text : activity.label;
    }
    return activity.text || activity.label || '';
  }

  public static buildDiff(prependWith: string, path: (string | number)[], target: any, source: any): void {
    let key;
    for (let i = 0; i < path.length; i++) {
      key = path[i];
      if (key in target && target[key] !== null && typeof target[key] === 'object') {
        target = target[key];
        source = source[key];
      } else {
        break;
      }
    }
    const value = source[key];
    delete target[key];
    target[prependWith + key] = value;
  }
}

export function* chatSagas(): IterableIterator<ForkEffect> {
  yield takeEvery(ChatActions.showContextMenuForActivity, ChatSagas.showContextMenuForActivity);
  yield takeEvery(ChatActions.closeConversation, ChatSagas.closeConversation);
  yield takeLatest([ChatActions.newChat, ChatActions.clearLog], ChatSagas.newChat);
}
