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
import { SharedConstants, newNotification } from '@bfemulator/app-shared';
import { applyMiddleware, combineReducers, createStore } from 'redux';
import sagaMiddlewareFactory from 'redux-saga';

import { CONTENT_TYPE_APP_SETTINGS, DOCUMENT_ID_APP_SETTINGS } from '../../constants';
import * as EditorActions from '../action/editorActions';
import {
  getFrameworkSettings as getFrameworkSettingsAction,
  saveFrameworkSettings as saveFrameworkSettingsAction,
} from '../action/frameworkSettingsActions';
import { CommandServiceImpl } from '../../platform/commands/commandServiceImpl';
import { beginAdd } from '../action/notificationActions';
import { editor } from '../reducer/editor';
import {
  frameworkSettingsChanged,
  GET_FRAMEWORK_SETTINGS,
  SAVE_FRAMEWORK_SETTINGS,
} from '../action/frameworkSettingsActions';
import { framework } from '../reducer/frameworkSettingsReducer';

import {
  activeDocumentSelector,
  frameworkSettingsSagas,
  getFrameworkSettings,
  saveFrameworkSettings,
} from './frameworkSettingsSagas';

import { put, takeEvery, select } from 'redux-saga/effects';

jest.mock(
  '../../ui/dialogs/',
  () =>
    new Proxy(
      {},
      {
        get(): any {
          return {};
        },
      }
    )
);

const sagaMiddleWare = sagaMiddlewareFactory();
const mockStore = createStore(combineReducers({ framework, editor }), {}, applyMiddleware(sagaMiddleWare));
sagaMiddleWare.run(frameworkSettingsSagas);

jest.mock('../store', () => ({
  get store() {
    return mockStore;
  },
}));

mockStore.dispatch(
  EditorActions.open({
    contentType: CONTENT_TYPE_APP_SETTINGS,
    documentId: DOCUMENT_ID_APP_SETTINGS,
    isGlobal: true,
    meta: null,
  })
);
describe('The frameworkSettingsSagas', () => {
  it('should register the expected generators', () => {
    const it = frameworkSettingsSagas();
    expect(it.next().value).toEqual(takeEvery(GET_FRAMEWORK_SETTINGS, getFrameworkSettings));
    expect(it.next().value).toEqual(takeEvery(SAVE_FRAMEWORK_SETTINGS, saveFrameworkSettings));
  });

  it('should get the framework settings when using the happy path', () => {
    const it = getFrameworkSettings();
    let next = it.next();
    expect(next.value).toEqual(CommandServiceImpl.remoteCall(SharedConstants.Commands.Settings.LoadAppSettings));

    next = it.next({});
    expect(next.value).toEqual(put(frameworkSettingsChanged({})));
  });

  it('should send a notification when something goes wrong while getting the framework settings', () => {
    const it = getFrameworkSettings();
    it.next();
    const errMsg = `Error while loading emulator settings: oh noes!`;
    const notification = newNotification(errMsg);
    notification.timestamp = jasmine.any(Number);
    notification.id = jasmine.any(String);
    expect(it.throw('oh noes!').value).toEqual(put(beginAdd(notification)));
  });

  it('should save the framework settings', () => {
    const it = saveFrameworkSettings(saveFrameworkSettingsAction({}));
    // remote call to save the settings
    expect(it.next().value).toEqual(
      CommandServiceImpl.remoteCall(SharedConstants.Commands.Settings.SaveAppSettings, {})
    );
    const selector = it.next().value;
    // selector to get the active document from the state
    expect(selector).toEqual(select(activeDocumentSelector));
    const value = selector.SELECT.selector(mockStore.getState());
    // put the dirty state to false
    expect(it.next(value).value).toEqual(put(EditorActions.setDirtyFlag(value.documentId, false)));
    // get the settings from the main side again
    expect(it.next().value).toEqual(put(getFrameworkSettingsAction()));
  });

  it('should send a notification when saving the settings fails', () => {
    const it = saveFrameworkSettings(saveFrameworkSettingsAction({}));
    it.next();
    const errMsg = `Error while saving emulator settings: oh noes!`;
    const notification = newNotification(errMsg);
    notification.timestamp = jasmine.any(Number);
    notification.id = jasmine.any(String);
    expect(it.throw('oh noes!').value).toEqual(put(beginAdd(notification)));
  });
});
