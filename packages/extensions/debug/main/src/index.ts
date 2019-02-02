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

import { ProcessIPC, stayAlive, WebSocketIPC } from "@bfemulator/sdk-main";
import { Activity, CommandServiceImpl, IPC } from "@bfemulator/sdk-shared";
import * as path from "path";
const config = require("../../bf-extension.json");

/**
 * READ READ: All the junk below will be rolled into a tidy extension SDK that is TBD.
 * We're defining its internals here! right now!
 */

stayAlive();

console.log(`Debug Extension running. pid: ${process.pid}`);

let ipc: IPC;

if (process.send) {
  // We're a child process
  ipc = new ProcessIPC(process);
} else {
  // We're a peer process
  config.node = config.node || {};
  config.node.debug = config.node.debug || {};
  config.node.debug.webpack = config.node.debug.websocket || {};
  config.node.debug.webpack.port = config.node.debug.websocket.port || 3030;
  config.node.debug.webpack.host =
    config.node.debug.websocket.host || "localhost";
  ipc = new WebSocketIPC(
    `http://${config.node.debug.websocket.host}:${
      config.node.debug.websocket.port
    }`
  );
  ipc.id = process.pid;
  const connector = new CommandServiceImpl(ipc, "connector");
  connector.on("hello", () => {
    return {
      id: ipc.id,
      configPath: path.resolve("../../"),
      config
    };
  });
}

const commands = new CommandServiceImpl(ipc, `ext-${ipc.id}`);

// commands.remoteCall('ext-ping')
//  .then(reply => console.log(reply))
//  .catch(err => console.log('ping failed', err));

commands.on("connect", () => {
  console.log("[Debug Ext] got connect");
});

commands.on("disconnect", () => {
  console.log("[Debug Ext] got disconnect");
  process.exit();
});

commands.on("ext-ping", () => {
  return "[Debug Ext] ext-pong";
});

commands.on(
  "get-inspector-url",
  (activities: Activity[]): string => {
    const encodedActivities = encodeURIComponent(JSON.stringify(activities));
    return `client/inspect.html?activities=${encodedActivities}`;
  }
);
