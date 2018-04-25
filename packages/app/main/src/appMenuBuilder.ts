import * as Electron from 'electron';

import { mainWindow, appUpdater } from './main';
import { IBotInfo, getBotId } from '@bfemulator/app-shared';

export interface IAppMenuBuilder {
  menuTemplate: Electron.MenuItemConstructorOptions[];
  getAppMenuTemplate: () => Electron.MenuItemConstructorOptions[];
  createRecentBotsList: (bots: IBotInfo[]) => Electron.MenuItemConstructorOptions[];
  getFileMenu: (recentBots?: IBotInfo[]) => Electron.MenuItemConstructorOptions;
  getAppMenuMac: () => Electron.MenuItemConstructorOptions;
  getEditMenu: () => Electron.MenuItemConstructorOptions;
  getEditMenuMac: () => Electron.MenuItemConstructorOptions[];
  getViewMenu: () => Electron.MenuItemConstructorOptions;
  getWindowMenuMac: () => Electron.MenuItemConstructorOptions[];
  getHelpMenu: () => Electron.MenuItemConstructorOptions;
  setFileMenu: (fileMenuTemplate: Electron.MenuItemConstructorOptions, appMenuTemplate: Electron.MenuItemConstructorOptions[]) => Electron.MenuItemConstructorOptions[];
}

