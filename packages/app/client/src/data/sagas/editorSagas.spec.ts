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

import { SharedConstants } from '@bfemulator/app-shared';
import { call, put, select, takeEvery, takeLatest } from 'redux-saga/effects';

import { EditorActions, removeDocPendingChange } from '../action/editorActions';

import { checkActiveDocForPendingChanges, editorSagas, promptUserToReloadDocument } from './editorSagas';
import { refreshConversationMenu, editorSelector } from './sharedSagas';

jest.mock('../store', () => ({
  get store() {
    return {};
  },
}));

jest.mock('../../ui/dialogs', () => ({}));

const mockSharedConstants = SharedConstants;
let mockRemoteCommandsCalled = [];
let mockLocalCommandsCalled = [];
const mockMessageResponse = false;

jest.mock('../../platform/commands/commandServiceImpl', () => ({
  CommandServiceImpl: {
    call: async (commandName: string, ...args: any[]) => {
      mockLocalCommandsCalled.push({ commandName, args: args });
    },
    remoteCall: async (commandName: string, ...args: any[]) => {
      mockRemoteCommandsCalled.push({ commandName, args: args });

      switch (commandName) {
        case mockSharedConstants.Commands.Electron.ShowMessageBox:
          if (mockMessageResponse) {
            return Promise.resolve(true);
          } else {
            return Promise.resolve(false);
          }
        default:
          return Promise.resolve(true);
      }
    },
  },
}));

describe('The Editor Sagas', () => {
  beforeEach(() => {
    mockRemoteCommandsCalled = [];
    mockLocalCommandsCalled = [];
  });

  it('should check the active doc for pending changes', () => {
    const gen = checkActiveDocForPendingChanges();
    const stateData = gen.next().value;

    expect(stateData).toEqual(select(editorSelector));

    const mockActiveDocId = 'doc1';
    const mockEditorState = {
      editors: {
        someEditor: {
          activeDocumentId: mockActiveDocId,
        },
      },
      activeEditor: 'someEditor',
      docsWithPendingChanges: [mockActiveDocId],
    };
    // should return the inner generator that we delegate to
    const innerGen = gen.next(mockEditorState).value;
    expect(innerGen).toEqual(call(promptUserToReloadDocument, mockActiveDocId));

    expect(gen.next().done).toBe(true);
  });

  it('should prompt the user to reload the document when the file is chatdown', () => {
    const mockChatFileName = 'doc1.chat';
    const options = {
      buttons: ['Cancel', 'Reload'],
      title: 'File change detected',
      message: 'We have detected a change in this file on disk. Would you like to reload it in the Emulator?',
    };
    const gen = promptUserToReloadDocument(mockChatFileName);

    gen.next();

    const { ShowMessageBox } = SharedConstants.Commands.Electron;
    expect(mockRemoteCommandsCalled).toHaveLength(1);
    expect(mockRemoteCommandsCalled[0].commandName).toEqual(ShowMessageBox);
    expect(mockRemoteCommandsCalled[0].args[0]).toEqual(options);
    expect(gen.next(true).value).toEqual(put(removeDocPendingChange(mockChatFileName)));

    gen.next();

    const { OpenChatFile } = SharedConstants.Commands.Emulator;

    expect(mockLocalCommandsCalled).toHaveLength(1);
    expect(mockLocalCommandsCalled[0].commandName).toEqual(OpenChatFile);
    expect(mockLocalCommandsCalled[0].args[0]).toBe(mockChatFileName);
    expect(mockLocalCommandsCalled[0].args[1]).toBe(true);
    expect(gen.next().done).toBe(true);
  });

  it('should prompt the user to reload the document when the file is a transcript', () => {
    const mockTranscriptFile = 'doc2.transcript';
    const options = {
      buttons: ['Cancel', 'Reload'],
      title: 'File change detected',
      message: 'We have detected a change in this file on disk. Would you like to reload it in the Emulator?',
    };
    const gen = promptUserToReloadDocument(mockTranscriptFile);

    gen.next();

    const { ShowMessageBox } = SharedConstants.Commands.Electron;
    expect(mockRemoteCommandsCalled).toHaveLength(1);
    expect(mockRemoteCommandsCalled[0].commandName).toEqual(ShowMessageBox);
    expect(mockRemoteCommandsCalled[0].args[0]).toEqual(options);
    expect(gen.next(true).value).toEqual(put(removeDocPendingChange(mockTranscriptFile)));
    gen.next();

    const { ReloadTranscript } = SharedConstants.Commands.Emulator;

    expect(mockLocalCommandsCalled).toHaveLength(1);
    expect(mockLocalCommandsCalled[0].commandName).toEqual(ReloadTranscript);
    expect(mockLocalCommandsCalled[0].args[0]).toBe(mockTranscriptFile);
    expect(gen.next().done).toBe(true);
  });

  it('should initialize the root saga', () => {
    const gen = editorSagas();

    const checkActiveDocsYield = gen.next().value;

    expect(checkActiveDocsYield).toEqual(
      takeEvery(
        [
          EditorActions.addDocPendingChange,
          EditorActions.setActiveEditor,
          EditorActions.setActiveTab,
          EditorActions.open,
        ],
        checkActiveDocForPendingChanges
      )
    );

    const refreshConversationMenuYield = gen.next().value;

    expect(refreshConversationMenuYield).toEqual(
      takeLatest(
        [EditorActions.close, EditorActions.open, EditorActions.setActiveEditor, EditorActions.setActiveTab],
        refreshConversationMenu
      )
    );

    expect(gen.next().done).toBe(true);
  });
});
