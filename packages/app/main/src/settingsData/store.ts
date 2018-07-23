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

import * as Electron from 'electron';
import { Action, applyMiddleware, createStore, Store } from 'redux';
import { getThemes, loadSettings, saveSettings } from '../utils';
import sagaMiddlewareFactory from 'redux-saga';
import { PersistentSettings, Settings, settingsDefault, SettingsImpl, } from '@bfemulator/app-shared';
import reducers from './reducers';
import { settingsSagas } from './sagas/settingsSagas';

let started = false;
let store: Store<Settings>;

export const getStore = (): Store<Settings> => {
  console.assert(started, 'getStore() called before startup!');
  if (!store) {
    const sagaMiddleWare = sagaMiddlewareFactory();
    // Create the settings store with initial settings from disk.
    const initialSettings = loadSettings<Settings>('server.json', settingsDefault);
    initialSettings.windowState.availableThemes = getThemes();

    store = createStore(reducers, initialSettings, applyMiddleware(saveSettingsMiddleware, sagaMiddleWare));
    sagaMiddleWare.run(settingsSagas);
  }
  return store;
};

let saveTimer;
const saveSettingsMiddleware = s => next => action => {
  const result = next(action);
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => saveSettings<PersistentSettings>('server.json', getSettings()), 1000);

  return result;
};

export const dispatch = <T extends Action>(obj: any) => getStore().dispatch<T>(obj);

export const getSettings = () => {
  return new SettingsImpl(getStore().getState());
};

export const startup = () => {
  // Listen for settings change requests from the client.
  Electron.ipcMain.on('serverChangeSetting', (event, ...args) => {
    // Apply change requests to the settings store.
    getStore().dispatch({
      type: args[0],
      state: args[1]
    });
  });

  // Guard against calling getSettings before startup.
  started = true;
};

export const authenticationSettings = {
  tokenEndpoint: 'https://login.microsoftonline.com/botframework.com/oauth2/v2.0/token',
  openIdMetadata: 'https://login.microsoftonline.com/botframework.com/v2.0/.well-known/openid-configuration',
  botTokenAudience: 'https://api.botframework.com',
};

export const v31AuthenticationSettings = {
  tokenIssuer: 'https://sts.windows.net/d6d49420-f39b-4df7-a1dc-d59a935871db/',
};

export const v32AuthenticationSettings = {
  tokenIssuerV1: 'https://sts.windows.net/f8cdef31-a31e-4b4a-93e4-5f571e91255a/',
  tokenIssuerV2: 'https://login.microsoftonline.com/f8cdef31-a31e-4b4a-93e4-5f571e91255a/v2.0'
};

export const speechSettings = {
  tokenEndpoint: 'https://login.botframework.com/v3/speechtoken'
};
