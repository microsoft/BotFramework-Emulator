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

import { BotInfo, FrameworkSettings, getBotDisplayName, newBot, newEndpoint } from '@bfemulator/app-shared';
import { Conversation } from '@bfemulator/emulator-core';
import {
  BotConfigWithPath,
  CommandRegistryImpl as CommReg,
  uniqueId,
  mergeEndpoints
} from '@bfemulator/sdk-shared';
import * as Electron from 'electron';
import { app, Menu } from 'electron';
import * as Fs from 'fs';
import { sync as mkdirpSync } from 'mkdirp';
import { IConnectedService, IEndpointService, ServiceType } from 'msbot/bin/schema';
import * as Path from 'path';
import { promisify } from 'util';

import { AppMenuBuilder } from './appMenuBuilder';
import {
  getActiveBot,
  getBotInfoByPath,
  loadBotWithRetry,
  patchBotsJson,
  pathExistsInRecentBots,
  saveBot,
  toSavableBot
} from './botHelpers';
import { BotProjectFileWatcher } from './botProjectFileWatcher';
import { Protocol } from './constants';
import * as BotActions from './data-v2/action/bot';
import { emulator } from './emulator';
import { ExtensionManagerImpl } from './extensions';
import { mainWindow, windowManager } from './main';
import { ProtocolHandler } from './protocolHandler';
import { ContextMenuService } from './services/contextMenuService';
import { LuisAuthWorkflowService } from './services/luisAuthWorkflowService';
import { dispatch, getSettings } from './settings';
import {
  getBotsFromDisk,
  readFileSync,
  showOpenDialog,
  showSaveDialog,
  writeFile,
  showMessageBox,
  parseActivitiesFromChatFile
} from './utils';
import { cleanupId as cleanupActivityChannelAccountId, CustomActivity } from './utils/conversation';
import shell = Electron.shell;
import { getStore } from './data-v2/store';

const store = getStore();
const sanitize = require('sanitize-filename');

// =============================================================================
export const CommandRegistry = new CommReg();

