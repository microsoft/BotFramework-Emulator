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

import { dialog } from 'electron';
import {
  pushClientAwareSettings,
  rememberTheme,
  setAvailableThemes,
  setFrameworkSettings,
  SharedConstants,
} from '@bfemulator/app-shared';
import * as BotActions from '@bfemulator/app-shared/built/state/actions/botActions';
import { Command, CommandServiceImpl, CommandServiceInstance } from '@bfemulator/sdk-shared';

import { Protocol } from '../constants';
import { ExtensionManagerImpl } from '../extensions';
import { Migrator } from '../migrator';
import { ProtocolHandler } from '../protocolHandler';
import { dispatch, getSettings, store } from '../state/store';
import { getBotsFromDisk, getThemes } from '../utils';
import { openFileFromCommandLine } from '../utils/openFileFromCommandLine';
import { AppMenuBuilder } from '../appMenuBuilder';

const Commands = SharedConstants.Commands;

/** Registers client initialization commands */
export class ClientInitCommands {
  @CommandServiceInstance()
  private commandService: CommandServiceImpl;

  // ---------------------------------------------------------------------------
  // Client notifying us it's initialized and has rendered
  @Command(Commands.ClientInit.Loaded)
  protected async clientLoaded() {
    // Load bots from disk and sync list with client
    const bots = getBotsFromDisk();
    if (bots.length) {
      dispatch(BotActions.load(bots));
    } else {
      await Migrator.startup();
    }
    // Reset the app title bar
    await this.commandService.call(Commands.Electron.SetTitleBar);
    // Un-fullscreen the screen
    await this.commandService.call(Commands.Electron.SetFullscreen, false);
    // Send app settings to client
    const { framework, windowState } = store.getState().settings;
    dispatch(rememberTheme(windowState.theme));
    dispatch(setAvailableThemes(getThemes()));
    dispatch(setFrameworkSettings(framework)); // also calls pushClientAwareSettings(), which also starts the Emulator rest server (TODO: separate these out)
    dispatch(pushClientAwareSettings());
    // Load extensions
    ExtensionManagerImpl.unloadExtensions();
    ExtensionManagerImpl.loadExtensions();
  }

  // ---------------------------------------------------------------------------
  // Client notifying us the welcome screen has been rendered
  @Command(Commands.ClientInit.PostWelcomeScreen)
  protected async postWelcomeScreen(): Promise<void> {
    await this.commandService.call(Commands.Electron.UpdateFileMenu);

    // show the data collection modal if necessary
    const { framework = {} } = getSettings();
    if (!framework.hasBeenShownDataCollectionModal) {
      const collectUsageData = await this.commandService.remoteCall<boolean>(Commands.UI.ShowDataCollectionDialog);
      const updatedSettings = {
        ...framework,
        collectUsageData,
        hasBeenShownDataCollectionModal: true,
      };
      dispatch(setFrameworkSettings(updatedSettings));
    }

    // Parse command line args for a protocol url
    const args = process.argv.length ? process.argv.slice(1) : [];
    if (args.some(arg => arg.includes(Protocol))) {
      const protocolArg = args.find(arg => arg.includes(Protocol));
      ProtocolHandler.parseProtocolUrlAndDispatch(protocolArg);
    }

    // Parse command line args to see if we are opening a .bot, .chat, or .transcript file
    const fileToBeOpened = args.find(arg => /(\.transcript)|(\.chat)|(\.bot)$/.test(arg));
    if (fileToBeOpened) {
      await openFileFromCommandLine(fileToBeOpened, this.commandService);
    }

    try {
      await AppMenuBuilder.initAppMenu();
    } catch (err) {
      dialog.showErrorBox(
        'Bot Framework Emulator',
        `An error occurred while initializing the application menu: ${err}`
      );
    }
  }
}
