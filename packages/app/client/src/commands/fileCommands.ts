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

import {
  isChatFile,
  isTranscriptFile,
  SharedConstants
} from "@bfemulator/app-shared";
import { CommandRegistryImpl } from "@bfemulator/sdk-shared";

import * as EditorActions from "../data/action/editorActions";
import * as FileActions from "../data/action/fileActions";
import { store } from "../data/store";

/** Registers file commands */
export function registerCommands(commandRegistry: CommandRegistryImpl) {
  const { File } = SharedConstants.Commands;
  // ---------------------------------------------------------------------------
  // Adds a file to the file store
  commandRegistry.registerCommand(File.Add, payload => {
    store.dispatch(FileActions.addFile(payload));
  });

  // ---------------------------------------------------------------------------
  // Removes a file from the file store
  commandRegistry.registerCommand(File.Remove, path => {
    store.dispatch(FileActions.removeFile(path));
  });

  // ---------------------------------------------------------------------------
  // Clears the file store
  commandRegistry.registerCommand(File.Clear, () => {
    store.dispatch(FileActions.clear());
  });

  // ---------------------------------------------------------------------------
  // Called for files in the bot's directory whose contents have changed on disk
  commandRegistry.registerCommand(File.Changed, (filename: string) => {
    // add the filename to pending updates and prompt the user once the document is focused again
    if (isChatFile(filename) || isTranscriptFile(filename)) {
      store.dispatch(EditorActions.addDocPendingChange(filename));
    }
  });
}
