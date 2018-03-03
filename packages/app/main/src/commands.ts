import * as Electron from 'electron';
import { emulator } from './emulator';
import { Window } from './platform/window';
import { IBot, newBot, CommandRegistry, uniqueId } from '@bfemulator/app-shared';
import { ensureStoragePath, readFileSync, showOpenDialog, writeFile, getSafeBotName } from './utils';
import * as BotActions from './data-v2/action/bot';
import { app } from 'electron';

//=============================================================================
export function registerCommands() {
  //
  // TODO: Move related commands out to own files.
  //
  
  //---------------------------------------------------------------------------
  // Load bots from file system
  CommandRegistry.registerCommand('bot:list:load', (context: Window, ...args: any[]): any => {
    const botsJsonPath = `${ensureStoragePath()}/bots.json`;
    let botsJson = JSON.parse(readFileSync(botsJsonPath));

    if (botsJson && botsJson.bots && Array.isArray(botsJson.bots)) {
      const bots = botsJson.bots;
      // Back-compat: Assign a unique id to the bot if not present.
      bots.forEach(bot => {
        bot.id = bot.id || uniqueId()
      });
      context.store.dispatch(BotActions.load(bots));
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
  CommandRegistry.registerCommand('bot:list:create', (context: Window, ...args: any[]): any => {
    const botName = getSafeBotName();

    const bot: IBot = newBot({
      botName,
      botUrl: 'http://localhost:3978/api/messages',
    });

    context.store.dispatch(BotActions.create(bot));

    return bot;
  });

  //---------------------------------------------------------------------------
  // Delete a bot
  CommandRegistry.registerCommand('bot:list:delete', (context: Window, id: string): any => {
    context.store.dispatch(BotActions.deleteBot(id));
  });

  //---------------------------------------------------------------------------
  // Show explorer prompt to set a local path for a bot
  CommandRegistry.registerCommand('bot:settings:chooseFolder', (context: Window, ...args: any[]): any => {
    return showOpenDialog({ title: 'Choose a folder for your bot', buttonLabel: 'Choose folder', properties: ['openDirectory', 'promptToCreate'] });
  });

  //---------------------------------------------------------------------------
  // Save bot file and cause a bots list write
  CommandRegistry.registerCommand('bot:save', (context: Window, bot: IBot, originalHandle: string): any => {
    context.store.dispatch(BotActions.patch(originalHandle, bot));
  });

  //---------------------------------------------------------------------------
  // Set active bot
  CommandRegistry.registerCommand('bot:setActive', (context: Window, id: string): any => {
    context.store.dispatch(BotActions.setActive(id));
  });

  //---------------------------------------------------------------------------
  // Show OS-native messsage box
  CommandRegistry.registerCommand('shell:showMessageBox', (context: Window, modal: boolean, options: Electron.MessageBoxOptions) => {
    if (modal)
      return Electron.dialog.showMessageBox(context.browserWindow, options);
    else
      return Electron.dialog.showMessageBox(options);
  });

  //---------------------------------------------------------------------------
  // Read file
  CommandRegistry.registerCommand('file:read', (context: Window, path: string): any => {
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
  CommandRegistry.registerCommand('file:write', (context: Window, path: string, contents: object | string): any => {
    try {
      writeFile(path, contents);
    } catch (e) {
      console.error(`Failure writing to file at ${path}: `, e);
      throw e;
    }
  });

  //---------------------------------------------------------------------------
  // Send app settings to client
  CommandRegistry.registerCommand("client:loaded", (context: Window, ...args: any[]): any => {
    context.commandService.remoteCall("settings:emulator:url:set", emulator.framework.router.url);
  });

  //---------------------------------------------------------------------------
  // Create a new livechat conversation
  CommandRegistry.registerCommand("livechat:new", (context: any, ...args: any[]): any => {
    // TODO: Validate a bot is active first
    return uniqueId();
  });

  //---------------------------------------------------------------------------
  // Sets the app's title bar
  CommandRegistry.registerCommand('app:setTitleBar', (context: Window, text: string): any => {
    if (text && text.length)
      context.browserWindow.setTitle(`${app.getName()} - ${text}`);
    else
      context.browserWindow.setTitle(app.getName());
  });
}
