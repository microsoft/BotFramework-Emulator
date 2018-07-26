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
import { applyMiddleware, combineReducers, createStore } from 'redux';
import promiseMiddleware from 'redux-promise-middleware';
import sagaMiddlewareFactory from 'redux-saga';
import thunk from 'redux-thunk';
import bot from './reducer/bot';
import chat from './reducer/chat';
import dialog from './reducer/dialog';
import editor from './reducer/editor';
import explorer from './reducer/explorer';
import files from './reducer/files';
import azureAuth from './reducer/azureAuthReducer';
import navBar from './reducer/navBar';
import presentation from './reducer/presentation';
import { applicationSagas } from './sagas';
const sagaMiddleWare = sagaMiddlewareFactory();
const DEFAULT_STATE = {};
const configureStore = (initialState = DEFAULT_STATE) => createStore(combineReducers({
    bot,
    dialog,
    editor,
    files,
    explorer,
    chat,
    navBar,
    presentation,
    azureAuth
}), initialState, applyMiddleware(sagaMiddleWare, promiseMiddleware(), thunk));
const store = configureStore();
applicationSagas.forEach(saga => sagaMiddleWare.run(saga));
export default store;
//# sourceMappingURL=store.js.map