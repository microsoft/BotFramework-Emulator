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

import * as ChatActions from '../action/chatActions';
import * as EditorActions from '../action/editorActions';


const DEFAULT_STATE = {
  liveChatChangeKey: 0,
  liveChats: {},
  transcriptChangeKey: 0,
  transcripts: []
}

export default function chat(state = DEFAULT_STATE, action) {
  const { payload } = action;

  switch (action.type) {
    case ChatActions.ADD_TRANSCRIPT: {
      const transcripts = [...state.transcripts];
      transcripts.push(payload);
      state = setTranscriptsState(transcripts, state);
    }
      break;

    case ChatActions.REMOVE_TRANSCRIPT: {
      const transcriptsCopy = [...state.transcripts];
      const transcripts = transcriptsCopy.filter(xs => xs !== payload);
      state = setTranscriptsState(transcripts, state);
    }
      break;

    case ChatActions.NEW_LIVECHAT_DOCUMENT: {
      state = {
        ...state,
        liveChatChangeKey: state.liveChatChangeKey + 1,
        liveChats: {
          ...state.liveChats,
          [payload.documentId]: { ...payload }
        }
      }
    }
      break;

    case ChatActions.CLOSE_LIVECHAT_DOCUMENT: {
      const copy = { ...state };
      copy.liveChatChangeKey += 1;
      delete copy.liveChats[payload.documentId];
      state = { ...copy };
    }
      break;

    case ChatActions.NEW_LIVECHAT_CONVERSATION: {
      let document = state.liveChats[payload.documentId];
      if (document) {
        document = {
          ...document,
          conversationId: payload.conversationId
        }
        state = {
          ...state,
          liveChats: {
            ...state.liveChats,
            [payload.documentId]: {
              ...document
            }
          }
        }
      }
    }
      break;

    case ChatActions.LOG_APPEND: {
      let document = state.liveChats[payload.documentId];
      if (document) {
        document = {
          ...document,
          log: {
            ...document.log,
            entries: [
              ...document.log.entries,
              payload.entry
            ]
          }
        }
        state = {
          ...state,
          liveChats: {
            ...state.liveChats,
            [payload.documentId]: {
              ...document
            }
          }
        }
      }
    }
      break;

    case ChatActions.LOG_CLEAR: {
      let document = state.liveChats[payload.documentId];
      if (document) {
        document = {
          ...document,
          log: {
            entries: []
          }
        }
        state = {
          ...state,
          liveChats: {
            ...state.liveChats,
            [payload.documentId]: {
              ...document
            }
          }
        }
      }
    }
      break;

    case ChatActions.INSPECTOR_OBJECTS_SET: {
      let document = state.liveChats[payload.documentId];
      if (document) {
        document = {
          ...document,
          inspectorObjects: payload.objs
        }
      }
      state = {
        ...state,
        liveChats: {
          ...state.liveChats,
          [payload.documentId]: {
            ...document
          }
        }
      }
    }
      break;

    case EditorActions.CLOSE_ALL: {
      // HACK. Need a better system.
      return DEFAULT_STATE;
    }

    default: break;
  }

  return state;
}

function setTranscriptsState(transcripts, state) {
  let newState = Object.assign({}, state);

  newState.transcripts = transcripts;
  return newState;
}
