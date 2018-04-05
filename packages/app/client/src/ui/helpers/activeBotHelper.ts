import { getBotDisplayName, IBot } from '@bfemulator/app-shared';
import { hasNonGlobalTabs } from '../../data/editorHelpers';
import { CommandService } from '../../platform/commands/commandService';
import { getActiveBot } from '../../data/botHelpers';
import store from '../../data/store';
import * as BotActions from '../../data/action/botActions';
import * as NavBarActions from '../../data/action/navBarActions';
import * as EditorActions from '../../data/action/editorActions';
import * as ExplorerActions from '../../data/action/explorerActions';
import * as Constants from '../../constants';

export const ActiveBotHelper = new class {

  confirmSwitchBot(): Promise<any> {
    const hasTabs = hasNonGlobalTabs();
    if (hasTabs) {
      return CommandService.remoteCall('shell:showMessageBox', true, {
        type: "question",
        buttons: ["Cancel", "OK"],
        defaultId: 1,
        title: "Switch Bots",
        message: "Are you sure? All tabs will be closed.",
        cancelId: 0,
      });
    } else {
      return Promise.resolve(true);
    }
  }

  /** Uses a bot id to look up the .botproj path and perform a read on the server-side to populate the corresponding bot object */
  setActiveBot(id: string): Promise<any> {
    return CommandService.remoteCall('bot:setActive', id)
      .then(({ bot, botDirectory }) => {
        store.dispatch(BotActions.setActive(bot, botDirectory));
        CommandService.remoteCall('menu:update-recent-bots');
        CommandService.remoteCall('electron:set-title-bar', getBotDisplayName(bot));
      })
      .catch(err => console.error('Error while setting active bot: ', err));
  }

  confirmAndCreateBot(botToCreate: IBot, botDirectory: string): Promise<any> {
    return this.confirmSwitchBot()
      .then((result) => {
        if (result) {
          store.dispatch(EditorActions.closeNonGlobalTabs());
          CommandService.remoteCall('bot:create', botToCreate, botDirectory)
            .then(({ bot, botFilePath }) => {
              console.log(bot, botFilePath);
              store.dispatch((dispatch) => {
                store.dispatch(BotActions.create(bot, botFilePath));
                this.setActiveBot(bot.id)
                .then(() => {
                  CommandService.call('livechat:new');
                  store.dispatch(NavBarActions.select(Constants.NavBar_Files));
                  store.dispatch(ExplorerActions.show(true));
                })
              });
            })
            .catch(err => console.error('Error during bot create: ', err));
        }
      });
  }

  confirmAndSwitchBots(id: string): Promise<any> {
    const activeBot = getActiveBot() || {};
    if (activeBot && activeBot.id === id)
      return Promise.resolve();
    console.log(`Switching to bot ${id}`);
    return this.confirmSwitchBot()
      .then((result) => {
        if (result) {
          store.dispatch(EditorActions.closeNonGlobalTabs());
          this.setActiveBot(id)
            .then(() => {
              CommandService.call('livechat:new');
              store.dispatch(NavBarActions.select(Constants.NavBar_Files));
              store.dispatch(ExplorerActions.show(true));
            })
        }
      })
      .catch(err => console.error('Error while setting active bot: ', err));
  }

  confirmAndDeleteBot(id): Promise<any> {
    return CommandService.remoteCall('shell:showMessageBox', true, {
      type: "question",
      buttons: ["Cancel", "OK"],
      defaultId: 1,
      title: "Delete Bot",
      message: "Are you sure?",
      cancelId: 0,
    })
      .then((result) => {
        if (result) {
          const activeBot = getActiveBot();
          if (activeBot === id)
            store.dispatch(EditorActions.closeNonGlobalTabs());
          CommandService.remoteCall('bot:list:delete', id)
            .then(() => store.dispatch(BotActions.deleteBot(id)))
            .catch(err => console.error('Error during bot delete: ', err));
        }
      })
      .catch(err => console.error('Error while deleting bot: ', err));
  }
}
