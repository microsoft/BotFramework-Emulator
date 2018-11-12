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

import { BotInfo, SharedConstants } from '@bfemulator/app-shared';
import * as Electron from 'electron';
import { AppUpdater, UpdateStatus } from './appUpdater';
import { emulator } from './emulator';

import { mainWindow } from './main';
import { ConversationService } from './services/conversationService';
import { rememberTheme } from './settingsData/actions/windowStateActions';
import { getStore as getSettingsStore } from './settingsData/store';
import { getActiveBot } from './botHelpers';

declare type MenuOpts = Electron.MenuItemConstructorOptions;

export interface AppMenuBuilder {
  getMenuTemplate: () => Promise<MenuOpts[]>;
  setMenuTemplate: (template: MenuOpts[]) => void;

  getFileMenu: (recentBots?: BotInfo[]) => Promise<MenuOpts>;
  getConversationMenu: () => Promise<MenuOpts>;

  putFileMenu: (fileMenuTemplate: MenuOpts, appMenuTemplate: MenuOpts[]) => MenuOpts[];
}

export const AppMenuBuilder = new class AppMenuBuilderImpl implements AppMenuBuilder {
  private _menuTemplate: MenuOpts[];

  /** Allows preservation of menu state without having to completely rebuild the menu template */
  async getMenuTemplate(): Promise<MenuOpts[]> {
    if (!this._menuTemplate) {
      this._menuTemplate = await this.createMenuTemplate();
    }

    return this._menuTemplate;
  }

  setMenuTemplate(template: MenuOpts[]) {
    this._menuTemplate = template;
  }

  /** Constructs a file menu template. If recentBots is passed in, will add recent bots list to menu */
  async getFileMenu(recentBots?: BotInfo[]): Promise<MenuOpts> {
    const { Azure, UI, Bot, Emulator } = SharedConstants.Commands;

    // TODO - localization
    let subMenu: MenuOpts[] = [
      {
        label: 'New Bot Configuration...',
        click: () => {
          mainWindow.commandService.remoteCall(UI.ShowBotCreationDialog);
        }
      },
      { type: 'separator' },
      {
        label: 'Open Bot Configuration...',
        click: () => {
          mainWindow.commandService.remoteCall(Bot.OpenBrowse);
        }
      }];

    if (recentBots && recentBots.length) {
      const recentBotsList = await this.getRecentBotsList(recentBots);
      
      subMenu.push({
        label: 'Open Recent...',
        submenu: [...recentBotsList]
      });
    } else {
      subMenu.push({
        label: 'Open Recent...',
        enabled: false
      });
    }

    subMenu.push({ type: 'separator' });

    subMenu.push({
        label: 'Open Transcript...',
        click: async () => {
          try {
            mainWindow.commandService.remoteCall(Emulator.PromptToOpenTranscript);
          } catch (err) {
            console.error('Error opening transcript file from menu: ', err);
          }
        }
      },
      { type: 'separator' }
    );

    const activeBot = getActiveBot();

    if (activeBot !== null) {
      subMenu.push({
        label: 'Close Tab',
        click: async () => {
          await mainWindow.commandService.remoteCall(Bot.Close);
          await mainWindow.commandService.call(SharedConstants.Commands.Electron.UpdateFileMenu);
        }
      });
    } else {
      subMenu.push({
        label: 'Close Tab',
        enabled: false
      });
    }

    const settingsStore = getSettingsStore();
    const settingsState = settingsStore.getState();

    const { signedInUser } = settingsState.azure;
    const azureMenuItemLabel = signedInUser ? `Sign out (${signedInUser})` : 'Sign in with Azure';

    subMenu.push({ type: 'separator' });
    subMenu.push({
      label: azureMenuItemLabel,
      click: async () => {
        if (signedInUser) {
          await mainWindow.commandService.call(Azure.SignUserOutOfAzure);
          await mainWindow.commandService.remoteCall(UI.InvalidateAzureArmToken);
        } else {
          await mainWindow.commandService.remoteCall(UI.SignInToAzure);
        }
      }
    });

    const { availableThemes, theme } = settingsState.windowState;

    subMenu.push.apply(subMenu, [
      { type: 'separator' },
      {
        label: 'Themes',
        submenu: availableThemes.map(t => ({
          label: t.name,
          type: 'checkbox',
          checked: theme === t.name,
          click: async () => {
            settingsStore.dispatch(rememberTheme(t.name));

            await mainWindow.commandService.call(SharedConstants.Commands.Electron.UpdateFileMenu);
          }
        }))
      }
    ]);

    subMenu.push({ type: 'separator' });
    subMenu.push({ role: 'quit' });

    const template: MenuOpts = {
      label: 'File',
      submenu: subMenu
    };

    return template;
  }

  getUpdateMenuItem(): MenuOpts {
    // TODO - localization
    if (AppUpdater.status === UpdateStatus.UpdateReadyToInstall) {
      return {
        id: 'auto-update',
        label: 'Restart to Update...',
        click: () => AppUpdater.quitAndInstall(),
        enabled: true,
      };
    } else if (AppUpdater.status === UpdateStatus.CheckingForUpdate) {
      return {
        id: 'auto-update',
        label: 'Checking for update...',
        enabled: false,
      };
    } else if (AppUpdater.status === UpdateStatus.UpdateDownloading ||
      AppUpdater.status === UpdateStatus.UpdateAvailable) {
      return {
        id: 'auto-update',
        label: `Update downloading: ${AppUpdater.downloadProgress}%`,
        enabled: false,
      };
    } else {
      return {
        id: 'auto-update',
        label: 'Check for Update...',
        click: () => AppUpdater.checkForUpdates(true, false),
        enabled: true,
      };
    }
  }

  async getConversationMenu(): Promise<MenuOpts> {
    const getState = () => mainWindow.commandService.remoteCall(SharedConstants.Commands.Misc.GetStoreState);

    const getConversationId = async () => {
      const state = await getState();
      const { editors, activeEditor } = state.editor;
      const { activeDocumentId } = editors[activeEditor];

      return state.chat.chats[activeDocumentId].conversationId;
    };

    const getActiveDocumentContentType = async () => {
      const state = await getState();
      const { editors, activeEditor } = state.editor;
      const { activeDocumentId } = editors[activeEditor];
      const activeDocument = editors[activeEditor].documents[activeDocumentId];

      if (activeDocument) {
        return activeDocument.contentType;
      }
    };

    const getServiceUrl = () => emulator.framework.serverUrl.replace('[::]', 'localhost');
    const createClickHandler = serviceFunction => async () => {
      const conversationId = await getConversationId();

      return serviceFunction(getServiceUrl(), conversationId);
    };

    const enabled = await getActiveDocumentContentType() === SharedConstants.Content.CONTENT_TYPE_LIVE_CHAT;
    
    return {
      label: 'Conversation',
      submenu: [
        {
          label: 'Send System Activity',
          submenu: [
            {
              label: 'conversationUpdate ( user added )',
              click: createClickHandler(ConversationService.addUser),
              enabled
            },
            {
              label: 'conversationUpdate ( user removed )',
              click: createClickHandler(ConversationService.removeUser),
              enabled
            },
            {
              label: 'contactRelationUpdate ( bot added )',
              click: createClickHandler(ConversationService.botContactAdded),
              enabled
            },
            {
              label: 'contactRelationUpdate ( bot removed )',
              click: createClickHandler(ConversationService.botContactRemoved),
              enabled
            },
            {
              label: 'typing',
              click: createClickHandler(ConversationService.typing),
              enabled
            },
            {
              label: 'ping',
              click: createClickHandler(ConversationService.ping),
              enabled
            },
            {
              label: 'deleteUserData',
              click: createClickHandler(ConversationService.deleteUserData),
              enabled
            }
          ]
        },
      ]
    };
  }

  /**
   * Takes a file menu template and places it at the
   * right position in the app menu template according to platform
   */
  putFileMenu(fileMenuTemplate: MenuOpts, appMenuTemplate: MenuOpts[]): MenuOpts[] {
    if (process.platform === 'darwin') {
      appMenuTemplate[1] = fileMenuTemplate;
    } else {
      appMenuTemplate[0] = fileMenuTemplate;
    }
    return appMenuTemplate;
  }

  async refreshAppUpdateMenu() {
    const menu = await this.getMenuTemplate();
    const helpMenu = menu.find(menuItem => menuItem.role === 'help');
    const autoUpdateMenuItem = (helpMenu.submenu as Array<any>).find(menuItem => menuItem.id === 'auto-update');

    Object.assign(autoUpdateMenuItem, this.getUpdateMenuItem());
    Electron.Menu.setApplicationMenu(Electron.Menu.buildFromTemplate(menu));
  }

  /** Constructs the initial app menu template */
  private async createMenuTemplate(): Promise<MenuOpts[]> {
    const template: MenuOpts[] = [
      await this.getFileMenu(),
      await this.getEditMenu(),
      await this.getViewMenu(),
      await this.getConversationMenu(),
      await this.getHelpMenu()
    ];

    if (process.platform === 'darwin') {
      template.unshift(await this.getAppMenuMac());
      // Window menu
      template.splice(4, 0, {
        label: 'Window',
        submenu: await this.getWindowMenuMac()
      });
    }

    return template;
  }

  /** Creates a file menu item for each bot that will set the bot as active when clicked */
  private async getRecentBotsList(bots: BotInfo[]): Promise<MenuOpts[]> {
    // only list 5 most-recent bots
    return bots.filter(bot => !!bot).map(bot => ({
      label: bot.displayName,
      click: () => {
        mainWindow.commandService.remoteCall(SharedConstants.Commands.Bot.Switch, bot.path)
          .catch(err => console.error('Error while switching bots from file menu recent bots list: ', err));
      }
    }));
  }

  private async getAppMenuMac(): Promise<MenuOpts> {
    return {
      label: Electron.app.getName(),
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services', submenu: [] },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideothers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    };
  }

  private async getEditMenu(): Promise<MenuOpts> {
    return {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'delete' }
      ].filter(item => item) as any[]
    };
  }

  private async getViewMenu(): Promise<MenuOpts> {
    // TODO - localization
    return {
      label: 'View',
      submenu: [
        { role: 'resetzoom', label: 'Reset Zoom' },
        { role: 'zoomin' },
        { role: 'zoomout' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ]
    };
  }

  private async getWindowMenuMac(): Promise<MenuOpts[]> {
    return [
      { role: 'close' },
      { role: 'minimize' },
      { role: 'zoom' },
      { type: 'separator' },
      { role: 'front' }
    ];
  }

  private async getHelpMenu(): Promise<MenuOpts> {
    let appName = Electron.app.getName();
    let version = Electron.app.getVersion();
    
    // TODO - localization
    return {
      role: 'help',
      submenu: [
        {
          label: 'Welcome',
          click: () => mainWindow.commandService.remoteCall(SharedConstants.Commands.UI.ShowWelcomePage)
        },
        { type: 'separator' },
        {
          label: 'Privacy',
          click: () => mainWindow.commandService.remoteCall(
            SharedConstants.Commands.Electron.OpenExternal,
            'https://go.microsoft.com/fwlink/?LinkId=512132'
          )
        },
        {
          // TODO: Proper link for the license instead of third party credits
          label: 'License',
          click: () => mainWindow.commandService.remoteCall(
            SharedConstants.Commands.Electron.OpenExternal,
            'https://aka.ms/O10ww2'
          )
        },
        {
          label: 'Credits',
          click: () => mainWindow.commandService.remoteCall(
            SharedConstants.Commands.Electron.OpenExternal,
            'https://aka.ms/Ud5ga6'
          )
        },
        { type: 'separator' },
        {
          label: 'Report an issue',
          click: () => mainWindow.commandService.remoteCall(
            SharedConstants.Commands.Electron.OpenExternal,
            'https://aka.ms/cy106f'
          )
        },
        { type: 'separator' },
        this.getUpdateMenuItem(),
        { type: 'separator' },
        {
          label: 'About',
          click: () => Electron.dialog.showMessageBox(mainWindow.browserWindow, {
            type: 'info',
            title: appName,
            message: appName + '\r\nversion: ' + version,
            buttons: ['Dismiss']
          })
        }
      ]
    };
  }
};
