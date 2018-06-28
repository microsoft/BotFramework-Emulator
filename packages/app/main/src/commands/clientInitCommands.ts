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

import { mainWindow } from '../main';
import * as BotActions from '../data-v2/action/bot';
import { emulator } from '../emulator';
import { ExtensionManagerImpl } from '../extensions';
import { Protocol } from '../constants';
import { ProtocolHandler } from '../protocolHandler';
import { getStore } from '../data-v2/store';
import { getBotsFromDisk, readFileSync } from '../utils';
import * as Path from 'path';
import { CommandRegistryImpl } from '@bfemulator/sdk-shared';

const store = getStore();

/** Registers client initialization commands */
export function registerCommands(commandRegistry: CommandRegistryImpl) {
  // ---------------------------------------------------------------------------
  // Client notifying us it's initialized and has rendered
  commandRegistry.registerCommand('client:loaded', () => {
    // Load bots from disk and sync list with client
    const bots = getBotsFromDisk();
    store.dispatch(BotActions.load(bots));
    mainWindow.commandService.remoteCall('bot:list:sync', bots);
    // Reset the app title bar
    mainWindow.commandService.call('electron:set-title-bar');
    // Un-fullscreen the screen
    mainWindow.commandService.call('electron:set-fullscreen', false);
    // Send app settings to client
    mainWindow.commandService.remoteCall('receive-global-settings', {
      url: emulator.framework.serverUrl,
      cwd: __dirname
    });
    // Load extensions
    ExtensionManagerImpl.unloadExtensions();
    ExtensionManagerImpl.loadExtensions();
  });

  // ---------------------------------------------------------------------------
  // Client notifying us the welcome screen has been rendered
  commandRegistry.registerCommand('client:post-welcome-screen', async (): Promise<void> => {
    mainWindow.commandService.call('menu:update-recent-bots');

    // Parse command line args for a protocol url
    const args = process.argv.length ? process.argv.slice(1) : [];
    if (args.some(arg => arg.includes(Protocol))) {
      const protocolArg = args.find(arg => arg.includes(Protocol));
      ProtocolHandler.parseProtocolUrlAndDispatch(protocolArg);
    }

    // Parse command line args to see if we are opening a .bot or .transcript file
    if (args.some(arg => /(\.transcript)|(\.bot)$/.test(arg))) {
      const fileToBeOpened = args.find(arg => /(\.transcript)|(\.bot)$/.test(arg));
      if (Path.extname(fileToBeOpened) === '.bot') {
        try {
          const bot = await mainWindow.commandService.call('bot:open', fileToBeOpened);
          await mainWindow.commandService.call('bot:set-active', bot);
          await mainWindow.commandService.remoteCall('bot:load', bot);
        } catch (e) {
          throw new Error(`Error while trying to open a .bot file via double click at: ${fileToBeOpened}`);
        }
      } else if (Path.extname(fileToBeOpened) === '.transcript') {
        const transcript = readFileSync(fileToBeOpened);
        const conversationActivities = JSON.parse(transcript);
        if (!Array.isArray(conversationActivities)) {
          throw new Error('Invalid transcript file contents; should be an array of conversation activities.');
        }

        // open a transcript on the client side and pass in
        // some extra info to differentiate it from a transcript on disk
        mainWindow.commandService.remoteCall('transcript:open', 'deepLinkedTranscript', {
          activities: conversationActivities,
          deepLink: true
        });
      }
    }
  });
}
