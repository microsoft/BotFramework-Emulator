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

import { Settings, settingsDefault, SettingsImpl } from '@bfemulator/app-shared';
import * as Electron from 'electron';
import { Action, applyMiddleware, createStore, Store } from 'redux';
import sagaMiddlewareFactory from 'redux-saga';

import { getThemes, loadSettings } from '../utils';

import reducers from './reducers';
import { settingsSagas } from './sagas/settingsSagas';

let started = false;
let store: Store<Settings>;

export const getStore = (): Store<Settings> => {
  // eslint-disable-next-line no-console
  console.assert(started, 'getStore() called before startup!');
  if (!store) {
    const sagaMiddleWare = sagaMiddlewareFactory();
    // Create the settings store with initial settings from disk.
    const initialSettings = loadSettings('server.json', settingsDefault);
    initialSettings.windowState.availableThemes = getThemes();

    store = createStore(reducers, initialSettings, applyMiddleware(sagaMiddleWare));
    sagaMiddleWare.run(settingsSagas);
  }
  return store;
};
export const dispatch = <T extends Action>(obj: any) => getStore().dispatch<T>(obj);

export const getSettings = () => {
  return new SettingsImpl(getStore().getState());
};

export const startup = () => {
  if (started) {
    return;
  }
  // Listen for settings change requests from the client.
  Electron.ipcMain.on('serverChangeSetting', onServerChangeSettings);
  // Guard against calling getSettings before startup.
  started = true;
};

function onServerChangeSettings(event, ...args) {
  // Apply change requests to the settings store.
  getStore().dispatch({
    type: args[0],
    state: args[1],
  });
}
