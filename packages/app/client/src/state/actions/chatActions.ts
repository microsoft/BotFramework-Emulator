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

import { LogEntry } from '@bfemulator/sdk-shared';
import { Action } from 'redux';
import { Activity } from 'botframework-schema';
import { EmulatorMode } from '@bfemulator/sdk-shared';

import { ChatDocument } from '../reducers/chat';

export enum ChatActions {
  activeInspectorChanged = 'CHAT/INSPECTOR/CHANGED',
  newChat = 'CHAT/DOCUMENT/NEW',
  openChat = 'CHAT/DOCUMENT/OPEN',
  closeConversation = 'CHAT/CLOSE',
  closeDocument = 'CHAT/DOCUMENT/CLOSE',
  newConversation = 'CHAT/CONVERSATION/NEW',
  appendLog = 'CHAT/LOG/APPEND',
  clearLog = 'CHAT/LOG/CLEAR',
  setInspectorObjects = 'CHAT/INSPECTOR/OBJECTS/SET',
  setHighlightedObjects = 'CHAT/HIGHLIGHTED/OBJECTS/SET',
  addTranscript = 'CHAT/TRANSCRIPT/ADD',
  clearTranscripts = 'CHAT/TRANSCRIPT/CLEAR',
  removeTranscript = 'CHAT/TRANSCRIPT/REMOVE',
  updateChat = 'CHAT/DOCUMENT/UPDATE',
  showContextMenuForActivity = 'CHAT/CONTEXT_MENU/SHOW',
  webSpeechFactoryUpdated = 'CHAT/SPEECH/TOKEN/RETRIEVED',
  webChatStoreUpdated = 'CHAT/STORE/UPDATED',
  updatePendingSpeechTokenRetrieval = 'CHAT/SPEECH/TOKEN/PENDING/UPDATE',
}

export interface ActiveInspectorChangedPayload {
  inspectorWebView: HTMLWebViewElement;
}

export interface WebSpeechFactoryPayload {
  documentId: string;
  factory: () => any;
}

export interface WebChatStorePayload {
  documentId: string;
  store: any;
}

export interface PendingSpeechTokenRetrievalPayload {
  pending: boolean;
}

export interface DocumentIdPayload {
  documentId: string;
}

export interface NewConversationPayload {
  documentId: string;
  options: any;
}

export interface AppendLogPayload {
  documentId: string;
  entry: LogEntry;
}

export interface ClearLogPayload {
  documentId: string;
  resolver?: Function;
}

export interface SetInspectorObjectsPayload {
  documentId: string;
  objs: any;
}

export interface SetHighlightedObjectsPayload {
  documentId: string;
  objs: Activity[];
}

export interface AddTranscriptPayload extends RemoveTranscriptPayload {}

export interface RemoveTranscriptPayload {
  filename: string;
}

export interface UpdateChatPayload {
  documentId: string;
  updatedValues: any;
}

export interface ChatAction<T = any> extends Action {
  payload: T;
}

export function inspectorChanged(inspectorWebView: HTMLWebViewElement): ChatAction<ActiveInspectorChangedPayload> {
  return {
    type: ChatActions.activeInspectorChanged,
    payload: { inspectorWebView },
  };
}

export function addTranscript(filename: string): ChatAction<AddTranscriptPayload> {
  return {
    type: ChatActions.addTranscript,
    payload: {
      filename,
    },
  };
}

export function clearTranscripts(): ChatAction<{}> {
  return {
    type: ChatActions.clearTranscripts,
    payload: {},
  };
}

export function removeTranscript(filename: string): ChatAction<RemoveTranscriptPayload> {
  return {
    type: ChatActions.removeTranscript,
    payload: {
      filename,
    },
  };
}

export function webSpeechFactoryUpdated(documentId: string, factory: () => any): ChatAction<WebSpeechFactoryPayload> {
  return {
    type: ChatActions.webSpeechFactoryUpdated,
    payload: { documentId, factory },
  };
}

export function webChatStoreUpdated(documentId: string, store: any): ChatAction<WebChatStorePayload> {
  return {
    type: ChatActions.webChatStoreUpdated,
    payload: { documentId, store },
  };
}

export function updatePendingSpeechTokenRetrieval(pending: boolean): ChatAction<PendingSpeechTokenRetrievalPayload> {
  return {
    type: ChatActions.updatePendingSpeechTokenRetrieval,
    payload: { pending },
  };
}

export function newChat(
  documentId: string,
  mode: EmulatorMode,
  additionalData?: Partial<ChatDocument>
): ChatAction<Partial<ChatDocument & ClearLogPayload>> {
  return {
    type: ChatActions.newChat,
    payload: {
      mode,
      documentId,
      conversationId: null,
      directLine: null,
      log: {
        entries: [],
      },
      highlightedObjects: [],
      inspectorObjects: [],
      ui: {
        horizontalSplitter: [
          {
            absolute: null,
            percentage: 50,
          },
          {
            absolute: null,
            percentage: 50,
          },
        ],
        verticalSplitter: [
          {
            absolute: null,
            percentage: 50,
          },
          {
            absolute: null,
            percentage: 50,
          },
        ],
      },
      userId: '',
      ...additionalData,
    },
  };
}

export function closeDocument(documentId: string): ChatAction<DocumentIdPayload> {
  return {
    type: ChatActions.closeDocument,
    payload: {
      documentId,
    },
  };
}

export function closeConversation(documentId: string): ChatAction<DocumentIdPayload> {
  return {
    type: ChatActions.closeConversation,
    payload: {
      documentId,
    },
  };
}

export function newConversation(documentId: string, options: any): ChatAction<NewConversationPayload> {
  return {
    type: ChatActions.newConversation,
    payload: {
      documentId,
      options,
    },
  };
}

export function appendToLog(documentId: string, entry: LogEntry): ChatAction<AppendLogPayload> {
  return {
    type: ChatActions.appendLog,
    payload: {
      documentId,
      entry,
    },
  };
}

export function clearLog(documentId: string, resolver?: Function): ChatAction<ClearLogPayload> {
  return {
    type: ChatActions.clearLog,
    payload: {
      documentId,
      resolver,
    },
  };
}

export function setInspectorObjects(documentId: string, objs: any): ChatAction<SetInspectorObjectsPayload> {
  objs = Array.isArray(objs) ? objs : [objs];
  return {
    type: ChatActions.setInspectorObjects,
    payload: {
      documentId,
      objs,
    },
  };
}

export function setHighlightedObjects(
  documentId: string,
  objs: Activity | Activity[]
): ChatAction<SetHighlightedObjectsPayload> {
  objs = Array.isArray(objs) ? objs : [objs];
  return {
    type: ChatActions.setHighlightedObjects,
    payload: {
      documentId,
      objs,
    },
  };
}

export function updateChat(documentId: string, updatedValues: any): ChatAction<UpdateChatPayload> {
  return {
    type: ChatActions.updateChat,
    payload: {
      documentId,
      updatedValues,
    },
  };
}

export function showContextMenuForActivity(activity: Partial<Activity>): ChatAction<Partial<Activity>> {
  return {
    type: ChatActions.showContextMenuForActivity,
    payload: activity,
  };
}
