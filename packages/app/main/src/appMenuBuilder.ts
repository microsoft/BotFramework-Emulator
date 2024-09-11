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
  BotInfo,
  isLinux,
  isMac,
  isWindows,
  rememberTheme,
  SharedConstants,
  UpdateStatus,
} from '@bfemulator/app-shared';
import { CommandServiceImpl, CommandServiceInstance, ConversationService } from '@bfemulator/sdk-shared';
import { app, clipboard, Menu, MenuItem, MenuItemConstructorOptions, shell } from 'electron';

import { AppUpdater } from './appUpdater';
import { BotHelpers } from './botHelpers';
import { Emulator } from './emulator';
import { TelemetryService } from './telemetry';
import { store } from './state';
import { getLocalhostServiceUrl } from './utils/getLocalhostServiceUrl';
import { getCurrentConversationId } from './state/helpers/chatHelpers';

declare type MenuOpts = MenuItemConstructorOptions;

export class AppMenuBuilder {
  @CommandServiceInstance()
  private static commandService: CommandServiceImpl;

  public static get sendActivityMenuItems(): MenuItem[] {
    const menu = Menu.getApplicationMenu();
    if (menu) {
      const sendActivityMenu = menu.getMenuItemById('send-activity') as any;
      const { submenu = { items: [] } } = sendActivityMenu || {};
      return submenu.items;
    }
    return [];
  }

  public static get recentBotsMenuItems(): MenuItem[] {
    const menu = Menu.getApplicationMenu();
    if (menu) {
      const recentBotsMenu = menu.getMenuItemById('recent-bots') as any;
      const { submenu = { items: [] } } = recentBotsMenu || {};
      return submenu.items;
    }
    return [];
  }

  /** Called on app startup */
  public static async initAppMenu(): Promise<void> {
    // show an HTML app menu on Windows & Linux (a11y)
    if (isWindows()) {
      Menu.setApplicationMenu(null);
      return;
    }

    // Work-around for Linux. Menu.setApplicationMenu(null) does not work on v4.x (https://github.com/electron/electron/issues/16521)
    // Comes with the side effect of having an empty app menu bar at the top of the window.
    if (isLinux()) {
      Menu.setApplicationMenu(Menu.buildFromTemplate([]));
      return;
    }

    const template: MenuOpts[] = [
      await this.initFileMenu(),
      this.initDebugMenu(),
      await this.initEditMenu(),
      await this.initViewMenu(),
      await this.initConversationMenu(),
      await this.initHelpMenu(),
    ];

    if (isMac()) {
      template.unshift(await this.initAppMenuMac());
      // Window menu
      template.splice(4, 0, {
        label: 'Window',
        submenu: await this.initWindowMenuMac(),
      });
    }

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  }

  /** Refreshes the top-level of the File menu
   *  Ex. Toggling "Close Tab" & "Sign in / out"
   */
  public static refreshFileMenu(): void {
    const menu = Menu.getApplicationMenu();
    if (menu) {
      const fileMenu = (menu.getMenuItemById('file') as any) || {};
      if (fileMenu.submenu) {
        // redraw the menu, but preserve the recent bots list
        const recentBotsMenuItems = this.recentBotsMenuItems;
        const recentBotsMenu = new Menu();
        // must append 1-by-1 due to Electron limitations
        recentBotsMenuItems.forEach(item => {
          recentBotsMenu.append(item);
        });
        const fileMenuContent = Menu.buildFromTemplate(this.getUpdatedFileMenuContent(recentBotsMenu));
        fileMenu.submenu.clear();
        fileMenuContent.items.forEach(item => {
          fileMenu.submenu.append(item);
        });
      }
    }
  }

