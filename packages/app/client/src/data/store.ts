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

import { ClientAwareSettings, FrameworkSettings } from '@bfemulator/app-shared';
import { applyMiddleware, combineReducers, createStore, Store } from 'redux';
import promiseMiddleware from 'redux-promise-middleware';
import sagaMiddlewareFactory from 'redux-saga';

import { azureAuth, AzureAuthState } from './reducer/azureAuthReducer';
import { bot, BotState } from './reducer/bot';
import { chat, ChatState } from './reducer/chat';
import { clientAwareSettings } from './reducer/clientAwareSettingsReducer';
import { dialog, DialogState } from './reducer/dialog';
import { editor, EditorState } from './reducer/editor';
import { explorer, ExplorerState } from './reducer/explorer';
import { framework } from './reducer/frameworkSettingsReducer';
import { navBar, NavBarState } from './reducer/navBar';
import { notification, NotificationState } from './reducer/notification';
import { presentation, PresentationState } from './reducer/presentation';
import { progressIndicator, ProgressIndicatorState } from './reducer/progressIndicator';
import { resources, ResourcesState } from './reducer/resourcesReducer';
import { theme, ThemeState } from './reducer/themeReducer';
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
  resources?: ResourcesState;
  theme?: ThemeState;
}

const sagaMiddleWare = sagaMiddlewareFactory();
const DEFAULT_STATE: RootState = {};

const configureStore = (initialState: RootState = DEFAULT_STATE): Store<RootState> =>
  createStore<RootState>(
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
      resources,
      theme,
    }),
    initialState,
    applyMiddleware(sagaMiddleWare, promiseMiddleware())
  );

const store = configureStore();
applicationSagas.forEach(saga => sagaMiddleWare.run(saga));

export { store };
