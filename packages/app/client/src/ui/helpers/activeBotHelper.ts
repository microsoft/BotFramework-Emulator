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

import { getBotDisplayName } from '@bfemulator/app-shared';
import { IBotConfig, IEndpointService, ServiceType } from 'msbot/bin/schema';
import { IBotConfigWithPath } from '@bfemulator/sdk-shared';
import { hasNonGlobalTabs } from '../../data/editorHelpers';
import { CommandService } from '../../platform/commands/commandService';
import { getActiveBot } from '../../data/botHelpers';
import * as BotActions from '../../data/action/botActions';
import * as Constants from '../../constants';
import * as EditorActions from '../../data/action/editorActions';
import * as ExplorerActions from '../../data/action/explorerActions';
import * as FileActions from '../../data/action/fileActions';
import * as NavBarActions from '../../data/action/navBarActions';
import store from '../../data/store';

export const ActiveBotHelper = new class {
  async confirmSwitchBot(): Promise<any> {
    if (hasNonGlobalTabs()) {
      return await CommandService.remoteCall(
        'shell:show-message-box',
        true,
        {
          buttons: ['Cancel', 'OK'],
          cancelId: 0,
          defaultId: 1,
          message: 'Switch bots? All tabs will be closed.',
          type: 'question'
        }
      );
    } else {
      return true;
    }
  }

  confirmCloseBot(): Promise<any> {
    const hasTabs = hasNonGlobalTabs();
    // TODO - localization
    if (hasTabs) {
      return CommandService.remoteCall('shell:show-message-box', true, {
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

  /** Uses a .bot path and perform a read on the server-side to populate the corresponding bot object */
  async setActiveBot(botPath: string): Promise<any> {
    try {
      const {
        bot,
        botDirectory
      }: { bot: IBotConfig, botDirectory: string }
        = await CommandService.remoteCall('bot:set-active', botPath);

      store.dispatch(BotActions.setActive(bot));
      store.dispatch(FileActions.setRoot(botDirectory));

      CommandService.remoteCall('menu:update-recent-bots');
      CommandService.remoteCall('electron:set-title-bar', getBotDisplayName(bot));
    } catch (err) {
      console.error('Error while setting active bot: ', err);

      throw new Error(`Error while setting active bot: ${ err }`);
    }
  }

  /** tell the server-side the active bot is now closed */
  closeActiveBot(): Promise<any> {
    return CommandService.remoteCall('bot:close')
      .then(() => {
        store.dispatch(BotActions.close());
        CommandService.remoteCall('electron:set-title-bar', '');
      })
      .catch(err => {
        console.error('Error while closing active bot: ', err);
        throw new Error(`Error while closing active bot: ${err}`);
      });
  }

  async botAlreadyOpen(): Promise<any> {
    // TODO - localization
    return await CommandService.remoteCall(
      'shell:show-message-box',
      true,
      {
        buttons: ['OK'],
        cancelId: 0,
        defaultId: 0,
        message: 'This bot is already open. If you\'d like to start a conversation, ' +
        'click on an endpoint from the Bot Explorer pane.',
        type: 'question'
      }
    );
  }

  async confirmAndCreateBot(botToCreate: IBotConfigWithPath, secret: string): Promise<any> {
    const result = await this.confirmSwitchBot();

    if (result) {
      store.dispatch(EditorActions.closeNonGlobalTabs());

      try {
        const bot: IBotConfigWithPath = await CommandService.remoteCall('bot:create', botToCreate, secret);

        // TODO: What are we achieving with this async function here?
        store.dispatch(async () => {
          store.dispatch(BotActions.create(bot, bot.path, secret));

          await this.setActiveBot(bot.path);

          const endpoint: IEndpointService = bot.services
            .find(service => service.type === ServiceType.Endpoint) as IEndpointService;

          if (endpoint) {
            CommandService.call('livechat:new', endpoint);
          }

          store.dispatch(NavBarActions.select(Constants.NAVBAR_BOT_EXPLORER));
          store.dispatch(ExplorerActions.show(true));
        });
      } catch (err) {
        console.error('Error during bot create: ', err);
      }
    }
  }

  browseForBotFile(): Promise<any> {
    return CommandService.remoteCall(
      'shell:showOpenDialog',
      {
        buttonLabel: 'Choose file',
        filters: [{
          extensions: ['bot'],
          name: 'Bot Files'
        }],
        properties: ['openFile'],
        title: 'Open bot file'
      }
    );
  }

  async confirmAndOpenBotFromFile(): Promise<any> {
    try {
      const filename = await this.browseForBotFile();

      if (filename) {
        let activeBot = getActiveBot();
        if (activeBot && activeBot.path === filename) {
          await this.botAlreadyOpen();
          return;
        }

        try {
          const result = this.confirmSwitchBot();

          if (result) {
            store.dispatch(EditorActions.closeNonGlobalTabs());
            await CommandService.remoteCall('bot:load', filename);
          }
        } catch (err) {
          console.error('Error while calling confirmSwitchBot: ', err);
        }
      }
    } catch (err) {
      console.error('Error while calling browseForBotFile: ', err);
    }
  }

  async confirmAndSwitchBots(botPath: string): Promise<any> {
    let activeBot = getActiveBot();

    if (activeBot && activeBot.path === botPath) {
      await this.botAlreadyOpen();
      return;
    }

    // TODO: We need to think about merging this with confirmAndCreateBot
    console.log(`Switching to bot ${ botPath }`);

    try {
      const result = await this.confirmSwitchBot();

      if (result) {
        store.dispatch(EditorActions.closeNonGlobalTabs());

        await this.setActiveBot(botPath);

        const bot = getActiveBot();
        const endpoint: IEndpointService = bot.services
          .find(service => service.type === ServiceType.Endpoint) as IEndpointService;

        if (endpoint) {
          await CommandService.call('livechat:new', endpoint);
        }

        store.dispatch(NavBarActions.select(Constants.NAVBAR_BOT_EXPLORER));
        store.dispatch(ExplorerActions.show(true));
      }
    } catch (err) {
      console.error('Error while setting active bot: ', err);
    }
  }

  confirmAndCloseBot(): Promise<any> {
    let activeBot = getActiveBot();
    if (!activeBot) {
      return Promise.resolve();
    }

    console.log(`Closing active bot`);

    return this.confirmCloseBot()
      .then((result) => {
        if (result) {
          store.dispatch(EditorActions.closeNonGlobalTabs());
          this.closeActiveBot()
            .catch(err => new Error(err));
        }
      })
      .catch(err => console.error('Error while closing active bot: ', err));
  }
};
