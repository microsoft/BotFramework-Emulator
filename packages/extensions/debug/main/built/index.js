'use strict';

var _interopRequireWildcard = require('@babel/runtime/helpers/interopRequireWildcard');

var _sdkMain = require('@bfemulator/sdk-main');

var _sdkShared = require('@bfemulator/sdk-shared');

var path = _interopRequireWildcard(require('path'));

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
const config = require('../../bf-extension.json');
/**
 * READ READ: All the junk below will be rolled into a tidy extension SDK that is TBD.
 * We're defining its internals here! right now!
 */

(0, _sdkMain.stayAlive)();
console.log('Debug Extension running. pid: '.concat(process.pid));
let ipc;

if (process.send) {
  // We're a child process
  ipc = new _sdkMain.ProcessIPC(process);
} else {
  // We're a peer process
  config.node = config.node || {};
  config.node.debug = config.node.debug || {};
  config.node.debug.webpack = config.node.debug.websocket || {};
  config.node.debug.webpack.port = config.node.debug.websocket.port || 3030;
  config.node.debug.webpack.host = config.node.debug.websocket.host || 'localhost';
  ipc = new _sdkMain.WebSocketIPC(
    'http://'.concat(config.node.debug.websocket.host, ':').concat(config.node.debug.websocket.port)
  );
  ipc.id = process.pid;
  const connector = new _sdkShared.CommandServiceImpl(ipc, 'connector');
  connector.on('hello', () => {
    return {
      id: ipc.id,
      configPath: path.resolve('../../'),
      config,
    };
  });
}

const commands = new _sdkShared.CommandServiceImpl(ipc, 'ext-'.concat(ipc.id)); // commands.remoteCall('ext-ping')
//  .then(reply => console.log(reply))
//  .catch(err => console.log('ping failed', err));

commands.on('connect', () => {
  console.log('[Debug Ext] got connect');
});
commands.on('disconnect', () => {
  console.log('[Debug Ext] got disconnect');
  process.exit();
});
commands.on('ext-ping', () => {
  return '[Debug Ext] ext-pong';
});
commands.on('get-inspector-url', activities => {
  const encodedActivities = encodeURIComponent(JSON.stringify(activities));
  return 'client/inspect.html?activities='.concat(encodedActivities);
});