  /** Updates the recent bots list in the File menu */
  public static updateRecentBotsList(updatedBots: BotInfo[] = []): void {
    const menu = Menu.getApplicationMenu();
    if (menu) {
      const recentBotsMenu = menu.getMenuItemById('recent-bots') as any;
      if (recentBotsMenu && recentBotsMenu.submenu && recentBotsMenu.submenu.items) {
        const recentBots = this.getRecentBotsList(updatedBots);
        // we have to reconstruct the menu due to Electron menu item limitations
        recentBotsMenu.submenu.clear();
        recentBots.forEach(bot => recentBotsMenu.submenu.append(bot));
        recentBotsMenu.enabled = !!updatedBots.length;
      }
    }
  }

  /** Refreshes the app update menu item in the Help menu */
  public static refreshAppUpdateMenu(): void {
    const menu = Menu.getApplicationMenu();
    if (menu) {
      const { status } = AppUpdater;
      const { Idle, UpdateAvailable, UpdateDownloading, UpdateReadyToInstall } = UpdateStatus;
      const updateRestartItem = menu.getMenuItemById('auto-update-restart');
      if (updateRestartItem) {
        updateRestartItem.visible = status === UpdateReadyToInstall;
      }
      const updateCheckItem = menu.getMenuItemById('auto-update-check');
      if (updateCheckItem) {
        updateCheckItem.visible = status === Idle || status === UpdateAvailable;
      }
      const updateDownloadingItem = menu.getMenuItemById('auto-update-downloading');
      if (updateDownloadingItem) {
        updateDownloadingItem.visible = status === UpdateDownloading;
      }
    }
  }

  /** Creates a file menu item for each bot that will set the bot as active when clicked */
  private static getRecentBotsList(bots: BotInfo[] = []): MenuItem[] {
    // only list 9 most-recent bots
    return bots
      .filter(Boolean)
      .slice(0, 9)
      .map(
        bot =>
          new MenuItem({
            label: bot.displayName,
            click: () => {
              AppMenuBuilder.commandService.remoteCall(SharedConstants.Commands.Bot.Switch, bot.path).catch(err =>
                // eslint-disable-next-line no-console
                console.error('Error while switching bots from file menu recent bots list: ', err)
              );
            },
          })
      );
  }

  /** Returns the template to construct a file menu that reflects updated state */
  private static getUpdatedFileMenuContent(recentBotsMenu: Menu = new Menu()): MenuOpts[] {
    const { Azure, UI, Bot, Emulator: EmulatorCommands } = SharedConstants.Commands;

    // TODO - localization
    const subMenu: MenuOpts[] = [
      {
        label: 'New Bot Configuration...',
        click: () => {
          AppMenuBuilder.commandService.remoteCall(UI.ShowBotCreationDialog);
        },
      },
      { type: 'separator' },
      {
        label: 'Open Bot',
        click: () => {
          AppMenuBuilder.commandService.remoteCall(UI.ShowOpenBotDialog);
        },
      },
      {
        id: 'recent-bots',
        label: 'Open Recent...',
        enabled: !!recentBotsMenu.items.length,
        submenu: recentBotsMenu,
      },
      { type: 'separator' },
      {
        label: 'Open Transcript...',
        click: () => {
          AppMenuBuilder.commandService.remoteCall(EmulatorCommands.PromptToOpenTranscript);
        },
      },
      { type: 'separator' },
    ];

    const activeBot = BotHelpers.getActiveBot();

    subMenu.push({
      label: 'Close Tab',
      click: async () => {
        await AppMenuBuilder.commandService.remoteCall(Bot.Close);
        await AppMenuBuilder.commandService.call(SharedConstants.Commands.Electron.UpdateFileMenu);
      },
      enabled: activeBot !== null,
    });

    const settingsState = store.getState().settings;
    const { signedInUser } = settingsState.azure;
    const azureMenuItemLabel = signedInUser ? `Sign out (${signedInUser})` : 'Sign in with Azure';

    subMenu.push({ type: 'separator' });
    subMenu.push({
      label: azureMenuItemLabel,
      click: async () => {
        if (signedInUser) {
          await AppMenuBuilder.commandService.call(Azure.SignUserOutOfAzure);
          await AppMenuBuilder.commandService.remoteCall(UI.InvalidateAzureArmToken);
        } else {
          await AppMenuBuilder.commandService.remoteCall(UI.SignInToAzure);
        }
      },
    });

    subMenu.push({
      label: 'Clear State',
      click: async () => {
        await AppMenuBuilder.commandService.call(SharedConstants.Commands.Emulator.ClearState);
      },
    });

    const { availableThemes, theme } = settingsState.windowState;

    subMenu.push.apply(subMenu, [
      { type: 'separator' },
      {
        label: 'Themes',
        submenu: availableThemes.map(t => ({
          label: t.name,
          type: isMac() ? 'radio' : 'checkbox',
          checked: theme === t.name,
          click: async () => {
            store.dispatch(rememberTheme(t.name));

            await AppMenuBuilder.commandService.call(SharedConstants.Commands.Electron.UpdateFileMenu);
          },
        })),
      },
    ]);
    subMenu.push({ type: 'separator' });
    subMenu.push({
      label: 'Copy Emulator Port',
      click: async () => {
        const port = await Emulator.getInstance().server.serverPort;
        clipboard.writeText(port.toString());
      },
    });
    subMenu.push({ type: 'separator' });
    subMenu.push({ role: 'quit' });

    return subMenu;
  }