// =============================================================================
export function registerCommands() {
  //
  // TODO: Move related commands out to own files.
  //

  // ---------------------------------------------------------------------------
  CommandRegistry.registerCommand('ping', () => {
    return 'pong';
  });

  // ---------------------------------------------------------------------------
  // Create a bot
  CommandRegistry.registerCommand('bot:create',
    async (
      bot: BotConfigWithPath,
      secret: string
    ): Promise<BotConfigWithPath> => {
      // getStore and add bot entry to bots.json
      const botsJsonEntry: BotInfo = {
        path: bot.path,
        displayName: getBotDisplayName(bot),
        secret
      };
      await patchBotsJson(bot.path, botsJsonEntry);

      // save the bot
      try {
        await saveBot(bot);
      } catch (e) {
        // TODO: make sure these are surfaced on the client side and caught so we can act on them
        console.error(`bot:create: Error trying to save bot: ${e}`);
        throw e;
      }

      return bot;
    });

  // ---------------------------------------------------------------------------
  // Save bot file and cause a bots list write
  CommandRegistry.registerCommand('bot:save', async (bot: BotConfigWithPath) => {
    try {
      await saveBot(bot);
    } catch (e) {
      console.error(`bot:save: Error trying to save bot: ${e}`);
      throw e;
    }
  });

  // ---------------------------------------------------------------------------
  // Opens a bot file at specified path and returns the bot
  CommandRegistry.registerCommand('bot:open',
    async (
      botPath: string,
      secret?: string
    ): Promise<BotConfigWithPath> => {
      // try to get the bot secret from bots.json
      const botInfo = pathExistsInRecentBots(botPath) ? getBotInfoByPath(botPath) : null;
      if (botInfo && botInfo.secret) {
        secret = botInfo.secret;
      }

      // load the bot (decrypt with secret if we were able to get it)
      let bot: BotConfigWithPath;
      try {
        bot = await loadBotWithRetry(botPath, secret);
      } catch (e) {
        const errMessage = `Failed to open the bot with error: ${e.message}`;
        await Electron.dialog.showMessageBox(mainWindow.browserWindow, {
          type: 'error',
          message: errMessage,
        });
        throw new Error(errMessage);
      }
      if (!bot) {
        // user couldn't provide correct secret, abort
        throw new Error('No secret provided to decrypt encrypted bot.');
      }

      return bot;
    });

  // ---------------------------------------------------------------------------
  // Set active bot
  CommandRegistry.registerCommand('bot:set-active', async (bot: BotConfigWithPath): Promise<string> => {
    // set up the file watcher
    const watcher = BotProjectFileWatcher.getInstance();
    await watcher.watch(bot.path);

    // set active bot and active directory
    const botDirectory = Path.dirname(bot.path);
    store.dispatch(BotActions.setActive(bot));
    store.dispatch(BotActions.setDirectory(botDirectory));
    mainWindow.commandService.call('bot:restart-endpoint-service');

    // Workaround for a JSON serialization issue in bot.services where they're an array
    // on the Node side, but deserialize as a dictionary on the renderer side.
    return botDirectory;
  });

  // ---------------------------------------------------------------------------
  // Restart emulator endpoint service
  CommandRegistry.registerCommand('bot:restart-endpoint-service', async () => {
    const bot = getActiveBot();

    emulator.framework.server.botEmulator.facilities.endpoints.reset();

    const overridesArePresent = bot.overrides && bot.overrides.endpoint;
    let appliedOverrides = false;

    bot.services.filter(s => s.type === ServiceType.Endpoint).forEach(service => {
      let endpoint = service as IEndpointService;

      if (overridesArePresent && !appliedOverrides) {
        // if an endpoint id was not specified, apply overrides to first endpoint;
        // otherwise, apply overrides to the matching endpoint
        if (!bot.overrides.endpoint.id) {
          endpoint = mergeEndpoints(endpoint, bot.overrides.endpoint);
          appliedOverrides = true;
        } else if (bot.overrides.endpoint.id === service.id) {
          endpoint = mergeEndpoints(endpoint, bot.overrides.endpoint);
          appliedOverrides = true;
        }
      }

      emulator.framework.server.botEmulator.facilities.endpoints.push(
        endpoint.id,
        {
          botId: endpoint.id,
          botUrl: endpoint.endpoint,
          msaAppId: endpoint.appId,
          msaPassword: endpoint.appPassword
        }
      );
    });
  });

  // ---------------------------------------------------------------------------
  // Close active bot (called from client-side)
  CommandRegistry.registerCommand('bot:close', async (): Promise<void> => {
    BotProjectFileWatcher.getInstance().dispose();
    store.dispatch(BotActions.close());
  });

  // ---------------------------------------------------------------------------
  // Adds or updates an msbot service entry.
  CommandRegistry.registerCommand('bot:add-or-update-service',
    async (
      serviceType: ServiceType,
      service: IConnectedService
    ) => {

      if (!service.id || !service.id.length) {
        service.id = uniqueId();
      }
      const activeBot = getActiveBot();
      const botInfo = activeBot && getBotInfoByPath(activeBot.path);
      if (botInfo) {
        const botConfig = toSavableBot(activeBot, botInfo.secret);
        const index = botConfig.services.findIndex(s => s.id === service.id && s.type === service.type);
        let existing = index >= 0 && botConfig.services[index];
        if (existing) {
          // Patch existing service
          existing = { ...existing, ...service };
          botConfig.services[index] = existing;
        } else {
          // Add new service
          if (service.type !== serviceType) {
            throw new Error('serviceType does not match');
          }
          botConfig.connectService(service);
        }
        try {
          await botConfig.save(botInfo.path);
        } catch (e) {
          console.error(`bot:add-or-update-service: Error trying to save bot: ${e}`);
          throw e;
        }
      }
    });

  // ---------------------------------------------------------------------------
  // Removes an msbot service entry.
  CommandRegistry.registerCommand('bot:remove-service', async (serviceType: ServiceType, serviceId: string) => {
    const activeBot = getActiveBot();
    const botInfo = activeBot && getBotInfoByPath(activeBot.path);
    if (botInfo) {
      const botConfig = toSavableBot(activeBot, botInfo.secret);
      botConfig.disconnectService(serviceType, serviceId);
      try {
        botConfig.save(botInfo.path);
      } catch (e) {
        console.error(`bot:remove-service: Error trying to save bot: ${e}`);
        throw e;
      }
    }
  });

  // ---------------------------------------------------------------------------
  // Patches a bot record in bots.json
  CommandRegistry.registerCommand('bot:list:patch', async (botPath: string, bot: BotInfo): Promise<void> => {
    // patch bots.json and update the store
    await patchBotsJson(botPath, bot);
  });

  // ---------------------------------------------------------------------------
  // Show OS-native messsage box
  CommandRegistry.registerCommand('shell:show-message-box', (modal: boolean, options: Electron.MessageBoxOptions) => {
    options = {
      message: '',
      title: app.getName(),
      ...options
    };
    const args = modal ? [mainWindow.browserWindow, options] : [options];
    return Electron.dialog.showMessageBox.apply(Electron.dialog, args);
  });

  // ---------------------------------------------------------------------------
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

  // ---------------------------------------------------------------------------
  // Write file
  CommandRegistry.registerCommand('file:write', (path: string, contents: object | string) => {
    try {
      writeFile(path, contents);
    } catch (e) {
      console.error(`Failure writing to file at ${path}: `, e);
      throw e;
    }
  });

  // ---------------------------------------------------------------------------
  // Sanitize a string for file name usage
  CommandRegistry.registerCommand('file:sanitize-string', (path: string): string => {
    return sanitize(path);
  });

  // ---------------------------------------------------------------------------
  // Client notifying us it's initialized and has rendered
  CommandRegistry.registerCommand('client:loaded', () => {
    // Load bots from disk and sync list with client
    const bots = getBotsFromDisk();
    store.dispatch(BotActions.load(bots));
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
    ExtensionManagerImpl.unloadExtensions();
    ExtensionManagerImpl.loadExtensions();
  });

  // ---------------------------------------------------------------------------
  // Client notifying us the welcome screen has been rendered
  CommandRegistry.registerCommand('client:post-welcome-screen', async (): Promise<void> => {
    mainWindow.commandService.call('menu:update-recent-bots');

    // Parse command line args for a protocol url
    const args = process.argv.length ? process.argv.slice(1) : [];
    if (args.some(arg => arg.includes(Protocol))) {
      const protocolArg = args.find(arg => arg.includes(Protocol));
      ProtocolHandler.parseProtocolUrlAndDispatch(protocolArg);
    }

    // Parse command line args to see if we are opening a .bot or .transcript file
    if (args.some(arg => /(\.transcript)|(\.bot)$/.test(arg))) {
      const fileToBeOpened = args.find(arg => /(\.transcript)|(\.bot)$/.test(arg));
      if (Path.extname(fileToBeOpened) === '.bot') {
        try {
          const bot = await mainWindow.commandService.call('bot:open', fileToBeOpened);
          await mainWindow.commandService.call('bot:set-active', bot);
          await mainWindow.commandService.remoteCall('bot:load', bot);
        } catch (e) {
          throw new Error(`Error while trying to open a .bot file via double click at: ${fileToBeOpened}`);
        }
      } else if (Path.extname(fileToBeOpened) === '.transcript') {
        const transcript = readFileSync(fileToBeOpened);
        const conversationActivities = JSON.parse(transcript);
        if (!Array.isArray(conversationActivities)) {
          throw new Error('Invalid transcript file contents; should be an array of conversation activities.');
        }

        // open a transcript on the client side and pass in
        // some extra info to differentiate it from a transcript on disk
        mainWindow.commandService.remoteCall('transcript:open', 'deepLinkedTranscript', {
          activities: conversationActivities,
          deepLink: true
        });
      }
    }
  });

  // ---------------------------------------------------------------------------
  // Saves global app settings
  CommandRegistry.registerCommand('app:settings:save', (settings: FrameworkSettings): any => {
    dispatch({
      type: 'Framework_Set',
      state: settings
    });
  });

  // ---------------------------------------------------------------------------
  // Get and return app settings from store
  CommandRegistry.registerCommand('app:settings:load', (...args: any[]): FrameworkSettings => {
    return getSettings().framework;
  });

  // ---------------------------------------------------------------------------
  // Shows an open dialog and returns a path
  CommandRegistry.registerCommand('shell:showOpenDialog', (dialogOptions: Electron.OpenDialogOptions = {}): string => {
    return showOpenDialog(mainWindow.browserWindow, dialogOptions);
  });

  // ---------------------------------------------------------------------------
  // Shows a save dialog and returns a path + filename
  CommandRegistry.registerCommand('shell:showSaveDialog', (dialogOptions: Electron.SaveDialogOptions = {}): string => {
    return showSaveDialog(mainWindow.browserWindow, dialogOptions);
  });

  // ---------------------------------------------------------------------------
  // Shows a message box dialog and returns the index of the selected button as a number
  CommandRegistry.registerCommand('shell:showMessageBox', (dialogOptions: Electron.MessageBoxOptions) => {
    return showMessageBox(mainWindow.browserWindow, dialogOptions);
  });

  // ---------------------------------------------------------------------------
  // Saves the conversation to a transcript file, with user interaction to set filename.
  CommandRegistry.registerCommand('emulator:save-transcript-to-file', async (conversationId: string): Promise<void> => {
    const activeBot: BotConfigWithPath = getActiveBot();
    if (!activeBot) {
      throw new Error('save-transcript-to-file: No active bot.');
    }

    const convo = emulator.framework.server.botEmulator.facilities.conversations.conversationById(conversationId);
    if (!convo) {
      throw new Error(`save-transcript-to-file: Conversation ${conversationId} not found.`);
    }

    const path = Path.resolve(store.getState().bot.currentBotDirectory) || '';

    const filename = showSaveDialog(mainWindow.browserWindow, {
      // TODO - Localization
      filters: [
        {
          name: 'Transcript Files',
          extensions: ['transcript']
        }
      ],
      defaultPath: path,
      showsTagField: false,
      title: 'Save conversation transcript',
      buttonLabel: 'Save'
    });

    // If there is no current bot directory, we should set the directory
    // that the transcript is saved in as the bot directory, copy the botfile over,
    // change the bots.json entry, and watch the directory.
    if (!path && filename && filename.length) {
      const bot = getActiveBot();
      let botInfo = getBotInfoByPath(bot.path);
      const saveableBot = toSavableBot(bot, botInfo.secret);
      const botDirectory = Path.dirname(filename);
      const botPath = Path.join(botDirectory, `${bot.name}.bot`);
      botInfo = { ...botInfo, path: botPath };

      await saveableBot.save(botPath);
      await patchBotsJson(botPath, botInfo);
      const watcher = BotProjectFileWatcher.getInstance();
      await watcher.watch(botPath);
      store.dispatch(BotActions.setDirectory(botDirectory));
    }

    if (filename && filename.length) {
      mkdirpSync(Path.dirname(filename));
      const transcripts = await convo.getTranscript();
      writeFile(filename, transcripts);
    }
  });

  // ---------------------------------------------------------------------------
  // Feeds a transcript from disk to a conversation
  CommandRegistry.registerCommand(
    'emulator:feed-transcript:disk',
    async (conversationId: string, botId: string, userId: string, filePath: string) => {
      const path = Path.resolve(filePath);
      const stat = await promisify(Fs.stat)(path);

      if (!stat || !stat.isFile()) {
        throw new Error(`feed-transcript:disk: File ${filePath} not found.`);
      }

      const activities = JSON.parse(await promisify(Fs.readFile)(path, 'utf-8'));

      mainWindow.commandService.call('emulator:feed-transcript:in-memory', conversationId, botId, userId, activities);

      const { name, ext } = Path.parse(path);
      const fileName = `${name}${ext}`;

      return {
        fileName,
        filePath
      };
    }
  );

  // ---------------------------------------------------------------------------
  // Feeds an in-memory transcript (array of parsed activities) to a conversation
  CommandRegistry.registerCommand(
    'emulator:feed-transcript:in-memory',
    (conversationId: string, botId: string, userId: string, activities: CustomActivity[]): void => {
      const activeBot: BotConfigWithPath = getActiveBot();

      if (!activeBot) {
        throw new Error('emulator:feed-transcript:in-memory: No active bot.');
      }

      const convo = emulator.framework.server.botEmulator.facilities.conversations.conversationById(conversationId);
      if (!convo) {
        throw new Error(`emulator:feed-transcript:deep-link: Conversation ${conversationId} not found.`);
      }

      activities = cleanupActivityChannelAccountId(activities, botId, userId);
      convo.feedActivities(activities);
    }
  );

  // ---------------------------------------------------------------------------
  // Builds a new app menu to reflect the updated recent bots list
  CommandRegistry.registerCommand('menu:update-recent-bots', (): void => {
    // get previous app menu template
    let menu = AppMenuBuilder.menuTemplate;

    // get a file menu template with recent bots added
    const state = store.getState();
    const recentBots = state.bot && state.bot.botFiles ? state.bot.botFiles : [];
    const newFileMenu = AppMenuBuilder.getFileMenu(recentBots);

    // update the app menu to use the new file menu and build the template into a menu
    menu = AppMenuBuilder.setFileMenu(newFileMenu, menu);
    // update stored menu state
    AppMenuBuilder.menuTemplate = menu;
    Menu.setApplicationMenu(Menu.buildFromTemplate(menu));
  });

  // ---------------------------------------------------------------------------
  // Get a speech token
  CommandRegistry.registerCommand('speech-token:get', (endpointId: string, refresh: boolean) => {
    const endpoint = emulator.framework.server.botEmulator.facilities.endpoints.get(endpointId);

    return endpoint && endpoint.getSpeechToken(refresh);
  });

  // ---------------------------------------------------------------------------
  // Creates a new conversation object for transcript
  CommandRegistry.registerCommand('transcript:new', (conversationId: string): Conversation => {
    // get the active bot or mock one
    let bot: BotConfigWithPath = getActiveBot();

    if (!bot) {
      bot = newBot();
      bot.services.push(newEndpoint());
      store.dispatch(BotActions.mockAndSetActive(bot));
    }

    // TODO: Move away from the .users state on legacy emulator settings, and towards per-conversation users
    const conversation = emulator.framework.server.botEmulator.facilities.conversations.newConversation(
      emulator.framework.server.botEmulator,
      null,
      { id: uniqueId(), name: 'User' },
      conversationId
    );

    return conversation;
  });

  // ---------------------------------------------------------------------------
  // Toggles app fullscreen mode
  CommandRegistry.registerCommand('electron:set-fullscreen', (fullscreen: boolean): void => {
    mainWindow.browserWindow.setFullScreen(fullscreen);
    if (fullscreen) {
      Menu.setApplicationMenu(null);
    } else {
      Menu.setApplicationMenu(Menu.buildFromTemplate(AppMenuBuilder.menuTemplate));
    }
  });

  // ---------------------------------------------------------------------------
  // Sets the app's title bar
  CommandRegistry.registerCommand('electron:set-title-bar', (text: string) => {
    if (text && text.length) {
      mainWindow.browserWindow.setTitle(`${app.getName()} - ${text}`);
    } else {
      mainWindow.browserWindow.setTitle(app.getName());
    }
  });

  // ---------------------------------------------------------------------------
  // Retrieve the LUIS authoring key
  CommandRegistry.registerCommand('luis:retrieve-authoring-key', async () => {
    const workflow = LuisAuthWorkflowService.enterAuthWorkflow();
    const { dispatch: storeDispatch } = store;
    const type = 'LUIS_AUTH_STATUS_CHANGED';
    storeDispatch({ type, luisAuthWorkflowStatus: 'inProgress' });
    let result = undefined;
    while (true) {
      const next = workflow.next(result);
      if (next.done) {
        storeDispatch({ type, luisAuthWorkflowStatus: 'ended' });
        if (!result) {
          storeDispatch({ type, luisAuthWorkflowStatus: 'canceled' });
        }
        break;
      }
      result = await next.value;
    }
    return result;
  });

  // ---------------------------------------------------------------------------
  // Displays the context menu for a given element
  CommandRegistry.registerCommand('electron:displayContextMenu', ContextMenuService.showMenuAndWaitForInput);

  // ---------------------------------------------------------------------------
  // Opens an external link
  CommandRegistry.registerCommand('electron:openExternal', shell.openExternal.bind(shell, { activate: true }));

  // ---------------------------------------------------------------------------
  // Sends an OAuth TokenResponse
  CommandRegistry.registerCommand('oauth:send-token-response',
    async (
      connectionName: string,
      conversationId: string,
      token: string
    ) => {

      const convo = emulator.framework.server.botEmulator.facilities.conversations.conversationById(conversationId);
      if (!convo) {
        throw new Error(`oauth:send-token-response: Conversation ${conversationId} not found.`);
      }
      await convo.sendTokenResponse(connectionName, conversationId, false);
    });

  // ---------------------------------------------------------------------------
  // Opens an OAuth login window
  CommandRegistry.registerCommand('oauth:getStore-oauth-window', async (url: string, conversationId: string) => {
    const convo = emulator.framework.server.botEmulator.facilities.conversations.conversationById(conversationId);
    windowManager.createOAuthWindow(url, convo.codeVerifier);
  });

  // ---------------------------------------------------------------------------
  // Open the chat file in a tabbed document as a transcript
  CommandRegistry.registerCommand('chat:open', async (filename: string): Promise<{ activities: CustomActivity[] }> => {
    try {
      const activities = await parseActivitiesFromChatFile(filename);
      return { activities };
    } catch (err) {
      throw new Error(`chat:open: Error calling parseActivitiesFromChatFile(): ${err}`);
    }
  });
}
