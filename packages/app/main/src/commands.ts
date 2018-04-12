import { newBot, IFrameworkSettings, usersDefault, getBotId, IBotConfig, addIdToBotEndpoints, newEndpoint, getFirstBotEndpoint } from '@bfemulator/app-shared';
import { CommandRegistry as CommReg, IActivity, uniqueId } from '@bfemulator/sdk-shared';
import * as Electron from 'electron';
import { BotConfig } from 'msbot';

import { Window } from './platform/window';
import { ensureStoragePath, getBotsFromDisk, getSafeBotName, readFileSync, showOpenDialog, writeFile, showSaveDialog } from './utils';
import * as BotActions from './data-v2/action/bot';
import { app, Menu } from 'electron';
import * as Fs from 'fs';
import { sync as mkdirpSync } from 'mkdirp';
import * as Path from 'path';
import { AppMenuBuilder } from './appMenuBuilder';
import { getActiveBot, getBotInfoById, pathExistsInRecentBots, encryptBot, decryptBot, IBotConfigToBotConfig } from './botHelpers';
import { BotProjectFileWatcher } from './botProjectFileWatcher';
import { Protocol } from './constants';
import { Conversation } from './conversationManager';
import { emulator } from './emulator';
import { ExtensionManager } from './extensions';
import { mainWindow } from './main';
import { ProtocolHandler } from './protocolHandler';
import { LuisAuthWorkflowService } from './services/luisAuthWorkflowService';
import { dispatch, getSettings } from './settings';

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
  CommandRegistry.registerCommand('bot:create', (bot: IBotConfig, botDirectory: string, secret: string): { bot: IBotConfig, botFilePath: string } => {
    // map IBotConfig from client to BotConfig
    const botConfig: BotConfig = new BotConfig(secret);
    botConfig.name = bot.name;
    botConfig.description = bot.description;
    botConfig.services = bot.services;

    // encrypt bot and write to disk
    const encryptedBot = encryptBot(botConfig, secret);
    const botFilePath = Path.join(botDirectory, bot.name + '.bot');
    encryptedBot.Save(botFilePath);

    // decrypt and add bot to store; return to client to be added to client store
    bot = decryptBot(botConfig, secret);
    mainWindow.store.dispatch(BotActions.create(bot, botFilePath, secret));
    return { bot, botFilePath };
  });

  //---------------------------------------------------------------------------
  // Save bot file and cause a bots list write
  CommandRegistry.registerCommand('bot:save', (bot: IBotConfig, secret?: string) => {
    mainWindow.store.dispatch(BotActions.patch(bot, secret));
  });

  //---------------------------------------------------------------------------
  // Open a bot project from a .bot path
  CommandRegistry.registerCommand('bot:load', (botFilePath: string, botSecret?: string): Promise<IBotConfig> => {
    return BotConfig.Load(botFilePath)
      .then(bot => {
        let botId = getBotId(bot);
        if (!botId) {
          addIdToBotEndpoints(bot);
          botId = getBotId(bot);
        }

        // opening an existing bot, we have the secret
        const botInfo = getBotInfoById(botId);
        if (botInfo && botInfo.secret) {
          botSecret = botInfo.secret;
        }

        // opening a new bot, could have passed secret in via protocol
        if (!botInfo && !pathExistsInRecentBots(botFilePath)) {
          // add the bot to bots.json
          mainWindow.store.dispatch(BotActions.create(bot, botFilePath, botSecret));
        }

        // either way, if we have the secret, decrypt the bot
        if (botSecret) {
          // decrypt the bot
          bot = decryptBot(bot, botSecret);
        }

        const botDirectory = Path.resolve(botFilePath, '..');
        mainWindow.store.dispatch(BotActions.setActive(bot, botDirectory));
        return mainWindow.commandService.remoteCall('bot:load', { bot, botDirectory });
      })
      .catch(err => { throw new Error(`bot:setActive: Error loading bot from path ${botFilePath}: ${err}`); });
  });

  //---------------------------------------------------------------------------
  // Set active bot
  CommandRegistry.registerCommand('bot:setActive', (id: string): Promise<{ bot: IBotConfig, botDirectory: string } | void> => {
    // read the bot file at the id's corresponding path and return the IBotConfig (easier for client-side)
    const botInfo = getBotInfoById(id);

    return BotConfig.Load(botInfo.path, botInfo.secret)
      .then(bot => {
        // set up the file watcher
        const botDirectory = Path.resolve(botInfo.path, '..');
        BotProjectFileWatcher.watch(botDirectory);

        // if the bot's endpoint has a password it needs to be decrypted
        const endpoint = getFirstBotEndpoint(bot);
        if (endpoint && endpoint.appPassword) {
          if (!botInfo.secret)
            throw new Error('bot:setActive: Bot has an endpoint with a msa password, but no secret to decrypt the password!');
          bot = decryptBot(IBotConfigToBotConfig(bot), botInfo.secret);
        }
        mainWindow.store.dispatch(BotActions.setActive(bot, botDirectory));
        return { bot, botDirectory };
      })
      .catch(err => { throw new Error(`bot:setActive: Error loading bot from path ${botInfo.path}: ${err}`); });
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
      url: emulator.framework.router.url,
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

    const conversation = emulator.conversations.conversationById(getBotId(activeBot), conversationId);
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

  //---------------------------------------------------------------------------
  // Feeds a transcript from disk to a conversation
  CommandRegistry.registerCommand('emulator:feed-transcript:disk', (conversationId: string, filename: string) => {
    const activeBot: IBotConfig = getActiveBot();
    if (!activeBot) {
      throw new Error('feed-transcript:disk: No active bot.');
    }

    const conversation = emulator.conversations.conversationById(getBotId(activeBot), conversationId);
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

    const conversation = emulator.conversations.conversationById(getBotId(activeBot), conversationId);
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
    return emulator.getSpeechToken(authIdEvent, conversationId, false);
  });

  //---------------------------------------------------------------------------
  // Refresh a speech token
  CommandRegistry.registerCommand('speech-token:refresh', (authIdEvent: string, conversationId: string) => {
    return emulator.getSpeechToken(authIdEvent, conversationId, true);
  });

  //---------------------------------------------------------------------------
  // Creates a new conversation object
  CommandRegistry.registerCommand('conversation:new', (mode: string): Conversation => {
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
    const conversationId = `${uniqueId()}|${mode}`;
    // TODO: Move away from the .users state on legacy emulator settings, and towards per-conversation users
    const conversation = emulator.conversations.newConversation(getBotId(bot), { id: uniqueId(), name: "User" }, conversationId);
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
}