  private static async initConversationMenu(): Promise<MenuOpts> {
    const getState = () => AppMenuBuilder.commandService.remoteCall<any>(SharedConstants.Commands.Misc.GetStoreState);

    const getActiveDocumentContentType = async () => {
      const state = await getState();
      if (!state.editor) {
        return;
      }
      const { editors, activeEditor } = state.editor;
      const { activeDocumentId } = editors[activeEditor];
      const activeDocument = editors[activeEditor].documents[activeDocumentId];

      if (activeDocument) {
        return activeDocument.contentType;
      }
    };

    const createClickHandler = (serviceFunction, callback?) => async () => {
      const conversationId = getCurrentConversationId();

      serviceFunction(getLocalhostServiceUrl(), conversationId);
      if (callback) {
        callback();
      }
    };

    const enabled = (await getActiveDocumentContentType()) === SharedConstants.ContentTypes.CONTENT_TYPE_LIVE_CHAT;

    return {
      id: 'conversation',
      label: 'Conversation',
      submenu: [
        {
          id: 'send-activity',
          label: 'Send System Activity',
          submenu: [
            {
              label: 'Custom activity (New)',
              click: () => {
                AppMenuBuilder.commandService.remoteCall(SharedConstants.Commands.UI.ShowCustomActivityEditor);
              },
            },
            {
              label: 'conversationUpdate ( user added )',
              click: createClickHandler(ConversationService.addUser, () =>
                TelemetryService.trackEvent('sendActivity_addUser')
              ),
              enabled,
            },
            {
              label: 'contactRelationUpdate ( bot added )',
              click: createClickHandler(ConversationService.botContactAdded, () =>
                TelemetryService.trackEvent('sendActivity_botContactAdded')
              ),
              enabled,
            },
            {
              label: 'contactRelationUpdate ( bot removed )',
              click: createClickHandler(ConversationService.botContactRemoved, () =>
                TelemetryService.trackEvent('sendActivity_botContactRemoved')
              ),
              enabled,
            },
            {
              label: 'typing',
              click: createClickHandler(ConversationService.typing, () =>
                TelemetryService.trackEvent('sendActivity_typing')
              ),
              enabled,
            },
            {
              label: 'ping',
              click: createClickHandler(ConversationService.ping, () =>
                TelemetryService.trackEvent('sendActivity_ping')
              ),
              enabled,
            },
            {
              label: 'deleteUserData',
              click: createClickHandler(ConversationService.deleteUserData, () =>
                TelemetryService.trackEvent('sendActivity_deleteUserData')
              ),
              enabled,
            },
          ],
        },
      ],
    };
  }

