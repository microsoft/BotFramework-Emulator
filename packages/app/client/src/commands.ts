import { CommandRegistry } from '@bfemulator/app-shared';
import { showWelcomePage } from "./data/editorHelpers";
import { ActiveBotHelper } from "./ui/helpers/activeBotHelper";
import * as LogService from './platform/log/logService';
import * as SettingsService from './platform/settings/settingsService';
import * as LiveChat from './ui/shell/explorer/liveChatExplorer';

//=============================================================================
export function registerCommands() {

  LogService.registerCommands();
  SettingsService.registerCommands();
  LiveChat.registerCommands();

  //---------------------------------------------------------------------------
  CommandRegistry.registerCommand('welcome-page:show', () => {
    showWelcomePage();
  });

  //---------------------------------------------------------------------------
  CommandRegistry.registerCommand('bot:create', () => {
    ActiveBotHelper.confirmAndCreateBot();
  });
}
