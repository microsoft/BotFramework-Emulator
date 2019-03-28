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

import * as path from 'path';

import { BotInfo, DebugMode, getBotDisplayName, SharedConstants } from '@bfemulator/app-shared';
import { BotConfigWithPath, CommandRegistryImpl, mergeEndpoints, uniqueId } from '@bfemulator/sdk-shared';
import { BotConfigurationBase } from 'botframework-config/lib';
import { IConnectedService, IEndpointService, ServiceTypes } from 'botframework-config/lib/schema';
import { dialog } from 'electron';

import * as BotActions from '../botData/actions/botActions';
import { setActive } from '../botData/actions/botActions';
import { getStore } from '../botData/store';
import { getStore as getSettingsStore } from '../settingsData/store';
import {
  getActiveBot,
  getBotInfoByPath,
  loadBotWithRetry,
  patchBotsJson,
  pathExistsInRecentBots,
  removeBotFromList,
  saveBot,
  toSavableBot,
} from '../botHelpers';
import { emulator } from '../emulator';
import { mainWindow } from '../main';
import { rememberDebugMode } from '../settingsData/actions/windowStateActions';
import { TelemetryService } from '../telemetry';
import { isMac } from '../utils';
import { botProjectFileWatcher, chatWatcher, transcriptsWatcher } from '../watchers';

