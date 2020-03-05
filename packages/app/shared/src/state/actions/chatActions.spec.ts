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

import { Activity } from 'botframework-schema';

import {
  ChatActions,
  inspectorChanged,
  addTranscript,
  clearTranscripts,
  removeTranscript,
  webSpeechFactoryUpdated,
  webChatStoreUpdated,
  updatePendingSpeechTokenRetrieval,
  newChat,
  closeDocument,
  closeConversation,
  appendToLog,
  clearLog,
  setInspectorObjects,
  setHighlightedObjects,
  updateChat,
  showContextMenuForActivity,
  openTranscript,
  restartConversation,
  updateSpeechAdapters,
  setRestartConversationStatus,
  RestartConversationStatus,
  postActivity,
  incomingActivity,
  setRestartConversationOption,
  RestartConversationOptions,
} from './chatActions';

describe('chat actions', () => {
  it('should create an inspectorChanged action', () => {
    const inspectorWebView: any = {};
    const action = inspectorChanged(inspectorWebView);

    expect(action.type).toBe(ChatActions.activeInspectorChanged);
    expect(action.payload).toEqual({ inspectorWebView });
  });

  it('should create an addTranscript action', () => {
    const filename = 'blah.transcript';
    const action = addTranscript(filename);

    expect(action.type).toBe(ChatActions.addTranscript);
    expect(action.payload).toEqual({ filename });
  });

  it('should create a clearTranscripts action', () => {
    const action = clearTranscripts();

    expect(action.type).toBe(ChatActions.clearTranscripts);
    expect(action.payload).toEqual({});
  });

  it('should create a removeTranscript action', () => {
    const filename = 'blah.transcript';
    const action = removeTranscript(filename);

    expect(action.type).toBe(ChatActions.removeTranscript);
    expect(action.payload).toEqual({ filename });
  });

  it('should create a webSpeechFactoryUpdated action', () => {
    const documentId = 'someDocId';
    const factory = () => null;
    const action = webSpeechFactoryUpdated(documentId, factory);

    expect(action.type).toBe(ChatActions.webSpeechFactoryUpdated);
    expect(action.payload).toEqual({ factory, documentId });
  });

  it('should create a webChatStoreUpdated action', () => {
    const documentId = 'someDocId';
    const store = {};
    const action = webChatStoreUpdated(documentId, store);

    expect(action.type).toBe(ChatActions.webChatStoreUpdated);
    expect(action.payload).toEqual({ documentId, store });
  });

  it('should create an updatePendingSpeechTokenRetrieval action', () => {
    const documentId = 'someDocId';
    const pending = true;
    const action = updatePendingSpeechTokenRetrieval(documentId, pending);

    expect(action.type).toBe(ChatActions.updatePendingSpeechTokenRetrieval);
    expect(action.payload).toEqual({ documentId, pending });
  });

  it('should create a newChat action', () => {
    const documentId = 'someDocId';
    const mode = 'livechat';
    const additionalData: any = { someOtherProperty: true };

    const action = newChat(documentId, mode, additionalData);

    expect(action.type).toBe(ChatActions.newChat);
    expect(action.payload).toEqual({
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
      someOtherProperty: true,
    });
  });

  it('should create a closeDocument action', () => {
    const documentId = 'someDocId';
    const action = closeDocument(documentId);

    expect(action.type).toBe(ChatActions.closeDocument);
    expect(action.payload).toEqual({ documentId });
  });

  it('should create a closeConversation action', () => {
    const documentId = 'someDocId';
    const action = closeConversation(documentId);

    expect(action.type).toBe(ChatActions.closeConversation);
    expect(action.payload).toEqual({ documentId });
  });

  it('should create an appendToLog action', () => {
    const documentId = 'someDocId';
    const entry: any = {};
    const action = appendToLog(documentId, entry);

    expect(action.type).toBe(ChatActions.appendLog);
    expect(action.payload).toEqual({ documentId, entry });
  });

  it('should create a clearLog action', () => {
    const documentId = 'someDocId';
    const action = clearLog(documentId);

    expect(action.type).toBe(ChatActions.clearLog);
    expect(action.payload).toEqual({ documentId });
  });

  it('should create a setInspectorObjects action', () => {
    const documentId = 'someDocId';
    let objs: any = [{}, {}];
    let action = setInspectorObjects(documentId, objs);

    expect(action.type).toBe(ChatActions.setInspectorObjects);
    expect(action.payload).toEqual({ documentId, objs });

    objs = {};
    action = setInspectorObjects(documentId, objs);

    expect(action.payload).toEqual({ documentId, objs: [objs] });
  });

  it('should create a setHighlightedObjects action', () => {
    const documentId = 'someDocId';
    let objs: any = [{}, {}];
    let action = setHighlightedObjects(documentId, objs);

    expect(action.type).toBe(ChatActions.setHighlightedObjects);
    expect(action.payload).toEqual({ documentId, objs });

    objs = {};
    action = setHighlightedObjects(documentId, objs);

    expect(action.payload).toEqual({ documentId, objs: [objs] });
  });

  it('should create an updateChat action', () => {
    const documentId = 'someDocId';
    const updatedValues = { updatedValue: 123 };
    const action = updateChat(documentId, updatedValues);

    expect(action.type).toBe(ChatActions.updateChat);
    expect(action.payload).toEqual({ documentId, updatedValues });
  });

  it('should create a showContextMenuForActivity action', () => {
    const activity: any = {};
    const action = showContextMenuForActivity(activity);

    expect(action.type).toBe(ChatActions.showContextMenuForActivity);
    expect(action.payload).toEqual(activity);
  });

  it('should create an openTranscript action', () => {
    const filename = 'someFile.transcript';
    const activities: any = [];
    const action = openTranscript(filename, activities);

    expect(action.type).toBe(ChatActions.openTranscript);
    expect(action.payload).toEqual({
      filename,
      activities,
    });
  });

  it('should create a restartConversation action', () => {
    const documentId = 'someDocId';
    const action = restartConversation(documentId);

    expect(action.type).toBe(ChatActions.restartConversation);
    expect(action.payload).toEqual({
      documentId,
      requireNewConversationId: false,
      requireNewUserId: false,
    });
  });

  it('should create an updateSpeechAdapters action', () => {
    const directLine: any = {};
    const documentId = 'someDocId';
    const webSpeechPonyfillFactory: any = {};
    const action = updateSpeechAdapters(documentId, directLine, webSpeechPonyfillFactory);

    expect(action).toEqual({
      type: ChatActions.updateSpeechAdapters,
      payload: {
        directLine,
        documentId,
        webSpeechPonyfillFactory,
      },
    });
  });

  it('should create a setRestartConversationStatus action', () => {
    const expectedPayload = {
      documentId: 'abc',
      status: RestartConversationStatus.Started,
    };
    const action = setRestartConversationStatus(expectedPayload.status, expectedPayload.documentId);

    expect(action).toEqual({
      type: ChatActions.SetRestartConversationStatus,
      payload: expectedPayload,
    });
  });

  it('should create a postActivity action', () => {
    const activity: Activity = {
      id: 'activ-1',
    } as Activity;

    const expectedPayload = {
      documentId: 'abc',
      activity,
    };
    const action = postActivity(activity, 'abc');

    expect(action).toEqual({
      type: ChatActions.PostActivityEventWc,
      payload: expectedPayload,
    });
  });

  it('should create an incoming activity action', () => {
    const activity: Activity = {
      id: 'activ-1',
    } as Activity;

    const expectedPayload = {
      documentId: 'abc',
      activity,
    };
    const action = incomingActivity(activity, 'abc');

    expect(action).toEqual({
      type: ChatActions.IncomingActivityFromWc,
      payload: expectedPayload,
    });
  });

  it('should create a set restart conversation status action', () => {
    const expectedPayload = {
      documentId: 'abc',
      status: RestartConversationStatus.Started,
    };
    const action = setRestartConversationStatus(expectedPayload.status, expectedPayload.documentId);

    expect(action).toEqual({
      type: ChatActions.SetRestartConversationStatus,
      payload: expectedPayload,
    });
  });

  it('should set correct restart conversation option', () => {
    const expectedPayload = {
      documentId: 'abc',
      option: RestartConversationOptions.NewUserId,
    };
    const action = setRestartConversationOption(expectedPayload.documentId, expectedPayload.option);

    expect(action).toEqual({
      type: ChatActions.SetRestartConversationOption,
      payload: expectedPayload,
    });
  });
});
