import { addIdToBotEndpoints, getBotId, IFrameworkSettings, newBot, newEndpoint } from '@bfemulator/app-shared';
import { Conversation } from '@bfemulator/emulator-core';
import { CommandRegistry as CommReg, IActivity, IBotConfig, uniqueId } from '@bfemulator/sdk-shared';
import * as Electron from 'electron';
import { app, Menu } from 'electron';
import * as Fs from 'fs';
import { sync as mkdirpSync } from 'mkdirp';
import * as Path from 'path';
import { AppMenuBuilder } from './appMenuBuilder';
import { cloneBot, getActiveBot, getBotInfoById, IBotConfigToBotConfig, loadBotWithRetry, pathExistsInRecentBots } from './botHelpers';
import { BotProjectFileWatcher } from './botProjectFileWatcher';
import { Protocol } from './constants';
import * as BotActions from './data-v2/action/bot';
import { emulator } from './emulator';
import { ExtensionManager } from './extensions';
import { mainWindow } from './main';
import { ProtocolHandler } from './protocolHandler';
import { ContextMenuService } from './services/contextMenuService';
import { LuisAuthWorkflowService } from './services/luisAuthWorkflowService';
import { dispatch, getSettings } from './settings';
import { getBotsFromDisk, readFileSync, showOpenDialog, showSaveDialog, writeFile } from './utils';
import shell = Electron.shell;

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
  // Create a bot
  CommandRegistry.registerCommand('bot:create', async (bot: IBotConfig, botDirectory: string, secret: string): Promise<{ bot: IBotConfig, botFilePath: string }> => {
    // add bot to store; return to client to be added to client store
    const botFilePath = Path.join(botDirectory, bot.name + '.bot');
    mainWindow.store.dispatch(BotActions.create(bot, botFilePath, secret));

    // save the bot
    const botCopy = cloneBot(bot);
    const botConfig = IBotConfigToBotConfig(botCopy, secret);
    if (secret)
      botConfig.validateSecretKey();
    await botConfig.Save(botFilePath);

    return { bot, botFilePath };
  });

  //---------------------------------------------------------------------------
  // Save bot file and cause a bots list write
  CommandRegistry.registerCommand('bot:save', (bot: IBotConfig, secret?: string) => {
    mainWindow.store.dispatch(BotActions.patch(bot, secret));
  });

  //---------------------------------------------------------------------------
  // Open a bot project from a .bot path
  CommandRegistry.registerCommand('bot:load', async (botFilePath: string, secret?: string): Promise<IBotConfig> => {
    // load the bot (and decrypt if we have the secret)
    let bot = await loadBotWithRetry(botFilePath, secret);

    // get or assign the bot id
    let botId = getBotId(bot);
    if (!botId) {
      addIdToBotEndpoints(bot);
      botId = getBotId(bot);
    }

    // opening an existing bot, we have the secret
    const botInfo = getBotInfoById(botId);
    if (botInfo && botInfo.secret) {
      secret = botInfo.secret;
      // reload the bot with the secret
      bot = await loadBotWithRetry(botFilePath, secret);
    }

    // opening a new bot
    if (!botInfo && !pathExistsInRecentBots(botFilePath)) {
      // add the bot to bots.json
      mainWindow.store.dispatch(BotActions.create(bot, botFilePath, secret));
    }

    const botDirectory = Path.dirname(botFilePath);
    mainWindow.store.dispatch(BotActions.setActive(bot, botDirectory));

    return mainWindow.commandService.remoteCall('bot:load', { bot, botDirectory });
  });

  //---------------------------------------------------------------------------
  // Set active bot
  CommandRegistry.registerCommand('bot:setActive', async (id: string): Promise<{ bot: IBotConfig, botDirectory: string } | void> => {
    // read the bot file at the id's corresponding path and return the IBotConfig (easier for client-side)
    const botInfo = getBotInfoById(id);

    // load and decrypt the bot
    let bot = await loadBotWithRetry(botInfo.path, botInfo.secret);
    if (!bot) {
      // user couldn't provide correct secret, abort
      throw new Error('No secret provided to decrypt encrypted bot.');
    }

    // set up the file watcher
    const botDirectory = Path.dirname(botInfo.path);
    BotProjectFileWatcher.watch(botDirectory);

    mainWindow.store.dispatch(BotActions.setActive(bot, botDirectory));

    return { bot, botDirectory };
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
  CommandRegistry.registerCommand('client:loaded', () => {
    // Load bots from disk and sync list with client
    const bots = getBotsFromDisk();
    mainWindow.store.dispatch(BotActions.load(bots));
    mainWindow.commandService.remoteCall('bot:list:sync', bots);
    // Reset the app title bar
    mainWindow.commandService.call('electron:set-title-bar');
    // Un-fullscreen the screen
    mainWindow.commandService.call('electron:set-fullscreen', false);
    // Send app settings to client
    mainWindow.commandService.remoteCall('receive-global-settings', {
      url: emulator.framework.serverUrl,
      cwd: __dirname
    });
    // Load extensions
    ExtensionManager.unloadExtensions();
    ExtensionManager.loadExtensions();
    // Parse command line args for a protocol url
    const args = process.argv.length ? process.argv.slice(1) : [];
    if (args.some(arg => arg.includes(Protocol))) {
      const protocolArg = args.find(arg => arg.includes(Protocol));
      ProtocolHandler.parseProtocolUrlAndDispatch(protocolArg);
    }
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
    const activeBot: IBotConfig = getActiveBot();
    if (!activeBot) {
      throw new Error('save-transcript-to-file: No active bot.');
    }

    const path = Path.resolve(mainWindow.store.getState().bot.currentBotDirectory);
    if (!path || !path.length) {
      throw new Error('save-transcript-to-file: Project directory not set');
    }

    const conversation = emulator.framework.server.botEmulator.facilities.conversations.conversationById(conversationId);
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
      writeFile(filename, conversation.getTranscript());
    }
  });

  //---------------------------------------------------------------------------
  // Feeds a transcript from disk to a conversation
  CommandRegistry.registerCommand('emulator:feed-transcript:disk', (conversationId: string, filename: string) => {
    const activeBot: IBotConfig = getActiveBot();
    if (!activeBot) {
      throw new Error('feed-transcript:disk: No active bot.');
    }

    const conversation = emulator.framework.server.botEmulator.facilities.conversations.conversationById(conversationId);
    if (!conversation) {
      throw new Error(`feed-transcript:disk: Conversation ${conversationId} not found.`);
    }

    const path = Path.resolve(filename);
    const stat = Fs.statSync(path);
    if (!stat || !stat.isFile()) {
      throw new Error(`feed-transcript:disk: File ${filename} not found.`);
    }

    const activities = JSON.parse(readFileSync(path));

    conversation.feedActivities(activities);
  });

  //---------------------------------------------------------------------------
  // Feeds a deep-linked transcript (array of parsed activities) to a conversation
  CommandRegistry.registerCommand('emulator:feed-transcript:deep-link', (conversationId: string, activities: IActivity[]): void => {
    const activeBot: IBotConfig = getActiveBot();
    if (!activeBot) {
      throw new Error('emulator:feed-transcript:deep-link: No active bot.');
    }

    const conversation = emulator.framework.server.botEmulator.facilities.conversations.conversationById(conversationId);
    if (!conversation) {
      throw new Error(`emulator:feed-transcript:deep-link: Conversation ${conversationId} not found.`);
    }

    conversation.feedActivities(activities);
  });

  //---------------------------------------------------------------------------
  // Builds a new app menu to reflect the updated recent bots list
  CommandRegistry.registerCommand('menu:update-recent-bots', (): void => {
    // get previous app menu template
    let menu = AppMenuBuilder.menuTemplate;

    // get a file menu template with recent bots added
    const state = mainWindow.store.getState();
    const recentBots = state.bot && state.bot.botFiles ? state.bot.botFiles : [];
    const newFileMenu = AppMenuBuilder.getFileMenu(recentBots);

    // update the app menu to use the new file menu and build the template into a menu
    menu = AppMenuBuilder.setFileMenu(newFileMenu, menu);
    // update stored menu state
    AppMenuBuilder.menuTemplate = menu;
    Menu.setApplicationMenu(Menu.buildFromTemplate(menu));
  });

  //---------------------------------------------------------------------------
  // Get a speech token
  CommandRegistry.registerCommand('speech-token:get', (authIdEvent: string, conversationId: string) => {
    return emulator.getSpeechToken(false);
  });

  //---------------------------------------------------------------------------
  // Refresh a speech token
  CommandRegistry.registerCommand('speech-token:refresh', (authIdEvent: string, conversationId: string) => {
    return emulator.getSpeechToken(true);
  });

  //---------------------------------------------------------------------------
  // Creates a new conversation object
  CommandRegistry.registerCommand('conversation:new', (mode: string, conversationId?: string): Conversation => {
    if ((mode !== 'transcript') && (mode !== 'livechat')) {
      throw new Error('A mode of either "transcript" or "livechat" must be provided to "conversation:new"');
    }

    // get the active bot or mock one
    let bot: IBotConfig = getActiveBot();
    if (!bot) {
      bot = newBot();
      const endpoint = newEndpoint();
      bot.services.push(endpoint);
      mainWindow.store.dispatch(BotActions.mockAndSetActive(bot));
    }

    // create a conversation object
    conversationId = conversationId || `${uniqueId()}|${mode}`;
    // TODO: Move away from the .users state on legacy emulator settings, and towards per-conversation users
    const conversation = emulator.framework.server.botEmulator.facilities.conversations.newConversation(emulator.framework.server.botEmulator, { id: uniqueId(), name: "User" }, conversationId);
    return conversation;
  });

  //---------------------------------------------------------------------------
  // Toggles app fullscreen mode
  CommandRegistry.registerCommand('electron:set-fullscreen', (fullscreen: boolean): void => {
    mainWindow.browserWindow.setFullScreen(fullscreen);
    if (fullscreen) {
      Menu.setApplicationMenu(null);
    } else {
      Menu.setApplicationMenu(Menu.buildFromTemplate(AppMenuBuilder.menuTemplate));
    }
  });

  //---------------------------------------------------------------------------
  // Sets the app's title bar
  CommandRegistry.registerCommand('electron:set-title-bar', (text: string) => {
    if (text && text.length)
      mainWindow.browserWindow.setTitle(`${app.getName()} - ${text}`);
    else
      mainWindow.browserWindow.setTitle(app.getName());
  });

  //---------------------------------------------------------------------------
  // Retrieve the LUIS authoring key
  CommandRegistry.registerCommand('luis:retrieve-authoring-key', async () => {
    const workflow = LuisAuthWorkflowService.enterAuthWorkflow();
    const { dispatch } = mainWindow.store;
    const type = 'LUIS_AUTH_STATUS_CHANGED';
    dispatch({ type, luisAuthWorkflowStatus: 'inProgress' });
    let result = undefined;
    while (true) {
      const next = workflow.next(result);
      if (next.done) {
        dispatch({ type, luisAuthWorkflowStatus: 'ended' });
        if (!result) {
          dispatch({ type, luisAuthWorkflowStatus: 'canceled' });
        }
        break;
      }
      result = await next.value;
    }
    return result;
  });

  //---------------------------------------------------------------------------
  // Displays the context menu for a given element
  CommandRegistry.registerCommand('electron:displayContextMenu', ContextMenuService.showMenuAndWaitForInput);
//---------------------------------------------------------------------------
  // Opens an external link
  CommandRegistry.registerCommand('electron:openExternal', shell.openExternal.bind(shell));
}
