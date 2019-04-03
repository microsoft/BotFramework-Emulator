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

import { ChatAction, ChatActions, closeDocument, DocumentIdPayload, setInspectorObjects } from '../action/chatActions';
import { CommandServiceImpl } from '../../platform/commands/commandServiceImpl';
import { RootState } from '../store';

import { call, ForkEffect, put, select, takeEvery } from 'redux-saga/effects';

const getConversationIdFromDocumentId = (state: RootState, documentId: string) => {
  return state.chat.chats[documentId].conversationId;
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
  return targetLogEntry.payload.obj as Activity;
};

export function* showContextMenuForActivity(action: ChatAction<Activity>): Iterable<any> {
  const { payload: activity } = action;
  const menuItems = [
    { label: 'Copy text', id: 'copy' },
    { label: 'Copy json', id: 'json' },
    { type: 'separator' },
    { label: 'Compare with previous', id: 'diff', enabled: activity.valueType.endsWith('botState') },
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

export function* diffWithPreviousBotState(currentBotState: Activity): Iterable<any> {
  const previousBotState: Activity = yield select(getPreviousBotState, currentBotState);
  // Remove unchanged paths from the path maps
  const previousStatePaths = createPathMap(previousBotState.value);
  const currentStatePaths = createPathMap(currentBotState.value);
  Object.keys(currentStatePaths).forEach(path => {
    if (path in previousStatePaths && previousStatePaths[path] === currentStatePaths[path]) {
      delete currentStatePaths[path];
      delete previousStatePaths[path];
    }
  });

  // Clone the bot state and update the keys to show changes
  const diff: Activity = JSON.parse(JSON.stringify(currentBotState));
  diff.valueType = 'https://www.botframework.com/schemas/diff';
  // values that were added
  Object.keys(currentStatePaths).forEach(path => {
    buildDiff('+', path, diff.value, diff.value);
  });
  // values that were removed
  Object.keys(previousStatePaths).forEach(path => {
    buildDiff('-', path, diff.value, previousBotState.value);
  });
  const documentId = yield select(getCurrentDocumentId);
  yield put(setInspectorObjects(documentId, diff));
}

function getTextFromActivity(activity: Activity): string {
  if (activity.type === ActivityTypes.Trace) {
    return 'text' in activity.value ? activity.value.text : activity.label;
  }
  return activity.text;
}

function createPathMap(obj, paths = {}, parent: string = '') {
  const keys = Object.keys(obj);
  if (!keys.length && parent) {
    paths[parent] = null;
  }
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const path = parent ? parent + '.' + key : key;
    if (obj[key] !== null && typeof obj[key] === 'object') {
      createPathMap(obj[key], paths, path);
    } else {
      paths[path] = obj[key];
    }
  }
  return paths;
}

function buildDiff(prependWith: string, path: string, target: any, source: any): void {
  const parts = path.split('.');
  let key;
  for (let i = 0; i < parts.length; i++) {
    key = parts[i];
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
}
