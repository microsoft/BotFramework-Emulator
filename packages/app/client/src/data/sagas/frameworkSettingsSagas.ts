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
import { FrameworkSettings, newNotification, SharedConstants } from '@bfemulator/app-shared';

import { CommandServiceImpl } from '../../platform/commands/commandServiceImpl';
import * as EditorActions from '../action/editorActions';
import {
  FrameworkSettingsAction,
  frameworkSettingsChanged,
  GET_FRAMEWORK_SETTINGS,
  getFrameworkSettings as getFrameworkSettingsAction,
  SAVE_FRAMEWORK_SETTINGS,
} from '../action/frameworkSettingsActions';
import { beginAdd } from '../action/notificationActions';
import { Document } from '../reducer/editor';
import { RootState } from '../store';

import { ForkEffect, put, select, takeEvery } from 'redux-saga/effects';

export const activeDocumentSelector = (state: RootState) => {
  const { editors, activeEditor } = state.editor;
  const { activeDocumentId } = editors[activeEditor];
  return editors[activeEditor].documents[activeDocumentId];
};

export function* getFrameworkSettings(): IterableIterator<any> {
  try {
    const framework = yield CommandServiceImpl.remoteCall(SharedConstants.Commands.Settings.LoadAppSettings);
    yield put(frameworkSettingsChanged(framework));
  } catch (e) {
    const errMsg = `Error while loading emulator settings: ${e}`;
    const notification = newNotification(errMsg);
    yield put(beginAdd(notification));
  }
}

export function* saveFrameworkSettings(action: FrameworkSettingsAction<FrameworkSettings>): IterableIterator<any> {
  try {
    yield CommandServiceImpl.remoteCall(SharedConstants.Commands.Settings.SaveAppSettings, action.payload);
    const activeDoc: Document = yield select(activeDocumentSelector);
    yield put(EditorActions.setDirtyFlag(activeDoc.documentId, false)); // mark as clean
    yield put(getFrameworkSettingsAction()); // sync with main - do not assume main hasn't processed this in some way
  } catch (e) {
    const errMsg = `Error while saving emulator settings: ${e}`;
    const notification = newNotification(errMsg);
    yield put(beginAdd(notification));
  }
}

export function* frameworkSettingsSagas(): IterableIterator<ForkEffect> {
  yield takeEvery(GET_FRAMEWORK_SETTINGS, getFrameworkSettings);
  yield takeEvery(SAVE_FRAMEWORK_SETTINGS, saveFrameworkSettings);
}
