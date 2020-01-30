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

import {
  beginAdd,
  newNotification,
  setDirtyFlag,
  setFrameworkSettings,
  Document,
  FrameworkAction,
  FrameworkActionType,
  FrameworkSettings,
  SharedConstants,
} from '@bfemulator/app-shared';
import { ForkEffect, call, put, select, takeEvery } from 'redux-saga/effects';
import { CommandServiceImpl, CommandServiceInstance } from '@bfemulator/sdk-shared';

import { RootState } from '../store';
import { getSettingsDelta } from '../../utils';

export const activeDocumentSelector = (state: RootState) => {
  const { editors, activeEditor } = state.editor;
  const { activeDocumentId } = editors[activeEditor];
  return editors[activeEditor].documents[activeDocumentId];
};

export const getFrameworkSettings = (state: RootState): FrameworkSettings => state.framework;

export class FrameworkSettingsSagas {
  @CommandServiceInstance()
  private static commandService: CommandServiceImpl;

  // when saving settings from the settings editor we need to mark the document as clean
  // and then set the settings
  public static *saveFrameworkSettings(action: FrameworkAction<FrameworkSettings>): IterableIterator<any> {
    try {
      const activeDoc: Document = yield select(activeDocumentSelector);
      yield put(setDirtyFlag(activeDoc.documentId, false)); // mark as clean
      yield put(setFrameworkSettings(action.payload));
      const currentSettings = yield select(getFrameworkSettings);
      const settingsDelta = getSettingsDelta(currentSettings, action.payload);
      if (settingsDelta) {
        yield call(
          [FrameworkSettingsSagas.commandService, FrameworkSettingsSagas.commandService.remoteCall],
          SharedConstants.Commands.Telemetry.TrackEvent,
          'app_changeSettings',
          settingsDelta
        );
      }
    } catch (e) {
      const errMsg = `Error while saving emulator settings: ${e}`;
      const notification = newNotification(errMsg);
      yield put(beginAdd(notification));
    }
  }
}

export function* frameworkSettingsSagas(): IterableIterator<ForkEffect> {
  yield takeEvery(FrameworkActionType.SAVE_FRAMEWORK_SETTINGS, FrameworkSettingsSagas.saveFrameworkSettings);
}
