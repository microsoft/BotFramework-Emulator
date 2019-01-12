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

import { SharedConstants } from "@bfemulator/app-shared";
import { CommandRegistryImpl } from "@bfemulator/sdk-shared";

/** Registers electron commands */
export function registerCommands(commandRegistry: CommandRegistryImpl) {
  const { Electron } = SharedConstants.Commands;
  // ---------------------------------------------------------------------------
  // Toggle inspector dev tools for all open inspectors
  commandRegistry.registerCommand(Electron.ToggleDevTools, () => {
    window.dispatchEvent(new Event("toggle-inspector-devtools"));
  });

  // ---------------------------------------------------------------------------
  // An update is ready to install
  commandRegistry.registerCommand(
    Electron.UpdateAvailable,
    (...args: any[]) => {
      // TODO: Show a notification
      console.log("Update available", ...args);
    }
  );

  // ---------------------------------------------------------------------------
  // Application is up to date
  commandRegistry.registerCommand(Electron.UpdateNotAvailable, () => {
    // TODO: Show a notification
    console.log("Application is up to date");
  });

  // ---------------------------------------------------------------------------
  // Open About dialog
  commandRegistry.registerCommand(Electron.ShowAboutDialog, () => {
    // TODO: Show about dialog (native dialog box)
  });
}
