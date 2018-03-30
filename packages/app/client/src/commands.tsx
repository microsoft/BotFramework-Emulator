import * as React from 'react';

import { CommandRegistry as CommReg, IExtensionConfig } from '@bfemulator/sdk-shared';
import { IBot, IBotInfo } from '@bfemulator/app-shared';
import { showWelcomePage } from "./data/editorHelpers";
import { ActiveBotHelper } from './ui/helpers/activeBotHelper';
import * as LogService from './platform/log/logService';
import * as SettingsService from './platform/settings/settingsService';
import * as LiveChat from './ui/shell/explorer/liveChatExplorer';
import { ExtensionManager } from './extensions';
import BotCreationDialog from './ui/dialogs/botCreationDialog';
import { DialogService } from './ui/dialogs/service';
import store from './data/store';
import * as ChatActions from './data/action/chatActions';
import * as EditorActions from './data/action/editorActions';
import * as NavBarActions from './data/action/navBarActions';
import * as Constants from './constants';
import { uniqueId } from '@bfemulator/sdk-shared';
import { getTabGroupForDocument } from './data/editorHelpers';
import { CommandService } from './platform/commands/commandService';
import { getBotInfoById } from './data/botHelpers';
import * as BotActions from './data/action/botActions';

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
  CommandRegistry.registerCommand('welcome-page:show', () => {
    showWelcomePage();
  });

  //---------------------------------------------------------------------------
  // Shows a bot creation dialog
  CommandRegistry.registerCommand('bot-creation:show', () => {
    const dialog = <BotCreationDialog />;
    DialogService.showDialog(dialog);
  });

  //---------------------------------------------------------------------------
  // Switches the current active bot
  CommandRegistry.registerCommand('bot:switch', (id: string) => {
    ActiveBotHelper.confirmAndSwitchBots(id);
  });

  //---------------------------------------------------------------------------
  // Completes the client side sync of the bot:load command on the server side
  // (NOTE: should NOT be called by itself; call server side instead)
  CommandRegistry.registerCommand('bot:load', ({ bot, botDirectory }: { bot: IBot, botDirectory: string }): void => {
      if (!getBotInfoById(bot.id)) {
        // create and switch bots
        ActiveBotHelper.confirmAndCreateBot(bot, botDirectory);
        return;
      }
      ActiveBotHelper.confirmAndSwitchBots(bot.id);
  });


  //---------------------------------------------------------------------------
  // Syncs the client side list of bots with bots arg (usually called from server side)
  CommandRegistry.registerCommand('bot:list:sync', (bots: IBotInfo[]): void => {
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
  CommandRegistry.registerCommand('bot-settings:open', (bot: IBot): void => {
    store.dispatch(EditorActions.open(Constants.ContentType_BotSettings, Constants.DocumentId_BotSettings, false, bot.id));
  });

  //---------------------------------------------------------------------------
  // Switches navbar tab selection
  CommandRegistry.registerCommand('navbar:switchtab', (tabName: string): void => {
    store.dispatch(NavBarActions.select(tabName));
  });

  //---------------------------------------------------------------------------
  // Open a new emulator tabbed document
  CommandRegistry.registerCommand('livechat:new', () => {
    const documentId = uniqueId();
    store.dispatch(ChatActions.newDocument(documentId, "livechat"));
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
      store.dispatch(ChatActions.newDocument(filename, "transcript", additionalData));
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
          name: "Transcript Files",
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
}
