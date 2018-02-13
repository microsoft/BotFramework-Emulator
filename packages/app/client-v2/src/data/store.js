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
import IPCRendererWebSocket from 'electron-ipcrenderer-websocket';
import promiseMiddleware from 'redux-promise-middleware';
import WebSocketActionBridge from 'redux-websocket-bridge';

import assetExplorer from './reducer/assetExplorer';
import bot from './reducer/bot';
import card from './reducer/card';
import chat from './reducer/chat';
import editor from './reducer/editor';
import navBar from './reducer/navBar';
import server from './reducer/server';

// TODO: Remove this when we no longer need to debug the WebSocket connection
// import DebugWebSocketConnection from './debugWebSocketConnection';

const electron = window.process && window.process.versions.electron;

const createStoreWithMiddleware = applyMiddleware(
  WebSocketActionBridge(() => new IPCRendererWebSocket()),
  // WebSocketActionBridge(() => new DebugWebSocketConnection(new IPCRendererWebSocket())),
  promiseMiddleware()
)(createStore);

const DEFAULT_STATE = {};

export default createStoreWithMiddleware(combineReducers({
  assetExplorer,
  bot,
  card,
  editor,
  chat,
  navBar,
  server
}));
