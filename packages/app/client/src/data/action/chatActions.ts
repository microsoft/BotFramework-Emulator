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

export const NEW_CHAT_DOCUMENT = 'CHAT/DOCUMENT/NEW';
export const OPEN_CHAT_DOCUMENT = 'CHAT/DOCUMENT/OPEN';
export const CLOSE_CHAT_DOCUMENT = 'CHAT/DOCUMENT/CLOSE';
export const PING_CHAT_DOCUMENT = 'CHAT/DOCUMENT/PING';
export const NEW_CONVERSATION = 'CHAT/CONVERSATION/NEW';
export const LOG_APPEND = 'CHAT/LOG/APPEND';
export const LOG_CLEAR = 'CHAT/LOG/CLEAR';
export const SET_INSPECTOR_OBJECTS = 'CHAT/INSPECTOR/OBJECTS/SET';
export const ADD_TRANSCRIPT = 'CHAT/TRANSCRIPT/ADD';
export const CLEAR_TRANSCRIPTS = 'CHAT/TRANSCRIPT/CLEAR';
export const REMOVE_TRANSCRIPT = 'CHAT/TRANSCRIPT/REMOVE';

type ChatMode = 'livechat' | 'transcript';

export type ChatAction = {
  type: 'CHAT/DOCUMENT/NEW',
  payload: {
    [propName: string]: any,
    documentId: string,
    mode: ChatMode
  }
} | {
  type: 'CHAT/DOCUMENT/OPEN',
  payload: {}
} | {
  type: 'CHAT/DOCUMENT/CLOSE',
  payload: {
    documentId: string
  }
} | {
  type: 'CHAT/CONVERSATION/NEW',
  payload: {
    documentId: string,
    options: any
  }
} | {
  type: 'CHAT/LOG/APPEND',
  payload: {
    documentId: string,
    entry: LogEntry
  }
} | {
  type: 'CHAT/LOG/CLEAR',
  payload: {
    documentId: string
  }
} | {
  type: 'CHAT/INSPECTOR/OBJECTS/SET',
  payload: {
    documentId: string,
    objs: any
  }
} | {
  type: 'CHAT/TRANSCRIPT/ADD',
  payload: {
    filename: string
  }
} | {
  type: 'CHAT/TRANSCRIPT/CLEAR',
  payload: {}
} | {
  type: 'CHAT/TRANSCRIPT/REMOVE',
  payload: {
    filename: string
  }
} | {
  type: 'CHAT/DOCUMENT/PING',
  payload: {
    documentId: string
  }
};

export function pingDocument(documentId: string): ChatAction {
  return {
    type: PING_CHAT_DOCUMENT,
    payload: {
      documentId
    }
  };
}

export function addTranscript(filename: string): ChatAction {
  return {
    type: ADD_TRANSCRIPT,
    payload: {
      filename
    }
  };
}

export function clearTranscripts(): ChatAction {
  return {
    type: CLEAR_TRANSCRIPTS,
    payload: {}
  };
}

export function removeTranscript(filename: string): ChatAction {
  return {
    type: REMOVE_TRANSCRIPT,
    payload: {
      filename
    }
  };
}

export function newDocument(documentId: string, mode: ChatMode, additionalData?: object): ChatAction {
  return {
    type: NEW_CHAT_DOCUMENT,
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

export function closeDocument(documentId: string): ChatAction {
  return {
    type: CLOSE_CHAT_DOCUMENT,
    payload: {
      documentId,
    }
  };
}

export function newConversation(documentId: string, options: any): ChatAction {
  return {
    type: NEW_CONVERSATION,
    payload: {
      documentId,
      options
    }
  };
}

export function appendToLog(documentId: string, entry: LogEntry): ChatAction {
  return {
    type: LOG_APPEND,
    payload: {
      documentId,
      entry
    }
  };
}

export function clearLog(documentId: string): ChatAction {
  return {
    type: LOG_CLEAR,
    payload: {
      documentId,
    }
  };
}

export function setInspectorObjects(documentId: string, objs: any): ChatAction {
  objs = Array.isArray(objs) ? objs : [objs];
  return {
    type: SET_INSPECTOR_OBJECTS,
    payload: {
      documentId,
      objs
    }
  };
}
