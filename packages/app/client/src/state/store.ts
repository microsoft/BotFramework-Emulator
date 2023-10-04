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

import { applyMiddleware, createStore, combineReducers, compose, Store } from 'redux';
import { ipcRenderer } from 'electron';
import remote from '@electron/remote';
import sagaMiddlewareFactory from 'redux-saga';
import { call, all, spawn } from 'redux-saga/effects';
import {
  AzureAuthState,
  azureAuth,
  azureAuthSettings,
  bot,
  BotState,
  chat,
  ClientAwareSettings,
  clientAwareSettings,
  dialog,
  editor,
  explorer,
  framework,
  FrameworkSettings,
  navBar,
  notification,
  presentation,
  progressIndicator,
  protocol,
  ProtocolState,
  resources,
  savedBotUrls,
  theme,
  update,
  windowState,
  ChatState,
  DialogState,
  EditorState,
  ExplorerState,
  NavBarState,
  NotificationState,
  PresentationState,
  ProgressIndicatorState,
  ResourcesState,
  Settings,
  ThemeState,
  UpdateState,
  ngrokTunnel,
  NgrokTunnelState,
} from '@bfemulator/app-shared';

import { forwardToMain } from './middleware/forwardToMain';
import { applicationSagas } from './sagas';

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
  ngrokTunnel?: NgrokTunnelState;
}

const DEFAULT_STATE = {};

function initStore(): Store<RootState> {
  const settingsReducer = combineReducers<Settings>({
    azure: azureAuthSettings,
    framework,
    savedBotUrls,
    windowState,
  });

  const sagaMiddleware = sagaMiddlewareFactory();
  let storeEnhancer = applyMiddleware(forwardToMain, sagaMiddleware);
  if (!remote.app.isPackaged) {
    // enable react & react-redux dev tools
    const composeEnhancers = (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
    storeEnhancer = composeEnhancers(storeEnhancer);
  }
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
      ngrokTunnel,
    }),
    DEFAULT_STATE,
    storeEnhancer
  );

  function* rootSaga() {
    yield all(
      applicationSagas.map(saga =>
        spawn(function*() {
          while (true) {
            try {
              yield call(saga);
              break;
            } catch (error) {
              console.error('Saga error: ', error); // eslint-disable-line
            }
          }
        })
      )
    );
  }
  sagaMiddleware.run(rootSaga);

  // sync the renderer process store with any updates on the main process
  ipcRenderer.on('sync-store', (_ev, action) => {
    // prevent an endless loop of forwarding the action over ipc
    action = { ...action, meta: { doNotForward: true } };
    _store.dispatch(action);
  });
  return _store;
}

export const store = initStore();
