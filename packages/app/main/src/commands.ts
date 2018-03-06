import * as Electron from 'electron';
import { emulator } from './emulator';
import { Window } from './platform/window';
import { CommandRegistry as CommReg, uniqueId } from '@bfemulator/sdk-shared';
import { IBot, newBot, IFrameworkSettings } from '@bfemulator/app-shared';
import { ensureStoragePath, readFileSync, showOpenDialog, writeFile, getSafeBotName } from './utils';
import * as BotActions from './data-v2/action/bot';
import { app } from 'electron';
import { mainWindow } from './main';
import { ExtensionManager } from './extensions';
import { getSettings, dispatch } from './settings';

//=============================================================================
export const CommandRegistry = new CommReg();

//=============================================================================
export function registerCommands() {
  //
  // TODO: Move related commands out to own files.
  //

  //---------------------------------------------------------------------------
  CommandRegistry.registerCommand('ping', () => {
    return 'pong';
  });

  //---------------------------------------------------------------------------
  // Load bots from file system
  CommandRegistry.registerCommand('bot:list:load', () => {
    const botsJsonPath = `${ensureStoragePath()}/bots.json`;
    let botsJson = JSON.parse(readFileSync(botsJsonPath));

    if (botsJson && botsJson.bots && Array.isArray(botsJson.bots)) {
      const bots = botsJson.bots;
      // Back-compat: Assign a unique id to the bot if not present.
      bots.forEach(bot => {
        bot.id = bot.id || uniqueId()
      });
      mainWindow.store.dispatch(BotActions.load(bots));
    } else {
      botsJson = { 'bots': [] };
    }

    try {
      writeFile(botsJsonPath, botsJson);
    } catch (e) {
      console.error(`Failure writing new bots.json to ${botsJsonPath}: `, e);
      throw e;
    }

    return botsJson;
  });

  //---------------------------------------------------------------------------
  // Create a bot
  CommandRegistry.registerCommand('bot:list:create', (): IBot => {
    const botName = getSafeBotName();

    const bot: IBot = newBot({
      botName,
      botUrl: 'http://localhost:3978/api/messages',
    });

    mainWindow.store.dispatch(BotActions.create(bot));

    return bot;
  });

  //---------------------------------------------------------------------------
  // Delete a bot
  CommandRegistry.registerCommand('bot:list:delete', (id: string) => {
    mainWindow.store.dispatch(BotActions.deleteBot(id));
  });

  //---------------------------------------------------------------------------
  // Save bot file and cause a bots list write
  CommandRegistry.registerCommand('bot:save', (bot: IBot, originalHandle: string) => {
    mainWindow.store.dispatch(BotActions.patch(originalHandle, bot));
  });

  //---------------------------------------------------------------------------
  // Set active bot
  CommandRegistry.registerCommand('bot:setActive', (id: string) => {
    mainWindow.store.dispatch(BotActions.setActive(id));
  });

  //---------------------------------------------------------------------------
  // Show OS-native messsage box
  CommandRegistry.registerCommand('shell:showMessageBox', (modal: boolean, options: Electron.MessageBoxOptions) => {
    if (modal)
      return Electron.dialog.showMessageBox(mainWindow.browserWindow, options);
    else
      return Electron.dialog.showMessageBox(options);
  });

  //---------------------------------------------------------------------------
  // Read file
  CommandRegistry.registerCommand('file:read', (path: string): any => {
    try {
      const contents = readFileSync(path);
      return contents;
    } catch (e) {
      console.error(`Failure reading file at ${path}: `, e);
      throw e;
    }
  });

  //---------------------------------------------------------------------------
  // Write file
  CommandRegistry.registerCommand('file:write', (path: string, contents: object | string) => {
    try {
      writeFile(path, contents);
    } catch (e) {
      console.error(`Failure writing to file at ${path}: `, e);
      throw e;
    }
  });

  //---------------------------------------------------------------------------
  // Client notifying us it's initialized and has rendered
  CommandRegistry.registerCommand("client:loaded", () => {
    // Send app settings to client
    mainWindow.commandService.remoteCall("settings:emulator:url:set", emulator.framework.router.url);
    // LOAD EXTENSIONS
    ExtensionManager.unloadExtensions();
    ExtensionManager.loadExtensions();
  });

  //---------------------------------------------------------------------------
  // Create a new livechat conversation
  CommandRegistry.registerCommand("livechat:new", (): string => {
    // TODO: Validate a bot is active first
    return uniqueId();
  });

  //---------------------------------------------------------------------------
  // Sets the app's title bar
  CommandRegistry.registerCommand('app:setTitleBar', (text: string) => {
    if (text && text.length)
      mainWindow.browserWindow.setTitle(`${app.getName()} - ${text}`);
    else
      mainWindow.browserWindow.setTitle(app.getName());
  });

  //---------------------------------------------------------------------------
  // Saves global app settings
  CommandRegistry.registerCommand('app:settings:save', (settings: IFrameworkSettings): any => {
    dispatch({
      type: 'Framework_Set',
      state: settings
    });
  });

  //---------------------------------------------------------------------------
  // Get and return app settings from store
  CommandRegistry.registerCommand('app:settings:load', (...args: any[]): IFrameworkSettings => {
    return getSettings().framework;
  });

  //---------------------------------------------------------------------------
  // Shows an open dialog and returns a path
  CommandRegistry.registerCommand('shell:showOpenDialog', (dialogOptions: Electron.OpenDialogOptions = {}): any => {
    return showOpenDialog(dialogOptions);
  });
}
