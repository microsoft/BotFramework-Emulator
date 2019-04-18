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

import { isChatFile, isTranscriptFile, SharedConstants } from '@bfemulator/app-shared';
import { call, ForkEffect, put, select, takeEvery, takeLatest } from 'redux-saga/effects';

import { CommandServiceImpl } from '../../platform/commands/commandServiceImpl';
import { EditorActions, removeDocPendingChange } from '../action/editorActions';

import { editorSelector, refreshConversationMenu } from './sharedSagas';

export function* promptUserToReloadDocument(filename: string): IterableIterator<any> {
  const { Commands } = SharedConstants;
  const options = {
    buttons: ['Cancel', 'Reload'],
    title: 'File change detected',
    message: 'We have detected a change in this file on disk. Would you like to reload it in the Emulator?',
  };
  const confirmation = yield CommandServiceImpl.remoteCall(Commands.Electron.ShowMessageBox, options);

  // clear the doc of pending changes
  yield put(removeDocPendingChange(filename));

  // reload the file, otherwise proceed without reloading
  const { OpenChatFile, ReloadTranscript } = SharedConstants.Commands.Emulator;

  if (confirmation) {
    if (isChatFile(filename)) {
      yield CommandServiceImpl.call(OpenChatFile, filename, true);
    } else if (isTranscriptFile(filename)) {
      yield CommandServiceImpl.call(ReloadTranscript, filename);
    }
  }
}

export function* checkActiveDocForPendingChanges(): IterableIterator<any> {
  const stateData = yield select(editorSelector);

  // if currently active document has pending changes, prompt the user to reload it
  const activeDocId = stateData.editors[stateData.activeEditor].activeDocumentId;
  if (stateData.docsWithPendingChanges.some(doc => doc === activeDocId)) {
    // TODO: active document ID is not always the filename
    yield call(promptUserToReloadDocument, activeDocId);
  }
  return;
}

export function* editorSagas(): IterableIterator<ForkEffect> {
  // Whenever a doc is added to the list of docs pending changes, or and editor / tab
  // is focused, check to see if the active document has pending changes
  yield takeEvery(
    [EditorActions.addDocPendingChange, EditorActions.setActiveEditor, EditorActions.setActiveTab, EditorActions.open],
    checkActiveDocForPendingChanges
  );

  yield takeLatest(
    [EditorActions.close, EditorActions.open, EditorActions.setActiveEditor, EditorActions.setActiveTab],
    refreshConversationMenu
  );
}
