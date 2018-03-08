import * as Electron from 'electron';
import { emulator } from './emulator';
import { Window } from './platform/window';
import { CommandRegistry as CommReg, uniqueId } from '@bfemulator/sdk-shared';
import { IBot, newBot, IFrameworkSettings } from '@bfemulator/app-shared';
import { ensureStoragePath, getBotDirectoryPath, getSafeBotName, readFileSync, showOpenDialog, writeFile, showSaveDialog } from './utils';
import * as BotActions from './data-v2/action/bot';
import { app } from 'electron';
import { mainWindow } from './main';
import { ExtensionManager } from './extensions';
import { getSettings, dispatch } from './settings';
import { getActiveBot } from './botHelpers';
import * as Path from 'path';
import * as Fs from 'fs';
import * as OS from 'os';
import { sync as mkdirpSync } from 'mkdirp';

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
    const botsJsonPath = Path.join(ensureStoragePath(), 'bots.json');
    const botsJsonContents = readFileSync(botsJsonPath);
    let botsJson = botsJsonContents ? JSON.parse(botsJsonContents) : null;

    if (botsJson && botsJson.bots && Array.isArray(botsJson.bots)) {
      const bots = botsJson.bots;
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
  CommandRegistry.registerCommand('bot:create', (bot: IBot): IBot => {
    writeFile(bot.path, bot);
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
  CommandRegistry.registerCommand('bot:save', (bot: IBot) => {
    mainWindow.store.dispatch(BotActions.patch(bot));
  });

  //---------------------------------------------------------------------------
  // Create a new bot object; don't save to state
  CommandRegistry.registerCommand('bot:new', (): IBot => {
    const botName = getSafeBotName();
    const localDir = getBotDirectoryPath(botName);
    const path = Path.join(localDir, '.botproj');

    const bot: IBot = newBot({
      botName,
      botUrl: 'http://localhost:3978/api/messages',
      path,
      localDir
    });
    return bot;
  });

  //---------------------------------------------------------------------------
  // Set active bot
  CommandRegistry.registerCommand('bot:setActive', (path: string): IBot => {
    // read the bot file at path and return the IBot (easier for client-side)
    const contents = readFileSync(path);
    const bot = contents ? JSON.parse(contents) : null;
    mainWindow.store.dispatch(BotActions.setActive(bot));
    return bot;
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
  // Call path.basename()
  CommandRegistry.registerCommand('path:basename', (path: string): string => Path.basename(path));

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
  CommandRegistry.registerCommand('shell:showOpenDialog', (dialogOptions: Electron.OpenDialogOptions = {}): string => {
    return showOpenDialog(mainWindow.browserWindow, dialogOptions);
  });

  //---------------------------------------------------------------------------
  // Shows a save dialog and returns a path + filename
  CommandRegistry.registerCommand('shell:showSaveDialog', (dialogOptions: Electron.SaveDialogOptions = {}): string => {
    return showSaveDialog(mainWindow.browserWindow, dialogOptions);
  });

  //---------------------------------------------------------------------------
  // Saves the conversation to a transcript file, with user interaction to set filename.
  CommandRegistry.registerCommand('emulator:save-transcript-to-file', (conversationId: string): void => {
    const activeBot: IBot = getActiveBot();
    if (!activeBot) {
      throw new Error('save-transcript-to-file: No active bot.');
    }

    const path = Path.resolve(activeBot.localDir) || `${OS.homedir()}/Transcripts`;

    const conversation = emulator.conversations.conversationById(activeBot.id, conversationId);
    if (!conversation) {
      throw new Error(`save-transcript-to-file: Conversation ${conversationId} not found.`);
    }

    const filename = showSaveDialog(mainWindow.browserWindow, {
      filters: [
        {
          name: "Transcript Files",
          extensions: ['transcript']
        }
      ],
      defaultPath: path,
      showsTagField: false,
      title: "Save conversation transcript",
      buttonLabel: "Save"
    });

    if (filename && filename.length) {
      mkdirpSync(Path.dirname(filename));
      writeFile(filename, conversation.activities);
    }
  });
}
