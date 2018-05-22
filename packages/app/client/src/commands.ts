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

import { getBotDisplayName, IBotInfo } from '@bfemulator/app-shared';

import { CommandRegistry as CommReg, uniqueId } from '@bfemulator/sdk-shared';
import { IBotConfig, IEndpointService } from 'msbot/bin/schema';
import { IBotConfigWithPath } from '@bfemulator/sdk-shared';
import * as Constants from './constants';
import * as BotActions from './data/action/botActions';
import * as ChatActions from './data/action/chatActions';
import * as EditorActions from './data/action/editorActions';
import * as FileActions from './data/action/fileActions';
import * as NavBarActions from './data/action/navBarActions';
import { pathExistsInRecentBots } from './data/botHelpers';
import { getTabGroupForDocument, showWelcomePage } from './data/editorHelpers';
import store from './data/store';
import { ExtensionManager } from './extensions';
import { CommandService } from './platform/commands/commandService';
import * as LogService from './platform/log/logService';
import * as SettingsService from './platform/settings/settingsService';
import {
  BotCreationDialog,
  SecretPromptDialog,
  DialogService
} from './ui/dialogs';
import { ActiveBotHelper } from './ui/helpers/activeBotHelper';

//=============================================================================
export const CommandRegistry = new CommReg();

