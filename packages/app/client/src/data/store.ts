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

import { applyMiddleware, combineReducers, createStore, Store } from 'redux';
import promiseMiddleware from 'redux-promise-middleware';
import sagaMiddlewareFactory from 'redux-saga';
import thunk from 'redux-thunk';
import assetExplorer, { IAssetExplorerState } from './reducer/assetExplorer';
import bot, { IBotState } from './reducer/bot';
import chat, { IChatState } from './reducer/chat';
import dialog, { IDialogState } from './reducer/dialog';
import editor, { IEditorState } from './reducer/editor';
import explorer, { IExplorerState } from './reducer/explorer';
import files, { IFileTreeState } from './reducer/files';
import luisAuth, { ILuisAuthState } from './reducer/luisAuthReducer';
import luisModel, { ILuisModelsState } from './reducer/luisModelsReducer';
import navBar, { INavBarState } from './reducer/navBar';

import presentation, { IPresentationState } from './reducer/presentation';
import server, { IServerState } from './reducer/server';
import { applicationSagas } from './sagas';

// TODO: Remove this when we no longer need to debug the WebSocket connection
// import DebugWebSocketConnection from './debugWebSocketConnection';

const _window = window as any;
const electron = _window.process && _window.process.versions.electron;

export interface IRootState {
  assetExplorer?: IAssetExplorerState;
  bot?: IBotState;
  dialog?: IDialogState;
  editor?: IEditorState;
  explorer?: IExplorerState;
  chat?: IChatState;
  navBar?: INavBarState;
  presentation?: IPresentationState;
  server?: IServerState;
  luisAuth?: ILuisAuthState;
  luisModel?: ILuisModelsState;
  files?: IFileTreeState;
}

const sagaMiddleWare = sagaMiddlewareFactory();
const DEFAULT_STATE: IRootState = {};

const configureStore = (initialState: IRootState = DEFAULT_STATE): Store<IRootState> => createStore(
  combineReducers({
    assetExplorer,
    bot,
    dialog,
    editor,
    files,
    explorer,
    chat,
    navBar,
    presentation,
    server,
    luisAuth,
    luisModel
  }),
  initialState,
  applyMiddleware(
    sagaMiddleWare,
    promiseMiddleware(),
    thunk
  )
);

const store = configureStore();
applicationSagas.forEach(saga => sagaMiddleWare.run(saga));

export default store;
