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

import LogEntry from "@bfemulator/emulator-core/lib/types/log/entry";
import {
  addTranscript,
  appendToLog,
  ChatAction,
  clearLog,
  clearTranscripts,
  closeDocument,
  newConversation,
  newDocument,
  removeTranscript,
  setInspectorObjects,
  updateChat
} from "../action/chatActions";
import { closeNonGlobalTabs } from "../action/editorActions";
import { chat, ChatState } from "./chat";

describe("Chat reducer tests", () => {
  const testChatId = "testChat1";
  const DEFAULT_STATE: ChatState = {
    changeKey: 0,
    chats: {
      [testChatId]: {
        log: {
          entries: []
        }
      }
    },
    transcripts: []
  };

  it("should return unaltered state for non-matching action type", () => {
    const emptyAction: ChatAction = { type: null, payload: null };
    const startingState = { ...DEFAULT_STATE };
    const endingState = chat(DEFAULT_STATE, emptyAction);
    expect(endingState).toEqual(startingState);
  });

  it("should add a transcript", () => {
    const action = addTranscript("testTranscript");
    const state = chat(DEFAULT_STATE, action);
    expect(state.transcripts.length).toBe(1);
    expect(state.transcripts[0]).toBe("testTranscript");
  });

  it("should remove a transcript", () => {
    let state = chat(DEFAULT_STATE, addTranscript("xs1"));
    state = chat(state, addTranscript("xs2"));
    expect(state.transcripts.length).toBe(2);
    const action = removeTranscript("xs1");
    state = chat(state, action);
    expect(state.transcripts.length).toBe(1);
    expect(state.transcripts).not.toContain("xs1");
  });

  it("should clear all transcripts", () => {
    let state = chat(DEFAULT_STATE, addTranscript("xs1"));
    state = chat(state, addTranscript("xs2"));
    expect(state.transcripts.length).toBe(2);
    const action = clearTranscripts();
    state = chat(state, action);
    expect(state.transcripts.length).toBe(0);
  });

  it("should create a new chat", () => {
    const newChatName = "newChat";
    const action = newDocument(newChatName, "livechat");
    const state = chat(DEFAULT_STATE, action);
    expect(state.changeKey).toBe(1);
    expect(state.chats[newChatName]).toBeTruthy();
  });

  it("should close a chat", () => {
    let state = chat(DEFAULT_STATE, newDocument(testChatId, "livechat"));
    const action = closeDocument(testChatId);
    state = chat(DEFAULT_STATE, action);
    expect(state.chats[testChatId]).toBeFalsy();
  });

  it("should create a new conversation", () => {
    const action = newConversation(testChatId, { testing: true });
    const startingState = {
      ...DEFAULT_STATE,
      chats: {
        ...DEFAULT_STATE.chats,
        [testChatId]: {}
      }
    };
    const endingState = chat(startingState, action);
    const expectedDoc = {
      ...endingState.chats[testChatId],
      testing: true
    };
    expect(endingState.chats[testChatId]).toEqual(expectedDoc);
  });

  it("should append to the log", () => {
    const logEntry: LogEntry = {
      timestamp: 123,
      items: [
        {
          type: "text",
          payload: {
            level: 0,
            text: "testing"
          }
        }
      ]
    };
    const action = appendToLog(testChatId, logEntry);
    const startingState = {
      ...DEFAULT_STATE,
      chats: {
        ...DEFAULT_STATE.chats,
        [testChatId]: {
          log: {
            entries: []
          }
        }
      }
    };
    const endingState = chat(startingState, action);
    expect(endingState.chats[testChatId].log.entries[0]).toBeTruthy();
    expect(endingState.chats[testChatId].log.entries[0]).toEqual(logEntry);
  });

  it("should clear the log", () => {
    const logEntry: LogEntry = {
      timestamp: 1234,
      items: [
        {
          type: "text",
          payload: {
            level: 0,
            text: "testing"
          }
        }
      ]
    };
    const startingState = {
      ...DEFAULT_STATE,
      chats: {
        ...DEFAULT_STATE.chats,
        [testChatId]: {
          log: {
            entries: []
          }
        }
      }
    };

    let state = chat(startingState, appendToLog(testChatId, logEntry));
    expect(state.chats[testChatId].log.entries.length).toBeGreaterThan(0);
    const action = clearLog(testChatId);
    state = chat(state, action);
    expect(state.chats[testChatId].log.entries.length).toBe(0);
  });

  it("should set inspector objects", () => {
    const action = setInspectorObjects(testChatId, { testing: true });
    const startingState = {
      ...DEFAULT_STATE,
      chats: {
        ...DEFAULT_STATE.chats,
        [testChatId]: {}
      }
    };
    const endingState = chat(startingState, action);
    expect(
      endingState.chats[testChatId].inspectorObjects.length
    ).toBeGreaterThan(0);
    expect(endingState.chats[testChatId].inspectorObjects[0]).toEqual({
      testing: true
    });
  });

  it('should reset state on a "close all" editor action', () => {
    const tempChat = "tempChat";
    const alteredState: ChatState = {
      changeKey: 999,
      chats: {
        [tempChat]: {
          testing: true
        }
      },
      transcripts: ["xs1", "xs2", "xs3"]
    };
    const action = closeNonGlobalTabs();
    const state = chat(alteredState, action);
    expect(state.changeKey).toBe(0);
    expect(state.transcripts.length).toBe(0);
    expect(state.chats[tempChat]).toBeFalsy();
  });

  it("should update a chat", () => {
    const startingState = {
      ...DEFAULT_STATE,
      chats: {
        ...DEFAULT_STATE.chats,
        chat1: {
          id: "chat",
          userId: "userId"
        }
      }
    };
    const action = updateChat("chat1", {
      id: "updatedChatId",
      userId: "updatedUserId"
    });
    const state = chat(startingState, action);
    expect(state.chats.chat1.id).toBe("updatedChatId");
    expect(state.chats.chat1.userId).toBe("updatedUserId");
  });
});
