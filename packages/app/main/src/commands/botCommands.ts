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

import {
  getActiveBot,
  getBotInfoByPath,
  loadBotWithRetry,
  patchBotsJson,
  pathExistsInRecentBots,
  saveBot,
  toSavableBot
} from '../botHelpers';
import * as BotActions from '../data-v2/action/bot';
import {
  BotConfigWithPath,
  uniqueId,
  mergeEndpoints,
  CommandRegistryImpl
} from '@bfemulator/sdk-shared';
import { BotInfo, getBotDisplayName, SharedConstants } from '@bfemulator/app-shared';
import { mainWindow } from '../main';
import { emulator } from '../emulator';
import { BotProjectFileWatcher } from '../botProjectFileWatcher';
import { IConnectedService, IEndpointService, ServiceType } from 'msbot/bin/schema';
import * as Path from 'path';
import { getStore } from '../data-v2/store';

const store = getStore();

/** Registers bot commands */
export function registerCommands(commandRegistry: CommandRegistryImpl) {
  const Commands = SharedConstants.Commands;

  // ---------------------------------------------------------------------------
  // Create a bot
  commandRegistry.registerCommand(Commands.Bot.Create,
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
        console.error(`${Commands.Bot.Create}: Error trying to save bot: ${e}`);
        throw e;
      }

      return bot;
    });

  // ---------------------------------------------------------------------------
  // Save bot file and cause a bots list write
  commandRegistry.registerCommand(Commands.Bot.Save, async (bot: BotConfigWithPath) => {
    try {
      await saveBot(bot);
    } catch (e) {
      console.error(`${Commands.Bot.Save}: Error trying to save bot: ${e}`);
      throw e;
    }
  });

  // ---------------------------------------------------------------------------
  // Opens a bot file at specified path and returns the bot
  commandRegistry.registerCommand(Commands.Bot.Open,
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
  commandRegistry.registerCommand(Commands.Bot.SetActive, async (bot: BotConfigWithPath): Promise<string> => {
    // set up the file watcher
    await BotProjectFileWatcher.watch(bot.path);

    // set active bot and active directory
    const botDirectory = Path.dirname(bot.path);
    store.dispatch(BotActions.setActive(bot));
    store.dispatch(BotActions.setDirectory(botDirectory));
    mainWindow.commandService.call(Commands.Bot.RestartEndpointService);

    // Workaround for a JSON serialization issue in bot.services where they're an array
    // on the Node side, but deserialize as a dictionary on the renderer side.
    return botDirectory;
  });

  // ---------------------------------------------------------------------------
  // Restart emulator endpoint service
  commandRegistry.registerCommand(Commands.Bot.RestartEndpointService, async () => {
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
  commandRegistry.registerCommand(Commands.Bot.Close, (): void => {
    BotProjectFileWatcher.dispose();
    store.dispatch(BotActions.close());
  });

  // ---------------------------------------------------------------------------
  // Adds or updates an msbot service entry.
  commandRegistry.registerCommand(Commands.Bot.AddOrUpdateService,
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
  commandRegistry.registerCommand(Commands.Bot.RemoveService, async (serviceType: ServiceType, serviceId: string) => {
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
  commandRegistry.registerCommand(Commands.Bot.PatchBotList, async (botPath: string, bot: BotInfo): Promise<void> => {
    // patch bots.json and update the store
    await patchBotsJson(botPath, bot);
  });
}
