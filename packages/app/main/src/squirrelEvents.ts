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

import { app } from "electron";
import { spawn } from "child_process";
import * as path from "path";
import * as registry from './registryUtils';

function runUpdateExe(args: string[], done: Function): void {
    const updateExe = path.resolve(path.dirname(process.execPath), "..", "Update.exe");
    //logger.log(`Spawning ${updateExe} with args ${args}`);
    spawn(updateExe, args, {
        detached: true
    })
    .on("close", done as any);
}

export function handleStartupEvent(): boolean {
    if (process.platform !== "win32") {
        return false;
    }

    const cmd = process.argv[1];
    //logger.log(`Processing squirrel command ${cmd}`);
    const target = path.basename(process.execPath);
    if (cmd === "--squirrel-install" || cmd === "--squirrel-updated") {
        registry.registerProtocolHandler('bfemulator', 'Bot Framework Emulator').then(_ => {
            runUpdateExe(['--createShortcut=' + target + ''], app.quit);
        });
        return true;
    }
    else if (cmd === "--squirrel-uninstall") {
        registry.unregisterProtocolHandler('botemulator');
        registry.unregisterProtocolHandler('bfemulator').then(_ => {
            runUpdateExe(['--removeShortcut=' + target + ''], app.quit);
        });
        return true;
    }
    else if (cmd === "--squirrel-obsolete") {
        app.quit();
        return true;
    }
    else {
        return false;
    }
}