//=============================================================================
export function registerCommands() {

  LogService.registerCommands();
  SettingsService.registerCommands();
  ExtensionManager.registerCommands();

  //---------------------------------------------------------------------------
  CommandRegistry.registerCommand('ping', () => {
    return 'pong';
  });

  //---------------------------------------------------------------------------
  // Shows the welcome page
  CommandRegistry.registerCommand('welcome-page:show', () => {
    showWelcomePage();
  });

  //---------------------------------------------------------------------------
  // Shows a bot creation dialog
  CommandRegistry.registerCommand('bot-creation:show', () => {
    DialogService.showDialog(BotCreationDialog);
  });

  //---------------------------------------------------------------------------
  // Shows a dialog prompting the user for a bot secret
  CommandRegistry.registerCommand('secret-prompt:show', async () => {
    return await DialogService.showDialog(SecretPromptDialog);
  });

  //---------------------------------------------------------------------------
  // Switches the current active bot
  CommandRegistry.registerCommand('bot:switch', (botPath: string) => {
    ActiveBotHelper.confirmAndSwitchBots(botPath);
  });

  //---------------------------------------------------------------------------
  // Closes the current active bot
  CommandRegistry.registerCommand('bot:close', () => {
    ActiveBotHelper.confirmAndCloseBot();
  });


  //---------------------------------------------------------------------------
  // Browse for a .bot file and open it
  CommandRegistry.registerCommand('bot:browse-open', () => {
    ActiveBotHelper.confirmAndOpenBotFromFile();
  });

  //---------------------------------------------------------------------------
  // Completes the client side sync of the bot:load command on the server side
  // (NOTE: should NOT be called by itself; call server side instead)
  CommandRegistry.registerCommand('bot:load', (bot: IBotConfigWithPath): void => {
    if (!pathExistsInRecentBots(bot.path)) {
      // create and switch bots
      ActiveBotHelper.confirmAndCreateBot(bot, '');
      return;
    }
    ActiveBotHelper.confirmAndSwitchBots(bot.path);
  });

  //---------------------------------------------------------------------------
  // Syncs the client side list of bots with bots arg (usually called from server side)
  CommandRegistry.registerCommand('bot:list:sync', async (bots: IBotInfo[]): Promise<void> => {
    store.dispatch(BotActions.load(bots));
    CommandService.remoteCall('menu:update-recent-bots');
  });

  //---------------------------------------------------------------------------
  // Adds a transcript
  CommandRegistry.registerCommand('transcript:add', (filename: string): void => {
    store.dispatch(ChatActions.addTranscript(filename));
  });

  //---------------------------------------------------------------------------
  // Removes a transcript
  CommandRegistry.registerCommand('transcript:remove', (filename: string): void => {
    store.dispatch(ChatActions.removeTranscript(filename));
  });

  //---------------------------------------------------------------------------
  // Opens up bot settings page for a bot
  CommandRegistry.registerCommand('bot-settings:open', (bot: IBotConfig): void => {
    store.dispatch(EditorActions.open(Constants.ContentType_BotSettings, Constants.DocumentId_BotSettings, false));
  });

  //---------------------------------------------------------------------------
  // Switches navbar tab selection
  CommandRegistry.registerCommand('navbar:switchtab', (tabName: string): void => {
    store.dispatch(NavBarActions.select(tabName));
  });

  //---------------------------------------------------------------------------
  // Switches navbar tab selection to Explorer
  CommandRegistry.registerCommand('shell:show-explorer', (): void => {
    store.dispatch(NavBarActions.select(Constants.NavBar_Bot_Explorer));
  });

  //---------------------------------------------------------------------------
  // Switches navbar tab selection to Services
  CommandRegistry.registerCommand('shell:show-services', (): void => {
    store.dispatch(NavBarActions.select(Constants.NavBar_Services));
  });

  //---------------------------------------------------------------------------
  // Open App Settings
  CommandRegistry.registerCommand('shell:show-app-settings', (): void => {
    store.dispatch(EditorActions.open(Constants.ContentType_AppSettings, Constants.DocumentId_AppSettings, true, null));
  });

  //---------------------------------------------------------------------------
  // Open a new emulator tabbed document
  CommandRegistry.registerCommand('livechat:new', (endpoint: IEndpointService) => {
    const documentId = uniqueId();

    store.dispatch(ChatActions.newDocument(
      documentId,
      'livechat',
      { endpointId: endpoint.id }
    ));

    store.dispatch(EditorActions.open(
      Constants.ContentType_LiveChat,
      documentId,
      false
    ));
  });

  //---------------------------------------------------------------------------
  // Open the transcript file in a tabbed document
  CommandRegistry.registerCommand('transcript:open', (filename: string, additionalData?: object) => {
    const tabGroup = getTabGroupForDocument(filename);
    if (!tabGroup) {
      store.dispatch(ChatActions.newDocument(filename, 'transcript', additionalData));
    }
    store.dispatch(EditorActions.open(
      Constants.ContentType_Transcript,
      filename,
      false
    ));
  });

  //---------------------------------------------------------------------------
  // Prompt to open a transcript file, then open it
  CommandRegistry.registerCommand('transcript:prompt-open', () => {
    const dialogOptions = {
      title: 'Open transcript file',
      buttonLabel: 'Choose file',
      properties: ['openFile'],
      filters: [
        {
          name: 'Transcript Files',
          extensions: ['transcript']
        }
      ],
    };
    CommandService.remoteCall('shell:showOpenDialog', dialogOptions)
      .then(filename => {
        if (filename && filename.length) {
          CommandService.call('transcript:open', filename);
        }
      })
      .catch(err => console.error(err));
  });

  //---------------------------------------------------------------------------
  CommandRegistry.registerCommand('file:add', (payload) => {
    store.dispatch(FileActions.addFile(payload));
  });

  //---------------------------------------------------------------------------
  CommandRegistry.registerCommand('file:remove', (path) => {
    store.dispatch(FileActions.removeFile(path));
  });

  //---------------------------------------------------------------------------
  // Sets a bot as active (called from server-side)
  CommandRegistry.registerCommand('bot:set-active', (bot: IBotConfig, botDirectory: string) => {
    store.dispatch(BotActions.setActive(bot));
    store.dispatch(FileActions.setRoot(botDirectory));
    CommandService.remoteCall('menu:update-recent-bots');
    CommandService.remoteCall('electron:set-title-bar', getBotDisplayName(bot));
  });

  //---------------------------------------------------------------------------
  // Toggle inspector dev tools for all open inspectors
  CommandRegistry.registerCommand('shell:toggle-inspector-devtools', () => {
    window.dispatchEvent(new Event('toggle-inspector-devtools'));
  });

  //---------------------------------------------------------------------------
  // An update is ready to install
  CommandRegistry.registerCommand('shell:update-downloaded', (...args: any[]) => {
    // TODO: Show a notification
    console.log('Update available', ...args);
  });

  //---------------------------------------------------------------------------
  // Application is up to date
  CommandRegistry.registerCommand('shell:update-not-available', () => {
    // TODO: Show a notification
    console.log('Application is up to date');
  });

  //---------------------------------------------------------------------------
  // Open the link in the default browser
  CommandRegistry.registerCommand('shell:open-external-link', (url: string) => {
    window.open(url);
  });

  //---------------------------------------------------------------------------
  // Open About dialog
  CommandRegistry.registerCommand('shell:about', () => {
    // TODO: Show about dialog (native dialog box)
  });
}