/** Registers bot commands */
export function registerCommands(commandRegistry: CommandRegistryImpl) {
  const { Bot } = SharedConstants.Commands;

  // ---------------------------------------------------------------------------
  // Create a bot
  commandRegistry.registerCommand(
    Bot.Create,
    async (bot: BotConfigWithPath, secret: string): Promise<BotConfigWithPath> => {
      // getStore and add bot entry to bots.json
      const dirName = path.dirname(bot.path);
      const botsJsonEntry: BotInfo = {
        path: bot.path,
        displayName: getBotDisplayName(bot),
        secret,
        transcriptsPath: path.join(dirName, './transcripts'),
        chatsPath: path.join(dirName, './dialogs'),
      };
      await patchBotsJson(bot.path, botsJsonEntry);

      // save the bot
      try {
        await saveBot(bot);
      } catch (e) {
        // TODO: make sure these are surfaced on the client side and caught so we can act on them
        // eslint-disable-next-line no-console
        console.error(`${Bot.Create}: Error trying to save bot: ${e}`);
        throw e;
      }

      const telemetryInfo = { path: bot.path, hasSecret: !!secret };
      TelemetryService.trackEvent('bot_create', telemetryInfo);
      return bot;
    }
  );

  // ---------------------------------------------------------------------------
  // Save bot file and cause a bots list write
  commandRegistry.registerCommand(Bot.Save, async (bot: BotConfigWithPath) => {
    await saveBot(bot); // Let this propagate up the stack
  });

  // ---------------------------------------------------------------------------
  // Opens a bot file at specified path and returns the bot
  commandRegistry.registerCommand(
    Bot.Open,
    async (botPath: string, secret?: string): Promise<BotConfigWithPath> => {
      // Make sure we're not in Sidecar debug mode
      getSettingsStore().dispatch(rememberDebugMode(DebugMode.Normal));
      // try to get the bot secret from bots.json
      const botInfo = pathExistsInRecentBots(botPath) ? getBotInfoByPath(botPath) : null;
      if (botInfo) {
        secret = botInfo.secret;
        const dirName = path.dirname(botPath);
        let syncWithClient: boolean;
        if (!botInfo.transcriptsPath) {
          botInfo.transcriptsPath = path.join(dirName, './transcripts');
          syncWithClient = true;
        }
        if (!botInfo.chatsPath) {
          botInfo.chatsPath = path.join(dirName, './dialogs');
          syncWithClient = true;
        }
        if (syncWithClient) {
          const store = getStore();
          await mainWindow.commandService.remoteCall(
            SharedConstants.Commands.Bot.SyncBotList,
            store.getState().bot.botFiles
          );
        }
      }

      // load the bot (decrypt with secret if we were able to get it)
      let bot: BotConfigWithPath;
      try {
        bot = await loadBotWithRetry(botPath, secret);
      } catch (e) {
        await dialog.showErrorBox('Failed to open the bot', e.message);
      }
      if (!bot) {
        // user couldn't provide correct secret, abort
        throw new Error('No secret provided to decrypt encrypted bot.');
      }

      return bot;
    }
  );

  // ---------------------------------------------------------------------------
  // Set active bot
  commandRegistry.registerCommand(
    Bot.SetActive,
    async (bot: BotConfigWithPath): Promise<string> => {
      // set up the file watcher
      await botProjectFileWatcher.watch(bot.path);
      // set active bot and active directory
      const store = getStore();
      const botDirectory = path.dirname(bot.path);
      store.dispatch(BotActions.setActive(bot));
      store.dispatch(BotActions.setDirectory(botDirectory));

      const botInfo = getBotInfoByPath(bot.path) || {};
      const dirName = path.dirname(bot.path);

      const {
        chatsPath = path.join(dirName, './dialogs'),
        transcriptsPath = path.join(dirName, './transcripts'),
      } = botInfo;
      const botFilePath = path.parse(botInfo.path || '').dir;
      const relativeChatsPath = path.relative(botFilePath, chatsPath);
      const relativeTranscriptsPath = path.relative(botFilePath, transcriptsPath);
      const displayedChatsPath = relativeChatsPath.includes('..') ? chatsPath : relativeChatsPath;
      const displayedTranscriptsPath = relativeTranscriptsPath.includes('..')
        ? transcriptsPath
        : relativeTranscriptsPath;
      const sep = isMac() ? path.posix.sep : (path.posix as any).win32.sep;
      await Promise.all([
        chatWatcher.watch(chatsPath),
        transcriptsWatcher.watch(transcriptsPath),
        mainWindow.commandService.remoteCall(Bot.ChatsPathUpdated, `${displayedChatsPath}${sep}**`),
        mainWindow.commandService.remoteCall(Bot.TranscriptsPathUpdated, `${displayedTranscriptsPath}${sep}`),
        mainWindow.commandService.call(Bot.RestartEndpointService),
      ]);
      // Workaround for a JSON serialization issue in bot.services where they're an array
      // on the Node side, but deserialize as a dictionary on the renderer side.
      return botDirectory;
    }
  );

  // ---------------------------------------------------------------------------
  // Restart emulator endpoint service
  commandRegistry.registerCommand(Bot.RestartEndpointService, async () => {
    const bot = getActiveBot();

    emulator.framework.server.botEmulator.facilities.endpoints.reset();

    const overridesArePresent = bot.overrides && bot.overrides.endpoint;
    let appliedOverrides = false;

    bot.services
      .filter(s => s.type === ServiceTypes.Endpoint)
      .forEach(service => {
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

        emulator.framework.server.botEmulator.facilities.endpoints.push(endpoint.id, {
          botId: endpoint.id,
          botUrl: endpoint.endpoint,
          msaAppId: endpoint.appId,
          msaPassword: endpoint.appPassword,
          channelService: (endpoint as any).channelService,
        });
      });
  });

  // ---------------------------------------------------------------------------
  // Close active bot (called from client-side)
  commandRegistry.registerCommand(
    Bot.Close,
    (): void => {
      botProjectFileWatcher.unwatch();
      const store = getStore();
      store.dispatch(BotActions.close());
    }
  );

  // ---------------------------------------------------------------------------
  // Adds or updates an msbot service entry.
  commandRegistry.registerCommand(
    Bot.AddOrUpdateService,
    async (serviceType: ServiceTypes, service: IConnectedService) => {
      if (!service.id || !service.id.length) {
        service.id = uniqueId();
      }
      const activeBot = getActiveBot();
      const botInfo = activeBot && getBotInfoByPath(activeBot.path);
      if (botInfo) {
        const botConfig = toSavableBot(activeBot, botInfo.secret);
        const index = botConfig.services.findIndex(s => s.id === service.id && s.type === service.type);
        const existing = botConfig.services[index];
        if (existing) {
          // Patch existing service
          botConfig.services[index] = BotConfigurationBase.serviceFromJSON({
            ...existing,
            ...service,
          });
        } else {
          // Add new service
          if (service.type !== serviceType) {
            throw new Error('serviceType does not match');
          }
          botConfig.connectService(service);
          TelemetryService.trackEvent('service_add', { type: service.type });
        }
        try {
          await saveBot(botConfig);
          // The file watcher will not pick up this change immediately
          // making the value in the store stale and potentially incorrect
          // so we'll dispatch it right away
          getStore().dispatch(setActive(botConfig));
          await mainWindow.commandService.remoteCall(
            SharedConstants.Commands.Bot.SetActive,
            botConfig,
            botConfig.getPath()
          );
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error(`bot:add-or-update-service: Error trying to save bot: ${e}`);
          throw e;
        }
      }
    }
  );

  // ---------------------------------------------------------------------------
  // Removes an msbot service entry.
  commandRegistry.registerCommand(Bot.RemoveService, async (serviceType: ServiceTypes, serviceOrId: any) => {
    const activeBot = getActiveBot();
    const botInfo = activeBot && getBotInfoByPath(activeBot.path);
    if (botInfo) {
      const botConfig = toSavableBot(activeBot, botInfo.secret);
      const id = typeof serviceOrId === 'string' ? serviceOrId : serviceOrId.id;
      botConfig.disconnectService(id);
      try {
        await saveBot(botConfig);
        getStore().dispatch(setActive(botConfig));
        await mainWindow.commandService.remoteCall(
          SharedConstants.Commands.Bot.SetActive,
          botConfig,
          botConfig.getPath()
        );
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(`bot:remove-service: Error trying to save bot: ${e}`);
        throw e;
      }
    }
  });

  // ---------------------------------------------------------------------------
  // Patches a bot record in bots.json
  commandRegistry.registerCommand(
    Bot.PatchBotList,
    async (botPath: string, botInfo: BotInfo): Promise<boolean> => {
      // patch bots.json and update the store
      await patchBotsJson(botPath, botInfo);

      const dirName = path.dirname(botInfo.path);

      const {
        chatsPath = path.join(dirName, './dialogs'),
        transcriptsPath = path.join(dirName, './transcripts'),
      } = botInfo;

      await Promise.all([chatWatcher.watch(chatsPath), transcriptsWatcher.watch(transcriptsPath)]);

      return true;
    }
  );

  // ---------------------------------------------------------------------------
  // Removes a bot record from bots.json (doesn't delete .bot file)
  commandRegistry.registerCommand(
    Bot.RemoveFromBotList,
    async (botPath: string): Promise<void> => {
      const { ShowMessageBox } = SharedConstants.Commands.Electron;
      const result = await mainWindow.commandService.call(ShowMessageBox, true, {
        type: 'question',
        buttons: ['Cancel', 'OK'],
        defaultId: 1,
        message: `Remove Bot ${botPath} from bots list. Are you sure?`,
        cancelId: 0,
      });
      if (result) {
        await removeBotFromList(botPath).catch();
      }
    }
  );
}
