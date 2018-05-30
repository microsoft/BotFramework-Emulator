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

import { LogEntry } from '@bfemulator/app-shared';
import { createStore as createWebChatStore } from '@bfemulator/custom-botframework-webchat';

export enum ChatActions {
  newChat = 'CHAT/DOCUMENT/NEW',
  openChat = 'CHAT/DOCUMENT/OPEN',
  closeChat = 'CHAT/DOCUMENT/CLOSE',
  pingChat = 'CHAT/DOCUMENT/PING',
  newConversation = 'CHAT/CONVERSATION/NEW',
  appendLog = 'CHAT/LOG/APPEND',
  clearLog = 'CHAT/LOG/CLEAR',
  setInspectorObjects = 'CHAT/INSPECTOR/OBJECTS/SET',
  addTranscript = 'CHAT/TRANSCRIPT/ADD',
  clearTranscripts = 'CHAT/TRANSCRIPT/CLEAR',
  removeTranscript = 'CHAT/TRANSCRIPT/REMOVE'
}

export interface NewChatAction {
  type: ChatActions.newChat;
  payload: {
    [propName: string]: any,
    documentId: string,
    mode: ChatMode
  };
}

export interface OpenChatAction {
  type: ChatActions.openChat;
  payload: {};
}

export interface CloseChatAction {
  type: ChatActions.closeChat;
  payload: {
    documentId: string
  };
}

export interface PingChatAction {
  type: ChatActions.pingChat;
  payload: {
    documentId: string
  };
}

export interface NewConversationAction {
  type: ChatActions.newConversation;
  payload: {
    documentId: string,
    options: any
  };
}

export interface AppendLogAction {
  type: ChatActions.appendLog;
  payload: {
    documentId: string,
    entry: LogEntry
  };
}

export interface ClearLogAction {
  type: ChatActions.clearLog;
  payload: {
    documentId: string
  };
}

export interface SetInspectorObjectsAction {
  type: ChatActions.setInspectorObjects;
  payload: {
    documentId: string,
    objs: any
  };
}

export interface AddTranscriptAction {
  type: ChatActions.addTranscript;
  payload: {
    filename: string
  };
}

export interface ClearTranscriptsAction {
  type: ChatActions.clearTranscripts;
  payload: {};
}

export interface RemoveTranscriptAction {
  type: ChatActions.removeTranscript;
  payload: {
    filename: string
  };
}

export type ChatAction =
  NewChatAction |
  OpenChatAction |
  CloseChatAction |
  PingChatAction |
  NewConversationAction |
  AppendLogAction |
  ClearLogAction |
  SetInspectorObjectsAction |
  AddTranscriptAction |
  ClearTranscriptsAction |
  RemoveTranscriptAction;

type ChatMode = 'livechat' | 'transcript';

export function pingDocument(documentId: string): PingChatAction {
  return {
    type: ChatActions.pingChat,
    payload: {
      documentId
    }
  };
}

export function addTranscript(filename: string): AddTranscriptAction {
  return {
    type: ChatActions.addTranscript,
    payload: {
      filename
    }
  };
}

export function clearTranscripts(): ClearTranscriptsAction {
  return {
    type: ChatActions.clearTranscripts,
    payload: {}
  };
}

export function removeTranscript(filename: string): RemoveTranscriptAction {
  return {
    type: ChatActions.removeTranscript,
    payload: {
      filename
    }
  };
}

export function newDocument(documentId: string, mode: ChatMode, additionalData?: object): NewChatAction {
  return {
    type: ChatActions.newChat,
    payload: {
      pingId: 0,
      mode,
      documentId,
      conversationId: null,
      webChatStore: createWebChatStore(),
      directLine: null,
      log: {
        entries: []
      },
      inspectorObjects: [],
      ui: {
        horizontalSplitter: [
          {
            absolute: null,
            percentage: 50
          },
          {
            absolute: null,
            percentage: 50
          }
        ],
        verticalSplitter: [
          {
            absolute: null,
            percentage: 50
          },
          {
            absolute: null,
            percentage: 50
          }
        ],
      },
      ...additionalData
    }
  };
}

export function closeDocument(documentId: string): CloseChatAction {
  return {
    type: ChatActions.closeChat,
    payload: {
      documentId,
    }
  };
}

export function newConversation(documentId: string, options: any): NewConversationAction {
  return {
    type: ChatActions.newConversation,
    payload: {
      documentId,
      options
    }
  };
}

export function appendToLog(documentId: string, entry: LogEntry): AppendLogAction {
  return {
    type: ChatActions.appendLog,
    payload: {
      documentId,
      entry
    }
  };
}

export function clearLog(documentId: string): ClearLogAction {
  return {
    type: ChatActions.clearLog,
    payload: {
      documentId,
    }
  };
}

export function setInspectorObjects(documentId: string, objs: any): SetInspectorObjectsAction {
  objs = Array.isArray(objs) ? objs : [objs];
  return {
    type: ChatActions.setInspectorObjects,
    payload: {
      documentId,
      objs
    }
  };
}
