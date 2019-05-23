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

import { SharedConstants } from '@bfemulator/app-shared';
import { Command } from '@bfemulator/sdk-shared';

import { readFileSync, writeFile } from '../utils';

// eslint-disable-next-line typescript/no-var-requires
const sanitize = require('sanitize-filename');
const Commands = SharedConstants.Commands.File;

/** Registers file commands */
export class FileCommands {
  // ---------------------------------------------------------------------------
  // Read file
  @Command(Commands.Read)
  protected readFile(path: string): any {
    try {
      return readFileSync(path);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(`Failure reading file at ${path}: `, e);
      throw e;
    }
  }

  // ---------------------------------------------------------------------------
  // Write file
  @Command(Commands.Write)
  protected writeFile(path: string, contents: object | string) {
    try {
      writeFile(path, contents);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(`Failure writing to file at ${path}: `, e);
      throw e;
    }
  }

  // ---------------------------------------------------------------------------
  // Sanitize a string for file name usage
  @Command(Commands.SanitizeString)
  protected sanitizeString(path: string): string {
    return sanitize(path);
  }
}
