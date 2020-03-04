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

import { LogEntry, LogItemType } from '@bfemulator/sdk-shared';
import { Activity } from 'botframework-schema';

import {
  addTranscript,
  appendToLog,
  ChatAction,
  clearLog,
  clearTranscripts,
  closeDocument,
  newChat,
  removeTranscript,
  setInspectorObjects,
  updateChat,
  updateSpeechAdapters,
  incomingActivity,
  RestartConversationStatus,
  postActivity,
  setRestartConversationStatus,
  setRestartConversationOption,
  RestartConversationOptions,
} from '../actions/chatActions';
import { closeNonGlobalTabs } from '../actions/editorActions';

import { chat, ChatState, IncomingActivityRecord } from './chat';

describe('Chat reducer tests', () => {
  const testChatId = 'testChat1';
  const DEFAULT_STATE: ChatState = {
    changeKey: 0,
    chats: {
      [testChatId]: {
        log: {
          entries: [],
        },
      },
    },
    transcripts: [],
    restartStatus: {
      [testChatId]: RestartConversationStatus.Started,
    },
  } as any;

  it('should return unaltered state for non-matching action type', () => {
    const emptyAction: ChatAction = { type: null, payload: null };
    const startingState = { ...DEFAULT_STATE };
    const endingState = chat(DEFAULT_STATE, emptyAction);
    expect(endingState).toEqual(startingState);
  });

  it('should add a transcript', () => {
    const action = addTranscript('testTranscript');
    const state = chat(DEFAULT_STATE, action);
    expect(state.transcripts.length).toBe(1);
    expect(state.transcripts[0]).toBe('testTranscript');
  });

  it('should remove a transcript', () => {
    let state = chat(DEFAULT_STATE, addTranscript('xs1'));
    state = chat(state, addTranscript('xs2'));
    expect(state.transcripts.length).toBe(2);
    const action = removeTranscript('xs1');
    state = chat(state, action);
    expect(state.transcripts.length).toBe(1);
    expect(state.transcripts).not.toContain('xs1');
  });

  it('should clear all transcripts', () => {
    let state = chat(DEFAULT_STATE, addTranscript('xs1'));
    state = chat(state, addTranscript('xs2'));
    expect(state.transcripts.length).toBe(2);
    const action = clearTranscripts();
    state = chat(state, action);
    expect(state.transcripts.length).toBe(0);
  });

  it('should create a new chat', () => {
    const newChatName = 'newChat';
    const action = newChat(newChatName, 'livechat');
    const state = chat(DEFAULT_STATE, action);
    expect(state.changeKey).toBe(1);
    expect(state.chats[newChatName]).toBeTruthy();
  });

  it('should close a chat', () => {
    let transientState = chat(DEFAULT_STATE, newChat(testChatId, 'livechat'));
    transientState = chat(
      transientState,
      incomingActivity(
        {
          id: 'act-1',
        } as Activity,
        testChatId
      )
    );

    transientState = chat(transientState, setRestartConversationStatus(RestartConversationStatus.Started, testChatId));
    expect(transientState.restartStatus[testChatId]).not.toBeUndefined();
    expect(transientState.chats[testChatId].replayData.incomingActivities.length > 0).toBeTruthy();
    const action = closeDocument(testChatId);
    transientState = chat(DEFAULT_STATE, action);
    expect(transientState.chats[testChatId]).toBeFalsy();
    expect(transientState.restartStatus[testChatId]).toBeFalsy();
  });

  it('should append to the log', () => {
    const logEntry: LogEntry = {
      timestamp: 123,
      items: [
        {
          type: LogItemType.Text,
          payload: {
            level: 0,
            text: 'testing',
          },
        },
      ],
    };
    const action = appendToLog(testChatId, logEntry);
    const startingState = {
      ...DEFAULT_STATE,
      chats: {
        ...DEFAULT_STATE.chats,
        [testChatId]: {
          log: {
            entries: [],
          },
        },
      },
    };
    const endingState = chat(startingState, action);
    expect(endingState.chats[testChatId].log.entries[0]).toBeTruthy();
    expect(endingState.chats[testChatId].log.entries[0]).toEqual(logEntry);
  });

  it('should clear the log', () => {
    const logEntry: LogEntry = {
      timestamp: 1234,
      items: [
        {
          type: LogItemType.Text,
          payload: {
            level: 0,
            text: 'testing',
          },
        },
      ],
    };
    const startingState = {
      ...DEFAULT_STATE,
      chats: {
        ...DEFAULT_STATE.chats,
        [testChatId]: {
          log: {
            entries: [],
          },
        },
      },
    };

    let state = chat(startingState, appendToLog(testChatId, logEntry));
    expect(state.chats[testChatId].log.entries.length).toBeGreaterThan(0);
    const action = clearLog(testChatId);
    state = chat(state, action);
    expect(state.chats[testChatId].log.entries.length).toBe(0);
  });

  it('should set inspector objects', () => {
    const action = setInspectorObjects(testChatId, { testing: true });
    const startingState = {
      ...DEFAULT_STATE,
      chats: {
        ...DEFAULT_STATE.chats,
        [testChatId]: {},
      },
    };
    const endingState = chat(startingState, action);
    expect(endingState.chats[testChatId].inspectorObjects.length).toBeGreaterThan(0);
    expect(endingState.chats[testChatId].inspectorObjects[0]).toEqual({
      testing: true,
    });
  });

  it('should reset state on a "close all" editor action', () => {
    const tempChat = 'tempChat';
    const alteredState: ChatState = {
      changeKey: 999,
      chats: {
        [tempChat]: {
          testing: true,
        },
      },
      transcripts: ['xs1', 'xs2', 'xs3'],
    } as any;
    const action = closeNonGlobalTabs();
    const state = chat(alteredState, action);
    expect(state.changeKey).toBe(0);
    expect(state.transcripts.length).toBe(0);
    expect(state.chats[tempChat]).toBeFalsy();
  });

  it('should update a chat', () => {
    const startingState = {
      ...DEFAULT_STATE,
      chats: {
        ...DEFAULT_STATE.chats,
        chat1: {
          id: 'chat',
          userId: 'userId',
        },
      },
    };
    const action = updateChat('chat1', {
      id: 'updatedChatId',
      userId: 'updatedUserId',
    });
    const state = chat(startingState, action);
    expect(state.chats.chat1.id).toBe('updatedChatId');
    expect(state.chats.chat1.userId).toBe('updatedUserId');
  });

  it('should update the speech adapters for a chat', () => {
    const startingState = {
      ...DEFAULT_STATE,
      chats: {
        ...DEFAULT_STATE.chats,
        chat1: {
          directLine: undefined,
          documentId: 'chat1',
          userId: 'user1',
        },
      },
      webSpeechFactories: {
        chat1: undefined,
      },
    };
    const directLine: any = {};
    const webSpeechPonyfillFactory: any = {};
    const action = updateSpeechAdapters('chat1', directLine, webSpeechPonyfillFactory);
    const state = chat(startingState, action);

    expect(state.chats.chat1.directLine).toEqual(directLine);
    expect(state.webSpeechFactories.chat1).toEqual(webSpeechPonyfillFactory);
  });

  it('should add slots for post activity correctly', () => {
    const documentId = 'chatId-1';
    const startingState = {
      ...DEFAULT_STATE,
      chats: {
        ...DEFAULT_STATE.chats,
        'chatId-1': {
          directLine: undefined,
          documentId,
          userId: 'user1',
          replayData: {},
        },
      },
      webSpeechFactories: {
        chat1: undefined,
      },
    };
    const activities: Activity[] = [
      {
        id: 'activ-1',
        name: 'incoming-1',
        replyToId: 'reply-to-1',
      } as Activity,
      {
        id: 'activ-2',
        name: 'incoming-2',
        replyToId: 'reply-to-2',
      } as Activity,
      {
        id: 'activ-3',
        name: 'post-activity-1',
      } as Activity,
      {
        id: 'activ-4',
        name: 'incoming-3',
        replyToId: 'post-activity-1',
      } as Activity,
      {
        id: 'activ-5',
        name: 'post-activity-2',
      } as Activity,
    ];

    let transientState: ChatState = chat(startingState, incomingActivity(activities[0], documentId));
    transientState = chat(transientState, incomingActivity(activities[1], documentId));
    transientState = chat(transientState, postActivity(activities[2], documentId));
    expect(transientState.chats['chatId-1'].replayData.postActivitiesSlots.length).toBe(1);
    expect(transientState.chats['chatId-1'].replayData.postActivitiesSlots[0]).toBe(2);

    transientState = chat(transientState, incomingActivity(activities[3], documentId));
    const finalState = chat(transientState, postActivity(activities[4], documentId));
    expect(finalState.chats['chatId-1'].replayData.postActivitiesSlots[1]).toBe(3);
  });

  it('should add an incoming activity inside the chatReplay object', () => {
    const documentId = 'chatId-1';
    const startingState = {
      ...DEFAULT_STATE,
      chats: {
        ...DEFAULT_STATE.chats,
        'chatId-1': {
          directLine: undefined,
          documentId,
          userId: 'user1',
          replayData: {},
        },
      },
      webSpeechFactories: {
        chat1: undefined,
      },
    };

    const expectedActivity = {
      id: 'activ-1',
      name: 'test-activity-1',
      replyToId: 'reply-to-1',
    } as Activity;

    let action = incomingActivity(expectedActivity, documentId);

    const transientState = chat(startingState, action);
    let incomingActivities = transientState.chats['chatId-1'].replayData.incomingActivities;
    let lastActivity: IncomingActivityRecord = incomingActivities[incomingActivities.length - 1];
    expect(lastActivity.id).toBe(expectedActivity.id);
    expect(lastActivity.replyToId).toBe(expectedActivity.replyToId);

    const anotherExpectedActivity = {
      id: 'activ-2',
      name: 'test-activity-2',
      replyToId: 'reply-to-2',
    } as Activity;

    action = incomingActivity(anotherExpectedActivity, documentId);
    const finalState = chat(transientState, action);
    incomingActivities = finalState.chats['chatId-1'].replayData.incomingActivities;
    lastActivity = incomingActivities[incomingActivities.length - 1];
    expect(lastActivity.id).toBe(anotherExpectedActivity.id);
    expect(lastActivity.replyToId).toBe(anotherExpectedActivity.replyToId);
  });

  it('should update restart type option correctly', () => {
    const documentId = 'chatId-1';
    const startingState = {
      ...DEFAULT_STATE,
      chats: {
        ...DEFAULT_STATE.chats,
        'chatId-1': {
          directLine: undefined,
          documentId,
          userId: 'user1',
          replayData: {},
        },
      },
      webSpeechFactories: {
        chat1: undefined,
      },
    };

    let action = setRestartConversationOption(documentId, RestartConversationOptions.NewUserId);
    let transientState = chat(startingState, action);
    expect(transientState.chats['chatId-1'].restartConversationOption).toBe(RestartConversationOptions.NewUserId);

    action = setRestartConversationOption(documentId, RestartConversationOptions.SameUserId);
    transientState = chat(transientState, action);
    expect(transientState.chats['chatId-1'].restartConversationOption).toBe(RestartConversationOptions.SameUserId);
  });

  it('should set restart conversation status', () => {
    const documentId = 'chatId-1';
    const startingState = {
      ...DEFAULT_STATE,
      chats: {
        ...DEFAULT_STATE.chats,
        'chatId-1': {
          directLine: undefined,
          documentId,
          userId: 'user1',
          replayData: {},
        },
      },
      webSpeechFactories: {
        chat1: undefined,
      },
    };

    let transientState: ChatState = chat(
      startingState,
      setRestartConversationStatus(RestartConversationStatus.Started, documentId)
    );
    expect(transientState.restartStatus[documentId]).toBe(RestartConversationStatus.Started);
    transientState = chat(
      transientState,
      setRestartConversationStatus(RestartConversationStatus.Completed, documentId)
    );
    expect(transientState.restartStatus[documentId]).toBe(RestartConversationStatus.Completed);

    transientState = chat(transientState, setRestartConversationStatus(RestartConversationStatus.Rejected, documentId));
    expect(transientState.restartStatus[documentId]).toBe(RestartConversationStatus.Rejected);

    transientState = chat(transientState, setRestartConversationStatus(RestartConversationStatus.Stop, documentId));
    expect(transientState.restartStatus[documentId]).toBe(RestartConversationStatus.Stop);

    expect(transientState.restartStatus['abc']).toBeUndefined();
  });
});