export const AppMenuBuilder = new class AppMenuBuilder implements IAppMenuBuilder {
  private _menuTemplate: Electron.MenuItemConstructorOptions[];

  constructor() { }

  /** Allows preservation of menu state without having to completely rebuild the menu template */
  get menuTemplate(): Electron.MenuItemConstructorOptions[] {
    return this._menuTemplate ? this._menuTemplate : this.getAppMenuTemplate();
  }

  set menuTemplate(template: Electron.MenuItemConstructorOptions[]) {
    this._menuTemplate = template;
  }

  /** Constructs the initial app menu template */
  getAppMenuTemplate(): Electron.MenuItemConstructorOptions[] {
    const template: Electron.MenuItemConstructorOptions[] = [
      this.getFileMenu(),
      this.getEditMenu(),
      this.getViewMenu(),
      this.getHelpMenu()
    ];

    if (process.platform === 'darwin') {
      /*
      // Create the Application's main menu
      var template2: Electron.MenuItemConstructorOptions[] = [
        {
          label: windowTitle,
          submenu: [
            { label: "About", click: () => Emulator.send('show-about') },
            { type: "separator" },
            { label: "Quit", accelerator: "Command+Q", click: () => Electron.app.quit() }
          ]
        }, {
          label: "Edit",
          submenu: [
            { label: "Undo", accelerator: "CmdOrCtrl+Z", role: "undo" },
            { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", role: "redo" },
            { type: "separator" },
            { label: "Cut", accelerator: "CmdOrCtrl+X", role: "cut" },
            { label: "Copy", accelerator: "CmdOrCtrl+C", role: "copy" },
            { label: "Paste", accelerator: "CmdOrCtrl+V", role: "paste" },
            { label: "Select All", accelerator: "CmdOrCtrl+A", role: "selectall" }
          ]
        }*/

      template.unshift(this.getAppMenuMac());

      // Edit menu
      (template[2].submenu as any).push(this.getEditMenuMac());

      // Window menu
      template[4].submenu = this.getWindowMenuMac();
    }
    // save menu state
    this.menuTemplate = template;
    return template;
  }

  /** Creates a file menu item for each bot that will set the bot as active when clicked */
  createRecentBotsList(bots: IBotInfo[]): Electron.MenuItemConstructorOptions[] {
    // TODO: will need to change this to recent endpoints instead of bots
    // once we allow multiple endpoints per bot

    // only list 5 most-recent bots
    return bots.slice(0, 5).map(bot => ({
      label: bot.displayName,
      click: () => {
        mainWindow.commandService.remoteCall('bot:switch', bot.id)
          .catch(err => console.error('Error while switching bots from file menu recent bots list: ', err));
      }
    }));
  }

  /** Constructs a file menu template. If recentBots is passed in, will add recent bots list to menu */
  getFileMenu(recentBots?: IBotInfo[]): Electron.MenuItemConstructorOptions {
    let subMenu: Electron.MenuItemConstructorOptions[] = [
      {
        label: "New Bot",
        click: () => {
          mainWindow.commandService.remoteCall('bot-creation:show');
        }
      },
      {
        label: "Open Bot",
        click: () => {
          mainWindow.commandService.remoteCall('bot:browse-open');
        }
      }];

    if (recentBots && recentBots.length) {
      const recentBotsList = this.createRecentBotsList(recentBots);
      subMenu.push({ type: 'separator' });
      subMenu.push(...recentBotsList);
      subMenu.push({ type: 'separator' });
    }

    subMenu.push({
      label: "Open Transcript File...",
      click: () => {
        mainWindow.commandService.remoteCall('transcript:prompt-open')
          .catch(err => console.error('Error opening transcript file from menu: ', err));
      }
    });
    subMenu.push({ type: 'separator' });
    subMenu.push({ role: 'quit' });

    const template: Electron.MenuItemConstructorOptions = {
      label: 'File',
      submenu: subMenu
    };

    return template;
  }

  getAppMenuMac(): Electron.MenuItemConstructorOptions {
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

  getEditMenu(): Electron.MenuItemConstructorOptions {
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
        { role: 'selectall' },
      ]
    };
  }

  getEditMenuMac(): Electron.MenuItemConstructorOptions[] {
    return [
      { type: 'separator' },
      {
        label: 'Speech',
        submenu: [
          { role: 'startspeaking' },
          { role: 'stopspeaking' }
        ]
      }
    ];
  }

  getViewMenu(): Electron.MenuItemConstructorOptions {
    return {
      label: 'View',
      submenu: [
        {
          label: "Explorer",
          click: () => mainWindow.commandService.remoteCall('shell:show-explorer')
        },
        {
          label: "Services",
          click: () => mainWindow.commandService.remoteCall('shell:show-services')
        },
        {
          label: "App Settings",
          click: () => mainWindow.commandService.remoteCall('shell:show-app-settings')
        },
        { type: 'separator' },
        { role: 'resetzoom' },
        { role: 'zoomin' },
        { role: 'zoomout' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ]
    }
  };

  getWindowMenuMac(): Electron.MenuItemConstructorOptions[] {
    return [
      { role: 'close' },
      { role: 'minimize' },
      { role: 'zoom' },
      { type: 'separator' },
      { role: 'front' }
    ];
  }

  getHelpMenu(): Electron.MenuItemConstructorOptions {
    return {
      role: 'help',
      submenu: [
        {
          label: "Welcome",
          click: () => mainWindow.commandService.remoteCall('welcome-page:show')
        },
        { type: 'separator' },
        {
          label: 'Privacy',
          click: () => mainWindow.commandService.remoteCall('shell:open-external-link', 'https://go.microsoft.com/fwlink/?LinkId=512132')
        },
        {
          label: 'Credits',
          click: () => mainWindow.commandService.remoteCall('shell:open-external-link', 'https://aka.ms/l7si1g')
        },
        { type: 'separator' },
        {
          label: "Report an issue",
          click: () => mainWindow.commandService.remoteCall('shell:open-external-link', 'https://aka.ms/cy106f')
        },
        { type: 'separator' },
        { role: 'toggledevtools' },
        {
          label: "Toggle Developer Tools (Inspector)",
          click: () => mainWindow.commandService.remoteCall('shell:toggle-inspector-devtools')
        },
        { type: 'separator' },
        this.getUpdateMenuItem(),
        { type: 'separator' },
        {
          label: "About",
          click: () => mainWindow.commandService.remoteCall('shell:about')
        },
      ]
    };
  }
  
  getUpdateMenuItem(): Electron.MenuItemConstructorOptions {
    if (appUpdater.isUpdateAvailable) {
      return {
        label: "Restart to Update...",
        click: () => appUpdater.quitAndInstall()
      }
    } else {
      return {
        label: "Check for Update...",
        click: () => appUpdater.checkForUpdates()
      }
    }
  }

  /** Takes a file menu template and places it at the right position in the app menu template according to platform */
  setFileMenu(fileMenuTemplate: Electron.MenuItemConstructorOptions, appMenuTemplate: Electron.MenuItemConstructorOptions[]): Electron.MenuItemConstructorOptions[] {
    if (process.platform === 'darwin') {
      appMenuTemplate[1] = fileMenuTemplate;
    } else {
      appMenuTemplate[0] = fileMenuTemplate;
    }
    return appMenuTemplate;
  }
}
