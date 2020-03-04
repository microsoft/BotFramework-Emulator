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
import { Activity } from 'botframework-schema';

import {
  ChatAction,
  ChatActions,
  PendingSpeechTokenRetrievalPayload,
  WebChatStorePayload,
  WebSpeechFactoryPayload,
  UpdateSpeechAdaptersPayload,
  ActivityFromWebChatPayload,
  RestartConversationStatus,
  RestartConversationStatusPayload,
  RestartConversationOptions,
  SetRestartConversationOptionPayload,
} from '../actions/chatActions';
import { EditorAction, EditorActions } from '../actions/editorActions';

import { Document, DocumentUI } from './editor';

export interface ChatState {
  changeKey?: number;
  chats?: { [chatId: string]: ChatDocument };
  webSpeechFactories?: { [documentId: string]: () => any };
  webChatStores: { [documentId: string]: any };
  transcripts?: string[];
  restartStatus: { [chatId: string]: RestartConversationStatus };
}

export interface IncomingActivityRecord {
  id: string;
  replyToId?: string;
}

export interface ChatReplayData {
  incomingActivities: IncomingActivityRecord[];
  postActivitiesSlots: number[];
}

export interface ChatDocument<I = any> extends Document {
  endpointId: string;
  endpointUrl: string;
  highlightedObjects: Activity[];
  inspectorObjects: I[];
  log: ChatLog;
  pendingSpeechTokenRetrieval: boolean;
  speechKey: string;
  speechRegion: string;
  ui: DocumentUI;
  replayData: ChatReplayData;
  isDisabled: boolean;
  restartConversationOption: RestartConversationOptions;
}

export interface ChatLog {
  entries: LogEntry[];
}

const DEFAULT_STATE: ChatState = {
  changeKey: 0,
  chats: {},
  transcripts: [],
  webSpeechFactories: {},
  webChatStores: {},
  restartStatus: {},
};

export function chat(state: ChatState = DEFAULT_STATE, action: ChatAction | EditorAction): ChatState {
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
          [payload.documentId]: { ...payload, replayData: {}, isDisabled: false },
        },
      };
      break;
    }

    case ChatActions.webSpeechFactoryUpdated:
      {
        const { documentId, factory } = action.payload as WebSpeechFactoryPayload;
        const { webSpeechFactories } = state;
        state = {
          ...state,
          webSpeechFactories: { ...webSpeechFactories, [documentId]: factory },
        };
      }
      break;

    case ChatActions.webChatStoreUpdated:
      {
        const { documentId, store } = action.payload as WebChatStorePayload;
        const { webChatStores } = state;
        state = {
          ...state,
          webChatStores: { ...webChatStores, [documentId]: store },
        };
      }
      break;

    case ChatActions.updatePendingSpeechTokenRetrieval:
      {
        const { documentId, pending } = action.payload as PendingSpeechTokenRetrievalPayload;
        state = {
          ...state,
          chats: {
            ...state.chats,
            [documentId]: {
              ...state.chats[documentId],
              pendingSpeechTokenRetrieval: pending,
            },
          },
        };
      }
      break;

    case ChatActions.closeDocument: {
      const { documentId } = action.payload;
      // can't use the JSON.parse(JSON.stringify())
      // trick with chats because Subscribers are circular
      if (documentId in state.chats) {
        const copy = { ...state };
        copy.changeKey += 1;
        delete copy.chats[documentId];
        delete copy.restartStatus[documentId];
        state = { ...copy };
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

    case ChatActions.setHighlightedObjects:
      {
        const { payload } = action;
        let document = state.chats[payload.documentId];
        if (document) {
          document = {
            ...document,
            highlightedObjects: payload.objs,
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
      }
      break;

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

    case ChatActions.IncomingActivityFromWc: {
      const { documentId, activity } = action.payload as ActivityFromWebChatPayload;
      const replayData: ChatReplayData = state.chats[documentId].replayData;
      let incomingActivities: IncomingActivityRecord[] = [];
      if (replayData.incomingActivities) {
        incomingActivities = [...replayData.incomingActivities];
      }
      incomingActivities.push({
        id: activity.id,
        replyToId: activity.replyToId,
      });
      state = {
        ...state,
        chats: {
          ...state.chats,
          [documentId]: {
            ...state.chats[documentId],
            replayData: {
              ...state.chats[documentId].replayData,
              incomingActivities,
            },
          },
        },
      };
      break;
    }

    case ChatActions.PostActivityEventWc: {
      const { documentId } = action.payload as ActivityFromWebChatPayload;
      let postActivitiesSlots: number[] = [];
      if (state.chats[documentId].replayData.postActivitiesSlots) {
        postActivitiesSlots = [...state.chats[documentId].replayData.postActivitiesSlots];
      }
      const slot: number = state.chats[documentId].replayData.incomingActivities
        ? state.chats[documentId].replayData.incomingActivities.length
        : 0;
      postActivitiesSlots.push(slot);
      state = {
        ...state,
        chats: {
          ...state.chats,
          [documentId]: {
            ...state.chats[documentId],
            replayData: {
              ...state.chats[documentId].replayData,
              postActivitiesSlots,
            },
          },
        },
      };
      break;
    }

    case ChatActions.SetRestartConversationStatus: {
      const { documentId, status } = action.payload as RestartConversationStatusPayload;
      state = {
        ...state,
        restartStatus: {
          ...state.restartStatus,
          [documentId]: status,
        },
      };
      break;
    }

    case EditorActions.closeAll: {
      // HACK. Need a better system.
      return DEFAULT_STATE;
    }

    case ChatActions.SetRestartConversationOption: {
      const { documentId, option } = action.payload as SetRestartConversationOptionPayload;
      state = {
        ...state,
        chats: {
          ...state.chats,
          [documentId]: {
            ...state.chats[documentId],
            restartConversationOption: option,
          },
        },
      };
      break;
    }

    case ChatActions.updateSpeechAdapters: {
      const { payload } = action as ChatAction<UpdateSpeechAdaptersPayload>;
      const { directLine, documentId, webSpeechPonyfillFactory } = payload;
      let document = state.chats[documentId];
      if (document) {
        document = {
          ...document,
          directLine,
        };
        state = {
          ...state,
          chats: {
            ...state.chats,
            [payload.documentId]: {
              ...document,
            },
          },
          webSpeechFactories: { ...state.webSpeechFactories, [documentId]: webSpeechPonyfillFactory },
        };
      }
      break;
    }

    default:
      break;
  }

  return state;
}

function setTranscriptsState(transcripts: string[], state: ChatState): ChatState {
  const newState = { ...state };

  newState.transcripts = transcripts;
  newState.changeKey = state.changeKey + 1;
  return newState;
}
