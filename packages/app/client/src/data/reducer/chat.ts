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

import { ChatAction, ChatActions } from '../action/chatActions';
import { EditorAction, EditorActions } from '../action/editorActions';

export interface ChatState {
  changeKey?: number;
  // TODO: keys should map to an Chat
  chats?: { [chatId: string]: any };
  transcripts?: string[];
}

const DEFAULT_STATE: ChatState = {
  changeKey: 0,
  chats: {},
  transcripts: [],
};

export function chat(
  state: ChatState = DEFAULT_STATE,
  action: ChatAction | EditorAction
): ChatState {
  switch (action.type) {
    case ChatActions.addTranscript: {
      const { payload } = action;
      const transcriptsCopy = [...state.transcripts];
      const transcripts = transcriptsCopy.filter(xs => xs !== payload.filename);
      transcripts.push(payload.filename);
      state = setTranscriptsState(transcripts, state);
      break;
    }

    case ChatActions.clearTranscripts: {
      state = setTranscriptsState([], state);
      break;
    }

    case ChatActions.removeTranscript: {
      const { payload } = action;
      const transcriptsCopy = [...state.transcripts];
      const transcripts = transcriptsCopy.filter(xs => xs !== payload.filename);
      state = setTranscriptsState(transcripts, state);
      break;
    }

    case ChatActions.newChat: {
      const { payload } = action;
      state = {
        ...state,
        changeKey: state.changeKey + 1,
        chats: {
          ...state.chats,
          [payload.documentId]: { ...payload },
        },
      };
      break;
    }

    case ChatActions.closeChat: {
      const { payload } = action;
      // can't use the JSON.parse(JSON.stringify())
      // trick with chats because Subscribers are circular
      if (payload.documentId in state.chats) {
        const copy = { ...state };
        copy.changeKey += 1;
        delete copy.chats[payload.documentId];
        state = { ...copy };
      }
      break;
    }

    case ChatActions.newConversation: {
      const { payload } = action;
      let document = state.chats[payload.documentId];
      if (document) {
        document = {
          ...document,
          ...payload.options,
        };
        state = {
          ...state,
          chats: {
            ...state.chats,
            [payload.documentId]: {
              ...document,
            },
          },
        };
      }
      break;
    }

    case ChatActions.appendLog: {
      const { payload } = action;
      let document = state.chats[payload.documentId];
      if (document) {
        document = {
          ...document,
          log: {
            ...document.log,
            entries: [...document.log.entries, payload.entry],
          },
        };
        state = {
          ...state,
          chats: {
            ...state.chats,
            [payload.documentId]: {
              ...document,
            },
          },
        };
      }
      break;
    }

    case ChatActions.clearLog: {
      const { payload } = action;
      let document = state.chats[payload.documentId];
      if (document) {
        document = {
          ...document,
          log: {
            entries: [],
          },
        };
        state = {
          ...state,
          chats: {
            ...state.chats,
            [payload.documentId]: {
              ...document,
            },
          },
        };
      }
      break;
    }

    case ChatActions.setInspectorObjects: {
      const { payload } = action;
      let document = state.chats[payload.documentId];
      if (document) {
        document = {
          ...document,
          inspectorObjects: payload.objs,
        };
      }
      state = {
        ...state,
        chats: {
          ...state.chats,
          [payload.documentId]: {
            ...document,
          },
        },
      };
      break;
    }

    case ChatActions.updateChat: {
      const { payload } = action;
      const { documentId = '', updatedValues = {} } = payload;
      let document = state.chats[documentId];
      if (document) {
        document = {
          ...document,
          ...updatedValues,
        };
        state = {
          ...state,
          chats: {
            ...state.chats,
            [payload.documentId]: {
              ...document,
            },
          },
        };
      }
      break;
    }

    case EditorActions.closeAll: {
      // HACK. Need a better system.
      return DEFAULT_STATE;
    }

    default:
      break;
  }

  return state;
}

function setTranscriptsState(
  transcripts: string[],
  state: ChatState
): ChatState {
  const newState = { ...state };

  newState.transcripts = transcripts;
  newState.changeKey = state.changeKey + 1;
  return newState;
}
