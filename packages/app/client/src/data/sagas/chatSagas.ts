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
import { Activity, ActivityTypes } from 'botframework-schema';
import { SharedConstants } from '@bfemulator/app-shared';
import { InspectableObjectLogItem, LogItem, LogItemType } from '@bfemulator/sdk-shared';
import { diff } from 'deep-diff';
import { IEndpointService } from 'botframework-config/lib/schema';
import { createCognitiveServicesBingSpeechPonyfillFactory } from 'botframework-webchat';

import {
  ChatAction,
  ChatActions,
  closeDocument,
  DocumentIdPayload,
  NewChatPayload,
  setInspectorObjects,
  updatePendingSpeechTokenRetrieval,
  webSpeechFactoryUpdated,
} from '../action/chatActions';
import { CommandServiceImpl } from '../../platform/commands/commandServiceImpl';
import { RootState } from '../store';
import { isSpeechEnabled } from '../../utils';

import { call, ForkEffect, put, select, takeEvery } from 'redux-saga/effects';

const getConversationIdFromDocumentId = (state: RootState, documentId: string) => {
  return (state.chat.chats[documentId] || {}).conversationId;
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

const getPreviousBotState = (state: RootState, selectedTrace: Activity): Activity => {
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
      return (
        item.type === LogItemType.InspectableObject &&
        (item.payload.obj as Activity).valueType.includes('botState') &&
        (item.payload.obj as Activity).id !== selectedTrace.id
      );
    }
  );
  const targetLogEntry = filteredLogItems.pop();
  return targetLogEntry && (targetLogEntry.payload.obj as Activity);
};

export function* showContextMenuForActivity(action: ChatAction<Activity>): Iterable<any> {
  const { payload: activity } = action;
  const previousBotState = yield select(getPreviousBotState, activity);
  const diffEnabled = activity.valueType.endsWith('botState') && !!previousBotState;
  const menuItems = [
    { label: 'Copy text', id: 'copy' },
    { label: 'Copy json', id: 'json' },
    { type: 'separator' },
    { label: 'Compare with previous', id: 'diff', enabled: diffEnabled },
  ] as MenuItemConstructorOptions[];

  const { DisplayContextMenu } = SharedConstants.Commands.Electron;
  const response: { id: string } = yield call(
    CommandServiceImpl.remoteCall.bind(CommandServiceImpl),
    DisplayContextMenu,
    menuItems
  );

  if (!response) {
    return; // canceled context menu
  }
  switch (response.id) {
    case 'copy':
      return Electron.clipboard.writeText(getTextFromActivity(activity));

    case 'json':
      return Electron.clipboard.writeText(JSON.stringify(activity, null, 2));

    default:
      yield* diffWithPreviousBotState(activity);
  }
}

export function* closeConversation(action: ChatAction<DocumentIdPayload>): Iterable<any> {
  const conversationId = yield select(getConversationIdFromDocumentId, action.payload.documentId);
  const { DeleteConversation } = SharedConstants.Commands.Emulator;
  yield call(CommandServiceImpl.remoteCall.bind(CommandServiceImpl), DeleteConversation, conversationId);
  yield put(closeDocument(action.payload.documentId));
}

export function* newChat(action: ChatAction<NewChatPayload>): Iterable<any> {
  // Each time a new chat is open, retrieve the speech token
  // if the endpoint is speech enabled and create a bind speech
  // pony fill factory. This is consumed by WebChat...
  const { documentId } = action.payload;
  yield put(webSpeechFactoryUpdated(documentId, null)); // remove the old factory
  const endpoint: IEndpointService = yield select(getEndpointServiceByDocumentId, documentId);
  if (!isSpeechEnabled(endpoint)) {
    return;
  }
  yield put(updatePendingSpeechTokenRetrieval(true));
  // If an existing factory is found, refresh the token
  const existingFactory: string = yield select(getWebSpeechFactoryForDocumentId, documentId);
  const { GetSpeechToken: command } = SharedConstants.Commands.Emulator;
  const token = yield call(
    [CommandServiceImpl, CommandServiceImpl.remoteCall],
    command,
    endpoint.id,
    !!existingFactory
  );
  if (token) {
    const factory = yield call(createCognitiveServicesBingSpeechPonyfillFactory, {
      authorizationToken: token,
    });
    yield put(webSpeechFactoryUpdated(documentId, factory)); // Provide the new factory to the store
  }
  yield put(updatePendingSpeechTokenRetrieval(false));
}

export function* diffWithPreviousBotState(currentBotState: Activity): Iterable<any> {
  const previousBotState: Activity = yield select(getPreviousBotState, currentBotState);

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
  botStateClone.valueType = 'https://www.botframework.com/schemas/diff';
  // values that were added
  rhs.forEach(path => {
    buildDiff('+', path, botStateClone.value, botStateClone.value);
  });
  // values that were removed
  lhs.forEach(path => {
    buildDiff('-', path, botStateClone.value, previousBotState.value);
  });
  const documentId = yield select(getCurrentDocumentId);
  yield put(setInspectorObjects(documentId, botStateClone));
}

function getTextFromActivity(activity: Activity): string {
  if (activity.type === ActivityTypes.Trace) {
    return 'text' in activity.value ? activity.value.text : activity.label;
  }
  return activity.text;
}

function buildDiff(prependWith: string, path: (string | number)[], target: any, source: any): void {
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

export function* chatSagas(): IterableIterator<ForkEffect> {
  yield takeEvery(ChatActions.showContextMenuForActivity, showContextMenuForActivity);
  yield takeEvery(ChatActions.closeConversation, closeConversation);
  yield takeEvery(ChatActions.newChat, newChat);
}
