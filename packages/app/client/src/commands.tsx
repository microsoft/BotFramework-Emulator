import * as React from 'react';

import { CommandRegistry as CommReg, IExtensionConfig } from '@bfemulator/sdk-shared';
import { IBot } from '@bfemulator/app-shared';
import { showWelcomePage } from "./data/editorHelpers";
import { ActiveBotHelper } from "./ui/helpers/activeBotHelper";
import * as LogService from './platform/log/logService';
import * as SettingsService from './platform/settings/settingsService';
import * as LiveChat from './ui/shell/explorer/liveChatExplorer';
import { ExtensionManager } from './extensions';
import BotCreationDialog from './ui/dialogs/botCreationDialog';
import { DialogService } from './ui/dialogs/service';
import store from './data/store';
import * as ChatActions from './data/action/chatActions';

//=============================================================================
export const CommandRegistry = new CommReg();

//=============================================================================
export function registerCommands() {

  LogService.registerCommands();
  SettingsService.registerCommands();
  LiveChat.registerCommands();
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
    // TODO: convert store to typescript so we don't have to cast
    const state = store.getState() as any;
    const activeEditor = state.editor.activeEditor;
    const dialog = <BotCreationDialog activeEditor={ activeEditor } />;
    DialogService.showDialog(dialog);
  });

  //---------------------------------------------------------------------------
  // Adds a transcript
  CommandRegistry.registerCommand('transcript:add', (fileName: string): void => {
    console.log('got transcript add');
    store.dispatch(ChatActions.addTranscript(fileName));
  });

  //---------------------------------------------------------------------------
  // Removes a transcript
  CommandRegistry.registerCommand('transcript:remove', (fileName: string): void => {
    console.log('got transcript remove');
    store.dispatch(ChatActions.removeTranscript(fileName));
  });
}
