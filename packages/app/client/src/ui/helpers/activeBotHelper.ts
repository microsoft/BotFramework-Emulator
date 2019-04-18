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

import { getBotDisplayName, newNotification, SharedConstants } from '@bfemulator/app-shared';
import { BotConfigWithPath, mergeEndpoints } from '@bfemulator/sdk-shared';
import { IEndpointService, ServiceTypes } from 'botframework-config/lib/schema';

import * as Constants from '../../constants';
import * as BotActions from '../../data/action/botActions';
import * as EditorActions from '../../data/action/editorActions';
import * as ExplorerActions from '../../data/action/explorerActions';
import * as FileActions from '../../data/action/fileActions';
import * as NavBarActions from '../../data/action/navBarActions';
import { beginAdd } from '../../data/action/notificationActions';
import { getActiveBot } from '../../data/botHelpers';
import { hasNonGlobalTabs } from '../../data/editorHelpers';
import { store } from '../../data/store';
import { CommandServiceImpl } from '../../platform/commands/commandServiceImpl';

const { Bot, Electron, Telemetry } = SharedConstants.Commands;

export const ActiveBotHelper = new (class {
  async confirmSwitchBot(): Promise<any> {
    if (hasNonGlobalTabs()) {
      return await CommandServiceImpl.remoteCall(Electron.ShowMessageBox, true, {
        buttons: ['Cancel', 'OK'],
        cancelId: 0,
        defaultId: 1,
        message: 'Switch bots? All tabs will be closed.',
        type: 'question',
      });
    } else {
      return true;
    }
  }

  confirmCloseBot(): Promise<any> {
    const hasTabs = hasNonGlobalTabs();
    // TODO - localization
    if (hasTabs) {
      return CommandServiceImpl.remoteCall(SharedConstants.Commands.Electron.ShowMessageBox, true, {
        type: 'question',
        buttons: ['Cancel', 'OK'],
        defaultId: 1,
        message: 'Close active bot? All tabs will be closed.',
        cancelId: 0,
      });
    } else {
      return Promise.resolve(true);
    }
  }

  /** Sets a bot as active
   *  @param bot Bot to set as active
   */
  async setActiveBot(bot: BotConfigWithPath): Promise<any> {
    try {
      // set the bot as active on the server side
      const botDirectory = await CommandServiceImpl.remoteCall(SharedConstants.Commands.Bot.SetActive, bot);
      store.dispatch(BotActions.setActiveBot(bot));
      store.dispatch(FileActions.setRoot(botDirectory));

      // update the app file menu and title bar
      await Promise.all([
        CommandServiceImpl.remoteCall(SharedConstants.Commands.Electron.UpdateFileMenu),
        CommandServiceImpl.remoteCall(SharedConstants.Commands.Electron.SetTitleBar, getBotDisplayName(bot)),
      ]);
    } catch (e) {
      const errMsg = `Error while setting active bot: ${e}`;
      const notification = newNotification(errMsg);
      store.dispatch(beginAdd(notification));
      throw new Error(errMsg);
    }
  }

  /** tell the server-side the active bot is now closed */
  closeActiveBot(): Promise<any> {
    return CommandServiceImpl.remoteCall(Bot.Close)
      .then(() => {
        store.dispatch(BotActions.closeBot());
        CommandServiceImpl.remoteCall(SharedConstants.Commands.Electron.SetTitleBar, '');
      })
      .catch(err => {
        const errMsg = `Error while closing active bot: ${err}`;
        const notification = newNotification(errMsg);
        store.dispatch(beginAdd(notification));
        throw new Error(errMsg);
      });
  }

  async botAlreadyOpen(): Promise<any> {
    // TODO - localization
    return await CommandServiceImpl.remoteCall(Electron.ShowMessageBox, true, {
      buttons: ['OK'],
      cancelId: 0,
      defaultId: 0,
      message:
        "This bot is already open. If you'd like to start a conversation, " +
        'click on an endpoint from the Bot Explorer pane.',
      type: 'question',
    });
  }

  async confirmAndCreateBot(botToCreate: BotConfigWithPath, secret: string): Promise<any> {
    // prompt the user to confirm the switch
    const result = await this.confirmSwitchBot();

    if (result) {
      store.dispatch(EditorActions.closeNonGlobalTabs());

      try {
        // create the bot and save to disk
        const bot: BotConfigWithPath = await CommandServiceImpl.remoteCall(
          SharedConstants.Commands.Bot.Create,
          botToCreate,
          secret
        );
        // set the bot as active
        await this.setActiveBot(botToCreate);
        // open a livechat session with the bot
        const endpoint: IEndpointService = bot.services.find(
          service => service.type === ServiceTypes.Endpoint
        ) as IEndpointService;

        if (endpoint) {
          CommandServiceImpl.call(SharedConstants.Commands.Emulator.NewLiveChat, endpoint);
        }

        store.dispatch(NavBarActions.select(Constants.NAVBAR_BOT_EXPLORER));
        store.dispatch(ExplorerActions.showExplorer(true));
      } catch (err) {
        const errMsg = `Error during bot create: ${err}`;
        const notification = newNotification(errMsg);
        store.dispatch(beginAdd(notification));
        throw new Error(errMsg);
      }
    }
  }

  browseForBotFile(): Promise<any> {
    return CommandServiceImpl.remoteCall(Electron.ShowOpenDialog, {
      buttonLabel: 'Choose file',
      filters: [
        {
          extensions: ['bot'],
          name: 'Bot Files',
        },
      ],
      properties: ['openFile'],
      title: 'Open bot file',
    });
  }

  async confirmAndOpenBotFromFile(filename?: string): Promise<any> {
    try {
      if (!filename) {
        filename = await this.browseForBotFile();
      }

      if (filename) {
        const activeBot = getActiveBot();
        if (activeBot && activeBot.path === filename) {
          await CommandServiceImpl.call(SharedConstants.Commands.Bot.Switch, activeBot);
          return;
        }
        const result = this.confirmSwitchBot();

        if (result) {
          store.dispatch(EditorActions.closeNonGlobalTabs());
          const bot = await CommandServiceImpl.remoteCall(SharedConstants.Commands.Bot.Open, filename);
          if (!bot) {
            return;
          }
          await CommandServiceImpl.remoteCall(SharedConstants.Commands.Bot.SetActive, bot);
          await CommandServiceImpl.call(SharedConstants.Commands.Bot.Load, bot);
          const numOfServices = bot.services && bot.services.length;
          CommandServiceImpl.remoteCall(Telemetry.TrackEvent, `bot_open`, {
            method: 'file_browse',
            numOfServices,
          }).catch(_e => void 0);
        }
      }
    } catch (err) {
      throw new Error(`[confirmAndOpenBotFromFile] Error while calling browseForBotFile: ${err}`);
    }
  }

  /**
   * Prompts the user to switch bots if necessary, and then sets the bot as active and opens
   * a livechat session.
   * @param bot The bot to be switched to. Can be a bot object with a path, or the bot path itself
   */
  async confirmAndSwitchBots(bot: BotConfigWithPath | string): Promise<any> {
    const currentActiveBot = getActiveBot();
    const botPath = typeof bot === 'object' ? bot.path : bot;

    if (currentActiveBot && currentActiveBot.path === botPath) {
      // the bot is already open, so open a new live chat tab
      try {
        await CommandServiceImpl.call(SharedConstants.Commands.Emulator.NewLiveChat, currentActiveBot.services[0]);
      } catch (e) {
        throw new Error(`[confirmAndSwitchBots] Error while trying to open bot at ${botPath}: ${e}`);
      }
      return;
    }

    // TODO: We need to think about merging this with confirmAndCreateBot
    // eslint-disable-next-line no-console
    console.log(`Switching to bot ${botPath}`);

    try {
      // prompt the user to confirm the switch
      const result = await this.confirmSwitchBot();

      if (result) {
        store.dispatch(EditorActions.closeNonGlobalTabs());
        // if we only have the bot path, we first need to open the bot file
        let newActiveBot: BotConfigWithPath;
        if (typeof bot === 'string') {
          try {
            newActiveBot = await CommandServiceImpl.remoteCall(SharedConstants.Commands.Bot.Open, bot);
          } catch (e) {
            throw new Error(`[confirmAndSwitchBots] Error while trying to open bot at ${botPath}: ${e}`);
          }
        } else {
          newActiveBot = bot;
        }

        // set the bot as active
        await this.setActiveBot(newActiveBot);

        // find a suitable endpoint configuration
        let endpoint: IEndpointService;
        const overridesArePresent = newActiveBot.overrides && newActiveBot.overrides.endpoint;

        // if an endpoint id was specified, use that endpoint, otherwise use the first endpoint found
        if (overridesArePresent && newActiveBot.overrides.endpoint.id) {
          endpoint = newActiveBot.services.find(
            service => service.type === ServiceTypes.Endpoint && service.id === newActiveBot.overrides.endpoint.id
          ) as IEndpointService;
        } else {
          endpoint = newActiveBot.services.find(service => service.type === ServiceTypes.Endpoint) as IEndpointService;
        }

        // apply endpoint overrides here
        if (endpoint && overridesArePresent) {
          endpoint = mergeEndpoints(endpoint, newActiveBot.overrides.endpoint);
        }

        // open a livechat with the configured endpoint
        if (endpoint) {
          await CommandServiceImpl.call(SharedConstants.Commands.Emulator.NewLiveChat, endpoint);
        }

        store.dispatch(NavBarActions.select(Constants.NAVBAR_BOT_EXPLORER));
        store.dispatch(ExplorerActions.showExplorer(true));
      }
    } catch (e) {
      const errMsg = `Error while trying to switch to bot: ${botPath}`;
      const notification = newNotification(errMsg);
      store.dispatch(beginAdd(notification));
      throw new Error(errMsg);
    }
  }

  confirmAndCloseBot(): Promise<any> {
    const activeBot = getActiveBot();
    if (!activeBot) {
      return Promise.resolve();
    }

    // eslint-disable-next-line no-console
    console.log(`Closing active bot`);

    return this.confirmCloseBot()
      .then(result => {
        if (result) {
          store.dispatch(EditorActions.closeNonGlobalTabs());
          this.closeActiveBot().catch(err => new Error(err));
        }
      })
      .catch(err => {
        const errMsg = `Error while closing active bot: ${err}`;
        const notification = newNotification(errMsg);
        store.dispatch(beginAdd(notification));
        throw new Error(errMsg);
      });
  }
})();
