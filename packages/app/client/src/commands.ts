import { CommandRegistry as CommReg, IExtensionConfig } from '@bfemulator/sdk-shared';
import { showWelcomePage } from "./data/editorHelpers";
import { ActiveBotHelper } from "./ui/helpers/activeBotHelper";
import * as LogService from './platform/log/logService';
import * as SettingsService from './platform/settings/settingsService';
import * as LiveChat from './ui/shell/explorer/liveChatExplorer';
import { ExtensionManager } from './extensions';

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
  CommandRegistry.registerCommand('bot:create', () => {
    ActiveBotHelper.confirmAndCreateBot();
  });
}
