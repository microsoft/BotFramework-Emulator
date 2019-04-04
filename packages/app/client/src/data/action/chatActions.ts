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
  addTranscript = 'CHAT/TRANSCRIPT/ADD',
  clearTranscripts = 'CHAT/TRANSCRIPT/CLEAR',
  removeTranscript = 'CHAT/TRANSCRIPT/REMOVE',
  updateChat = 'CHAT/DOCUMENT/UPDATE',
  showContextMenuForActivity = 'CHAT/CONTEXT_MENU/SHOW',
}

export interface ActiveInspectorChangedPayload {
  inspectorWebView: HTMLWebViewElement;
}

export interface NewChatAction {
  type: ChatActions.newChat;
  payload: {
    [propName: string]: any;
    documentId: string;
    mode: ChatMode;
  };
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
}

export interface SetInspectorObjectsPayload {
  documentId: string;
  objs: any;
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

type ChatMode = 'livechat' | 'transcript';

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

export function newDocument(documentId: string, mode: ChatMode, additionalData?: object): NewChatAction {
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

export function clearLog(documentId: string): ChatAction<ClearLogPayload> {
  return {
    type: ChatActions.clearLog,
    payload: {
      documentId,
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
