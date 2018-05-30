import { LogEntry } from '@bfemulator/app-shared';
import {
  ChatAction,
  addTranscript,
  appendToLog,
  clearLog,
  clearTranscripts,
  closeDocument,
  newConversation,
  newDocument,
  pingDocument,
  removeTranscript,
  setInspectorObjects
} from '../action/chatActions';
import * as EditorActions from '../action/editorActions';
import chat, { ChatState } from './chat';

describe('Chat reducer tests', () => {
  const testChatId = 'testChat1';
  const DEFAULT_STATE: ChatState = {
    changeKey: 0,
    chats: {
      [testChatId]: {
        pingId: 0,
        log: {
          entries: []
        }
      }
    },
    transcripts: [],
  };

  it('should return unaltered state for non-matching action type',
  () => {
    const emptyAction: ChatAction = { type: null, payload: null };
    const startingState = { ...DEFAULT_STATE };
    const endingState = chat(DEFAULT_STATE, emptyAction);
    expect(endingState).toEqual(startingState);
  });

  it('should ping a chat', () => {
    const action = pingDocument('testChat1');
    const state = chat(DEFAULT_STATE, action);
    expect(state.chats[testChatId].pingId).toBe(1);
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
    const action = newDocument(newChatName, 'livechat');
    const state = chat(DEFAULT_STATE, action);
    expect(state.changeKey).toBe(1);
    expect(state.chats[newChatName]).toBeTruthy();
  });

  it('should close a chat', () => {
    const idOfChatToDelete = 'deleteme';
    let state = chat(DEFAULT_STATE, newDocument(idOfChatToDelete, 'livechat'));
    const action = closeDocument(idOfChatToDelete);
    state = chat(DEFAULT_STATE, action);
    expect(state.chats[idOfChatToDelete]).toBeFalsy();
  });

  it('should create a new conversation', () => {
    const action = newConversation(testChatId, { testing: true });
    const state = chat(DEFAULT_STATE, action);
    const expectedDoc = {
      ...state.chats[testChatId],
      testing: true
    };
    expect(state.chats[testChatId]).toEqual(expectedDoc);
  });

  it('should append to the log', () => {
    const logEntry: LogEntry = {
      timestamp: 123,
      items: [
        {
          type: 'text',
          payload: {
            level: 0,
            text: 'testing'
          }
        }
      ]
    };

    const action = appendToLog(testChatId, logEntry);
    const state = chat(DEFAULT_STATE, action);
    expect(state.chats[testChatId].log.entries[0]).toBeTruthy();
    expect(state.chats[testChatId].log.entries[0]).toEqual(logEntry);
  });

  it('should clear the log', () => {
    const logEntry: LogEntry = {
      timestamp: 1234,
      items: [
        {
          type: 'text',
          payload: {
            level: 0,
            text: 'testing'
          }
        }
      ]
    };

    let state = chat(DEFAULT_STATE, appendToLog(testChatId, logEntry));
    expect(state.chats[testChatId].log.entries.length).toBeGreaterThan(0);
    const action = clearLog(testChatId);
    state = chat(state, action);
    expect(state.chats[testChatId].log.entries.length).toBe(0);
  });

  it('should set inspector objects', () => {
    const action = setInspectorObjects(testChatId, { testing: true });
    const state = chat(DEFAULT_STATE, action);
    expect(state.chats[testChatId].inspectorObjects.length).toBeGreaterThan(0);
    expect(state.chats[testChatId].inspectorObjects[0]).toEqual({ testing: true });
  });

  it('should reset state on a "close all" editor action', () => {
    const tempChat = 'tempChat';
    const alteredState: ChatState = {
      changeKey: 999,
      chats: {
        [tempChat]: {
          testing: true
        }
      },
      transcripts: ['xs1', 'xs2', 'xs3']
    };
    const action = EditorActions.closeNonGlobalTabs();
    const state = chat(alteredState, action);
    expect(state.changeKey).toBe(0);
    expect(state.transcripts.length).toBe(0);
    expect(state.chats[tempChat]).toBeFalsy();
  });
});