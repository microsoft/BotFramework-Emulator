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

import { ClientAwareSettings, DebugMode, Settings, SharedConstants } from '@bfemulator/app-shared';
import { CommandRegistryImpl } from '@bfemulator/sdk-shared';
import { Store } from 'redux';

import * as BotActions from '../botData/actions/botActions';
import { getStore } from '../botData/store';
import { Protocol } from '../constants';
import { emulator } from '../emulator';
import { ExtensionManagerImpl } from '../extensions';
import { mainWindow } from '../main';
import { Migrator } from '../migrator';
import { ProtocolHandler } from '../protocolHandler';
import { getStore as getSettingsStore } from '../settingsData/store';
import { getBotsFromDisk } from '../utils';
import { openFileFromCommandLine } from '../utils/openFileFromCommandLine';

/** Registers client initialization commands */
export function registerCommands(commandRegistry: CommandRegistryImpl) {
  const Commands = SharedConstants.Commands;

  // ---------------------------------------------------------------------------
  // Client notifying us it's initialized and has rendered
  commandRegistry.registerCommand(Commands.ClientInit.Loaded, async () => {
    const store = getStore();
    // Load bots from disk and sync list with client
    const bots = getBotsFromDisk();
    if (bots.length) {
      store.dispatch(BotActions.load(bots));
      await mainWindow.commandService.remoteCall(Commands.Bot.SyncBotList, bots);
    } else {
      await Migrator.startup();
    }
    // Reset the app title bar
    await mainWindow.commandService.call(Commands.Electron.SetTitleBar);
    // Un-fullscreen the screen
    await mainWindow.commandService.call(Commands.Electron.SetFullscreen, false);
    // Send app settings to client
    await commandRegistry.getCommand(Commands.Settings.PushClientAwareSettings).handler();
    // Load extensions
    ExtensionManagerImpl.unloadExtensions();
    ExtensionManagerImpl.loadExtensions();
  });

  commandRegistry.registerCommand(Commands.Settings.PushClientAwareSettings, async () => {
    const settingsStore: Store<Settings> = getSettingsStore();
    const settingsState = settingsStore.getState();
    await mainWindow.commandService.remoteCall(Commands.Settings.ReceiveGlobalSettings, {
      serverUrl: (emulator.framework.serverUrl || '').replace('[::]', 'localhost'),
      cwd: (__dirname || '').replace(/\\/g, '/'),
      users: settingsState.users,
      locale: settingsState.framework.locale,
      debugMode: settingsState.windowState.debugMode || DebugMode.Normal,
    } as ClientAwareSettings);
  });

  // ---------------------------------------------------------------------------
  // Client notifying us the welcome screen has been rendered
  commandRegistry.registerCommand(
    Commands.ClientInit.PostWelcomeScreen,
    async (): Promise<void> => {
      await mainWindow.commandService.call(Commands.Electron.UpdateFileMenu);

      // Parse command line args for a protocol url
      const args = process.argv.length ? process.argv.slice(1) : [];
      if (args.some(arg => arg.includes(Protocol))) {
        const protocolArg = args.find(arg => arg.includes(Protocol));
        ProtocolHandler.parseProtocolUrlAndDispatch(protocolArg);
      }

      // Parse command line args to see if we are opening a .bot or .transcript file
      const fileToBeOpened = args.find(arg => /(\.transcript)|(\.bot)$/.test(arg));
      if (fileToBeOpened) {
        await openFileFromCommandLine(fileToBeOpened, mainWindow.commandService);
      }
    }
  );
}
