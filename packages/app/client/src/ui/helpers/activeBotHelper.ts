import { getBotDisplayName, newBot, newEndpoint } from '@bfemulator/app-shared';
import { IBotConfig, ServiceType, IEndpointService } from '@bfemulator/sdk-shared';

import { CommandService } from '../../platform/commands/commandService';
import { getActiveBot } from '../../data/botHelpers';
import { hasNonGlobalTabs } from '../../data/editorHelpers';
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
    if (hasTabs) {
      return CommandService.remoteCall('shell:show-message-box', true, {
        type: 'question',
        buttons: ["Cancel", "OK"],
        defaultId: 1,
        message: "Close active bot? All tabs will be closed.",
        cancelId: 0,
      });
    } else {
      return Promise.resolve(true);
    }
  }
  /** Uses a .bot path and perform a read on the server-side to populate the corresponding bot object */
  async setActiveBot(botPath: string): Promise<any> {
    try {
      const { bot, botDirectory }: { bot: IBotConfig, botDirectory: string } = await CommandService.remoteCall('bot:set-active', botPath);

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
    } )
      .catch(err => {
        console.error('Error while closing active bot: ', err);
        throw new Error(`Error while closing active bot: ${err}`);
      });
  }
  
  async confirmAndCreateBot(botToCreate: IBotConfig, secret: string): Promise<any> {
    const result = await this.confirmSwitchBot();

    if (result) {
      store.dispatch(EditorActions.closeNonGlobalTabs());

      try {
        const bot: IBotConfig = await CommandService.remoteCall('bot:create', botToCreate, secret);

        // TODO: What are we achieving with this async function here?
        store.dispatch(async () => {
          store.dispatch(BotActions.create(bot, bot.path, secret));

          await this.setActiveBot(bot.path);

          const endpoint: IEndpointService = bot.services.find(service => service.type === ServiceType.Endpoint) as IEndpointService;

          endpoint && CommandService.call('livechat:new', endpoint);

          store.dispatch(NavBarActions.select(Constants.NavBar_Files));
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
      const filename = await this.browseForBotFile()

      try {
        const result = this.confirmSwitchBot();

        if (result) {
          store.dispatch(EditorActions.closeNonGlobalTabs());
          CommandService.remoteCall('bot:load', filename);
        }
      } catch (err) {
        console.log('canceled confirmSwitchBot');
      }
    } catch (err) {
      console.log('canceled browseForBotFile');
    }
  }

  async confirmAndSwitchBots(botPath: string): Promise<any> {
    let activeBot = getActiveBot();

    if (activeBot && activeBot.path === botPath) {
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
        const endpoint: IEndpointService = bot.services.find(service => service.type === ServiceType.Endpoint) as IEndpointService;

        endpoint && CommandService.call('livechat:new', endpoint);

        store.dispatch(NavBarActions.select(Constants.NavBar_Files));
        store.dispatch(ExplorerActions.show(true));
      }
    } catch (err) {
      console.error('Error while setting active bot: ', err);
    }
  }

  confirmAndCloseBot(): Promise<any> {
    let activeBot = getActiveBot();
    if (!activeBot)
      return Promise.resolve();

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

}
