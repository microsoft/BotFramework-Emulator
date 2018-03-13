import * as Electron from 'electron';

import { mainWindow } from './main';
import { IBotInfo } from '@bfemulator/app-shared';

/** Constructs the initial app menu template */
export const getAppMenuTemplate = (): Electron.MenuItemConstructorOptions[] => {
  const template: Electron.MenuItemConstructorOptions[] = [
    getFileMenu(),
    getEditMenu(),
    getViewMenu(),
    getWindowMenu(),
    getHelpMenu()
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

    template.unshift(getAppMenuMac());

    // Edit menu
    (template[2].submenu as any).push(getEditMenuMac());

    // Window menu
    template[4].submenu = getWindowMenuMac();
  }
  return template;
}

/** Creates a file menu item for each bot that will set the bot as active when clicked */
const createRecentBotsList = (bots: IBotInfo[]): Electron.MenuItemConstructorOptions[] => {
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
export const getFileMenu = (recentBots?: IBotInfo[]): Electron.MenuItemConstructorOptions => {
  let subMenu: Electron.MenuItemConstructorOptions[] = [
    {
      label: "New Bot",
      click: () => {
        mainWindow.commandService.call('bot:new')
          .then(bot => mainWindow.commandService.remoteCall('bot-creation:show'))
          .catch(err => console.error('Error while getting new bot in File menu: ', err));
      }
    }];

  if (recentBots && recentBots.length) {
    recentBots = createRecentBotsList(recentBots);
    subMenu.push({ type: 'separator' });
    subMenu.push(...recentBots);
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

export const getAppMenuMac = (): Electron.MenuItemConstructorOptions =>
  ({
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
  });

export const getEditMenu = (): Electron.MenuItemConstructorOptions =>
  ({
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
  });

export const getEditMenuMac = (): Electron.MenuItemConstructorOptions[] =>
  [
    { type: 'separator' },
    {
      label: 'Speech',
      submenu: [
        { role: 'startspeaking' },
        { role: 'stopspeaking' }
      ]
    }
  ];

export const getViewMenu = (): Electron.MenuItemConstructorOptions =>
  ({
    label: 'View',
    submenu: [
      { type: 'separator' },
      { role: 'resetzoom' },
      { role: 'zoomin' },
      { role: 'zoomout' },
      { type: 'separator' },
      { role: 'togglefullscreen' },
    ]
  });

export const getWindowMenu = (): Electron.MenuItemConstructorOptions =>
  ({
    role: 'window',
    submenu: [
      { role: 'minimize' },
    ]
  });

export const getWindowMenuMac = (): Electron.MenuItemConstructorOptions[] =>
  [
    { role: 'close' },
    { role: 'minimize' },
    { role: 'zoom' },
    { type: 'separator' },
    { role: 'front' }
  ];

export const getHelpMenu = (): Electron.MenuItemConstructorOptions =>
  ({
    role: 'help',
    submenu: [
      {
        label: "Welcome",
        click: () => mainWindow.commandService.remoteCall('welcome-page:show')
      },
      { type: 'separator' },
      { role: 'toggledevtools' },
    ]
  });

/** Takes a file menu template and places it at the right position in the app menu template according to platform */
export const setFileMenu = (fileMenu: Electron.MenuItemConstructorOptions, appMenu: Electron.MenuItemConstructorOptions[]): Electron.MenuItemConstructorOptions[] => {
  if (process.platform === 'darwin') {
    appMenu[1] = fileMenu;
  } else {
    appMenu[0] = fileMenu;
  }
  return appMenu;
}