  private static async initAppMenuMac(): Promise<MenuOpts> {
    return {
      label: app.getName(),
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services', submenu: [] },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' },
      ],
    };
  }

  private static async initEditMenu(): Promise<MenuOpts> {
    return {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'delete' },
      ].filter(item => item) as any[],
    };
  }

  /** Initializes the file menu */
  private static initFileMenu(): MenuOpts {
    return {
      id: 'file',
      label: 'File',
      submenu: this.getUpdatedFileMenuContent(),
    };
  }

  public static async initViewMenu(): Promise<MenuOpts> {
    // TODO - localization
    return {
      label: 'View',
      id: 'view',
      submenu: [
        { role: 'resetZoom', label: 'Reset Zoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        {
          label: 'Toggle Full Screen',
          accelerator: isMac() ? 'Cmd+F11' : 'F11',
          click: async () => {
            await this.commandService.remoteCall(SharedConstants.Commands.UI.ToggleFullScreen);
          },
        },
        { role: 'toggleDevTools' },
      ],
    };
  }

  private static async initWindowMenuMac(): Promise<MenuOpts[]> {
    return [{ role: 'close' }, { role: 'minimize' }, { role: 'zoom' }, { type: 'separator' }, { role: 'front' }];
  }

  private static async initHelpMenu(): Promise<MenuOpts> {
    const appName = app.getName();
    const version = app.getVersion();
    const { Commands, Channels } = SharedConstants;
    // TODO - localization
    return {
      role: 'help',
      submenu: [
        {
          label: 'Welcome',
          click: () => AppMenuBuilder.commandService.remoteCall(Commands.UI.ShowWelcomePage),
        },
        { type: 'separator' },
        {
          label: 'Privacy',
          click: () => shell.openExternal('https://privacy.microsoft.com/privacystatement', { activate: true }),
        },
        {
          // TODO: Proper link for the license instead of third party credits
          label: 'License',
          click: () =>
            shell.openExternal('https://aka.ms/bot-framework-emulator-license', {
              activate: true,
            }),
        },
        {
          label: 'Credits',
          click: () =>
            shell.openExternal('https://aka.ms/bot-framework-emulator-credits', {
              activate: true,
            }),
        },
        { type: 'separator' },
        {
          label: 'Report an issue',
          click: () =>
            shell.openExternal('https://aka.ms/cy106f', {
              activate: true,
            }),
        },
        { type: 'separator' },

        // will toggle visibility of auto update menu item states as workaround to non-dynamic labels in Electron
        {
          id: 'auto-update-restart',
          label: 'Restart to update...',
          click: () => AppUpdater.quitAndInstall(),
          enabled: true,
          visible: AppUpdater.status === UpdateStatus.UpdateReadyToInstall,
        },
        {
          id: 'auto-update-downloading',
          label: `Update downloading...`,
          enabled: false,
          visible: AppUpdater.status === UpdateStatus.UpdateDownloading,
        },
        {
          id: 'auto-update-check',
          label: 'Check for update...',
          click: () => AppUpdater.checkForUpdates(true),
          enabled: true,
          visible: AppUpdater.status === UpdateStatus.Idle || AppUpdater.status === UpdateStatus.UpdateAvailable,
        },
        { type: 'separator' },
        {
          label: Channels.HelpLabel,
          click: () =>
            AppMenuBuilder.commandService.remoteCall(
              Commands.UI.ShowMarkdownPage,
              Channels.ReadmeUrl,
              Channels.HelpLabel
            ),
        },
        {
          label: 'About',
          click: () =>
            this.commandService.call(SharedConstants.Commands.Electron.ShowMessageBox, true, {
              type: 'info',
              title: appName,
              message: appName + '\r\nversion: ' + version,
              buttons: ['Dismiss'],
            }),
        },
      ],
    };
  }

  private static initDebugMenu(): MenuOpts {
    const { UI } = SharedConstants.Commands;
    return {
      label: 'Debug',
      id: 'debug',
      submenu: [
        {
          label: 'Start Debugging',
          click: () => {
            AppMenuBuilder.commandService.remoteCall(UI.ShowOpenBotDialog, true);
          },
        },
      ],
    };
  }
}
