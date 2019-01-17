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
import * as path from 'path';

import { SharedConstants } from '@bfemulator/app-shared';
import { CommandService } from '@bfemulator/sdk-shared';

import { readFileSync } from './readFileSync';

export async function openFileFromCommandLine(
  fileToBeOpened: string,
  commandService: CommandService
): Promise<void> {
  const { Bot, Emulator } = SharedConstants.Commands;
  if (path.extname(fileToBeOpened) === '.bot') {
    try {
      const bot = await commandService.call(Bot.Open, fileToBeOpened);
      await commandService.call(Bot.SetActive, bot);
      await commandService.remoteCall(Bot.Load, bot);
    } catch (e) {
      throw new Error(
        `Error while trying to open a .bot file via double click at: ${fileToBeOpened}`
      );
    }
  } else if (path.extname(fileToBeOpened) === '.transcript') {
    const transcript = readFileSync(fileToBeOpened);
    const conversationActivities = JSON.parse(transcript);
    if (!Array.isArray(conversationActivities)) {
      throw new Error(
        'Invalid transcript file contents; should be an array of conversation activities.'
      );
    }

    // open a transcript on the client side and pass in
    // some extra info to differentiate it from a transcript on disk
    await commandService.remoteCall(
      Emulator.OpenTranscript,
      'deepLinkedTranscript',
      {
        activities: conversationActivities,
        inMemory: true,
      }
    );
  }
}
