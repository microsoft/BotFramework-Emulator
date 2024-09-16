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

import { Action, applyMiddleware, createStore, combineReducers, Store } from 'redux';
import { ipcMain } from 'electron';
import sagaMiddlewareFactory from 'redux-saga';
import {
  AzureAuthState,
  azureAuth,
  azureAuthSettings,
  bot,
  BotState,
  chat,
  clientAwareSettings,
  dialog,
  editor,
  explorer,
  framework,
  navBar,
  notification,
  presentation,
  progressIndicator,
  protocol,
  ProtocolState,
  resources,
  savedBotUrls,
  settingsDefault,
  theme,
  update,
  windowState,
  ChatState,
  ClientAwareSettings,
  DialogState,
  EditorState,
  ExplorerState,
  FrameworkSettings,
  NavBarState,
  NotificationState,
  PresentationState,
  ProgressIndicatorState,
  ResourcesState,
  Settings,
  SettingsImpl,
  ThemeState,
  UpdateState,
} from '@bfemulator/app-shared';

import { loadSettings, getThemes } from '../utils';

import { settingsSagas } from './sagas';
import { forwardToRenderer } from './middleware/forwardToRenderer';

export interface RootState {
  azureAuth?: AzureAuthState;
  bot?: BotState;
  chat?: ChatState;
  clientAwareSettings?: ClientAwareSettings;
  dialog?: DialogState;
  editor?: EditorState;
  explorer?: ExplorerState;
  framework?: FrameworkSettings;
  navBar?: NavBarState;
  notification?: NotificationState;
  presentation?: PresentationState;
  progressIndicator?: ProgressIndicatorState;
  protocol?: ProtocolState;
  resources?: ResourcesState;
  settings?: Settings;
  theme?: ThemeState;
  update?: UpdateState;
}

export const DEFAULT_STATE = {
  settings: {},
};

function initStore(): Store<RootState> {
  // load the initial store with loaded app settings from disk
  const loadedSettings = loadSettings('server.json', settingsDefault);
  loadedSettings.windowState.availableThemes = getThemes();
  DEFAULT_STATE.settings = loadedSettings;
  const settingsReducer = combineReducers<Settings>({
    azure: azureAuthSettings,
    framework,
    savedBotUrls,
    windowState,
  });

  const sagaMiddleware = sagaMiddlewareFactory();
  const _store: Store<RootState> = createStore(
    combineReducers({
      azureAuth,
      bot,
      chat,
      clientAwareSettings,
      dialog,
      editor,
      explorer,
      framework,
      navBar,
      notification,
      presentation,
      progressIndicator,
      protocol,
      resources,
      settings: settingsReducer,
      theme,
      update,
    }),
    DEFAULT_STATE,
    applyMiddleware(forwardToRenderer, sagaMiddleware)
  );

  const sagas = [settingsSagas];
  sagas.forEach(saga => sagaMiddleware.run(saga));

  // sync the main process store with any updates on the renderer process
  ipcMain.on('sync-store', (ev, action) => {
    // prevent an endless loop of forwarding the action over ipc
    action = { ...action, meta: { doNotForward: true } };
    _store.dispatch(action);
    // unblock renderer process
    ev.returnValue = true;
  });
  return _store;
}

export const store = initStore();

export const dispatch = <T extends Action>(action: T) => store.dispatch<T>(action);

export const getSettings = () => {
  return new SettingsImpl(store.getState().settings);
};
