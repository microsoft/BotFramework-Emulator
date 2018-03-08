import { getBotDisplayName, IBot } from '@bfemulator/app-shared';
import { hasNonGlobalTabs } from '../../data/editorHelpers';
import { CommandService } from '../../platform/commands/commandService';
import { getActiveBot } from '../../data/botHelpers';
import store from '../../data/store';
import * as BotActions from '../../data/action/botActions';
import * as NavBarActions from '../../data/action/navBarActions';
import * as EditorActions from '../../data/action/editorActions';
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

  /** Uses a bot project path to read the file on server-side and set the corresponding bot object as active */
  setActiveBot(path): Promise<any> {
    return CommandService.remoteCall('bot:setActive', path)
      .then(bot => {
        store.dispatch(BotActions.setActive(bot));
        CommandService.remoteCall('app:setTitleBar', getBotDisplayName(bot));
      })
      .catch(err => console.error('Error while setting active bot: ', err));
  }

  confirmAndCreateBot(botToCreate: IBot): Promise<any> {
    return this.confirmSwitchBot()
      .then((result) => {
        if (result) {
          store.dispatch(EditorActions.closeNonGlobalTabs());
          CommandService.remoteCall('bot:create', botToCreate)
            .then(bot => {
              store.dispatch((dispatch) => {
                store.dispatch(BotActions.create(bot));
                this.setActiveBot(bot.path);

                // open bot settings and switch to explorer view
                store.dispatch(NavBarActions.select(Constants.NavBar_Files));
                store.dispatch(EditorActions.open(Constants.ContentType_BotSettings, "Bot Settings", false, bot.id));
              });
            })
            .catch(err => console.error('Error during bot create: ', err));
        }
      });
  }

  confirmAndSwitchBots(path: string): Promise<any> {
    const activeBot = getActiveBot() || {};
    if (activeBot.path === path)
      return Promise.resolve();
    return this.confirmSwitchBot()
      .then((result) => {
        if (result) {
          store.dispatch(EditorActions.closeNonGlobalTabs());
          this.setActiveBot(path)
            .then(() => {
              CommandService.call('livechat:new');
              store.dispatch(NavBarActions.select(Constants.NavBar_Files));
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
