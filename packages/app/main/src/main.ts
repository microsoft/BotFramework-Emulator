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

import * as Electron from 'electron';
import { app, Menu } from 'electron';

import { dispatch, getSettings, getStore as getSettingsStore } from './settingsData/store';
import * as url from 'url';
import * as path from 'path';
import { Emulator } from './emulator';
import { WindowManager } from './windowManager';
import * as commandLine from './commandLine';
import { setTimeout } from 'timers';
import { Window } from './platform/window';
import { botListsAreDifferent, ensureStoragePath, saveSettings, writeFile } from './utils';
import * as squirrel from './squirrelEvents';
import { CommandRegistry, registerAllCommands } from './commands';
import { AppMenuBuilder } from './appMenuBuilder';
import { AppUpdater } from './appUpdater';
import { UpdateInfo } from 'electron-updater';
import { ProgressInfo } from 'builder-util-runtime';
import { getStore } from './botData/store';
import { PersistentSettings, Settings, SharedConstants } from '@bfemulator/app-shared';
import { BotProjectFileWatcher } from './botProjectFileWatcher';
import { rememberBounds } from './settingsData/actions/windowStateActions';
import { Store } from 'redux';
import { azureLoggedInUserChanged } from './settingsData/actions/azureAuthActions';

export let mainWindow: Window;
export let windowManager: WindowManager;

const store = getStore();

// -----------------------------------------------------------------------------

(process as NodeJS.EventEmitter).on('uncaughtException', (error: Error) => {
  console.error(error);
});

// -----------------------------------------------------------------------------
// TODO - localization
if (app) {
  app.setName('Bot Framework Emulator (V4 PREVIEW)');
}

// -----------------------------------------------------------------------------
// App-Updater events

AppUpdater.on('checking-for-update', (...args) => {
  AppMenuBuilder.refreshAppUpdateMenu();
});

AppUpdater.on('update-available', (update: UpdateInfo) => {
  AppMenuBuilder.refreshAppUpdateMenu();
  if (AppUpdater.userInitiated) {
    // TODO - localization
    mainWindow.commandService.call(SharedConstants.Commands.Electron.ShowMessageBox, true, {
      title: app.getName(),
      message: `An update is available. Download it now?`,
      buttons: ['Cancel', 'OK'],
      defaultId: 1,
      cancelId: 0
    }).then(result => {
      if (result) {
        AppUpdater.checkForUpdates(true, true);
      }
    });
  }
});

AppUpdater.on('update-downloaded', (update: UpdateInfo) => {
  AppMenuBuilder.refreshAppUpdateMenu();
  // TODO - localization
  if (AppUpdater.userInitiated) {
    mainWindow.commandService.call(SharedConstants.Commands.Electron.ShowMessageBox, true, {
      title: app.getName(),
      message: 'Finished downloading update. Restart and install now?',
      buttons: ['Cancel', 'OK'],
      defaultId: 1,
      cancelId: 0
    }).then(result => {
      if (result) {
        AppUpdater.quitAndInstall();
      }
    });
  }
});

AppUpdater.on('up-to-date', (update: UpdateInfo) => {
  // TODO - localization
  AppMenuBuilder.refreshAppUpdateMenu();
  if (AppUpdater.userInitiated) {
    mainWindow.commandService.call(SharedConstants.Commands.Electron.ShowMessageBox, true, {
      title: app.getName(),
      message: 'There are no updates currently available.'
    });
  }
});

AppUpdater.on('download-progress', (progress: ProgressInfo) => {
  AppMenuBuilder.refreshAppUpdateMenu();
});

AppUpdater.on('error', (err: Error, message: string) => {
  // TODO - localization
  AppMenuBuilder.refreshAppUpdateMenu();
  console.error(err, message);
  if (AppUpdater.userInitiated) {
    mainWindow.commandService.call(SharedConstants.Commands.Electron.ShowMessageBox, true, {
      title: app.getName(),
      message: 'There are no updates currently available.'
    });
  }
});

// -----------------------------------------------------------------------------

let openUrls = [];
const onOpenUrl = function (event: any, url1: any) {
  event.preventDefault();
  if (process.platform === 'darwin') {
    if (mainWindow && mainWindow.webContents) {
      // the app is already running, send a message containing the url to the renderer process
      mainWindow.webContents.send('botemulator', url1);
    } else {
      // the app is not yet running, so store the url so the UI can request it later
      openUrls.push(url1);
    }
  }
};

// Register all commands
registerAllCommands(CommandRegistry);

// Parse command line
commandLine.parseArgs();

Electron.app.on('will-finish-launching', () => {
  Electron.ipcMain.on('getUrls', () => {
    openUrls.forEach(url2 => mainWindow.webContents.send('botemulator', url2));
    openUrls = [];
  });

  // On Mac, a protocol handler invocation sends urls via this event
  Electron.app.on('open-url', onOpenUrl);
});

const windowIsOffScreen = function (windowBounds: Electron.Rectangle): boolean {
  const nearestDisplay = Electron.screen.getDisplayMatching(windowBounds).workArea;
  return (
    windowBounds.x > (nearestDisplay.x + nearestDisplay.width) ||
    (windowBounds.x + windowBounds.width) < nearestDisplay.x ||
    windowBounds.y > (nearestDisplay.y + nearestDisplay.height) ||
    (windowBounds.y + windowBounds.height) < nearestDisplay.y
  );
};

const createMainWindow = async () => {
  if (squirrel.handleStartupEvent()) {
    return;
  }

  /*
  // TODO: Read window size AFTER store is initialized (how did this ever work?)
  const settings = getSettings();
  let initBounds: Electron.Rectangle = {
    width: settings.windowState.width || 0,
    height: settings.windowState.height || 0,
    x: settings.windowState.left || 0,
    y: settings.windowState.top || 0,
  }
  if (windowIsOffScreen(initBounds)) {
    let display = Electron.screen.getAllDisplays().find(display => display.id === settings.windowState.displayId);
    display = display || Electron.screen.getDisplayMatching(initBounds);
    initBounds.x = display.workArea.x;
    initBounds.y = display.workArea.y;
  }
  */

  mainWindow = new Window(
    new Electron.BrowserWindow(
      {
        show: false,
        backgroundColor: '#f7f7f7',
        /*
        width: initBounds.width,
        height: initBounds.height,
        x: initBounds.x,
        y: initBounds.y
        */
        width: 1400,
        height: 920
      }));

  // get reference to bots list in state for comparison against state changes
  let botsRef = store.getState().bot.botFiles;

  store.subscribe(() => {
    const state = store.getState();

    // if the bots list changed, write it to disk
    const bots = state.bot.botFiles.filter(botFile => !!botFile);
    if (botListsAreDifferent(botsRef, bots)) {
      const botsJson = { bots };
      const botsJsonPath = path.join(ensureStoragePath(), 'bots.json');

      try {
        // write bots list
        writeFile(botsJsonPath, botsJson);
        // update cached version to check against for changes
        botsRef = bots;
      } catch (e) {
        console.error('Error writing bot list to disk: ', e);
      }

      /* Timeout's are currently busted in Electron; will write on every store change until fix is made.
      // Issue: https://github.com/electron/electron/issues/7079

      clearTimeout(botSettingsTimer);

      // wait 5 seconds after updates to bots list to write to disk
      botSettingsTimer = setTimeout(() => {
        const botsJsonPath = `${ensureStoragePath()}/bots.json`;
        try {
          writeFile(botsJsonPath, botsJson);
          console.log('Wrote bot settings to desk.');
        } catch (e) { console.error('Error writing bot settings to disk: ', e); }
      }, 1000);*/
    }
  });

  const serverUrl = await Emulator.startup();
  store.dispatch({ type: 'updateServiceUrl', payload: serverUrl.replace('[::]', 'localHost') });

  loadMainPage();

  mainWindow.browserWindow.setTitle(app.getName());
  windowManager = new WindowManager();

  // Start auto-updater
  AppUpdater.startup();

  const template: Electron.MenuItemConstructorOptions[] = AppMenuBuilder.getAppMenuTemplate();
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));

  // initialize bot project watcher
  BotProjectFileWatcher.getInstance().initialize(mainWindow.commandService);

  const rememberCurrentBounds = () => {
    const currentBounds = mainWindow.browserWindow.getBounds();
    const bounds = {
      displayId: Electron.screen.getDisplayMatching(currentBounds).id,
      width: currentBounds.width,
      height: currentBounds.height,
      left: currentBounds.x,
      top: currentBounds.y
    };

    dispatch(rememberBounds(bounds));
  };

  mainWindow.browserWindow.on('resize', () => {
    rememberCurrentBounds();
  });

  mainWindow.browserWindow.on('move', () => {
    rememberCurrentBounds();
  });

  mainWindow.browserWindow.on('closed', function () {
    windowManager.closeAll();
    mainWindow = null;
  });

  mainWindow.browserWindow.on('restore', () => {
    if (windowIsOffScreen(mainWindow.browserWindow.getBounds())) {
      const currentBounds = mainWindow.browserWindow.getBounds();
      let display = Electron.screen.getAllDisplays().find(displayArg =>
        displayArg.id === getSettings().windowState.displayId);
      display = display || Electron.screen.getDisplayMatching(currentBounds);
      mainWindow.browserWindow.setPosition(display.workArea.x, display.workArea.y);
      const bounds = {
        displayId: display.id,
        width: currentBounds.width,
        height: currentBounds.height,
        left: display.workArea.x,
        top: display.workArea.y
      };
      dispatch(rememberBounds(bounds));
    }
  });

  mainWindow.browserWindow.once('ready-to-show', async () => {
    const { zoomLevel, theme, availableThemes } = getSettings().windowState;
    const themeInfo = availableThemes.find(availableTheme => availableTheme.name === theme);
    if (themeInfo) {
      mainWindow.browserWindow.webContents.executeJavaScript(`
      const themeTag = document.getElementById('themeVars');
      if (themeTag) {
        themeTag.href = "${themeInfo.href}";
      }
    `);
    }
    mainWindow.webContents.setZoomLevel(zoomLevel);
    mainWindow.browserWindow.show();
    if (process.env.NODE_ENV !== 'development') {
      AppUpdater.checkForUpdates(false, true);
    }
    // Renew arm token
    const settingsStore: Store<Settings> = getSettingsStore();
    const { persistLogin, signedInUser } = settingsStore.getState().azure;
    if (persistLogin && signedInUser) {
      const result = await CommandRegistry.getCommand(SharedConstants.Commands.Azure.RetrieveArmToken).handler(true);
      if ('armToken' in result) {
        CommandRegistry.getCommand(SharedConstants.Commands.UI.ArmTokenReceivedOnStartup).handler(result);
      } else if (!result) {
        settingsStore.dispatch(azureLoggedInUserChanged(''));
      }
    }
  });
};

function loadMainPage() {
  let queryString = '';
  if (process.argv[1] && process.argv[1].indexOf('botemulator') !== -1) {
    // add a query string with the botemulator protocol handler content
    queryString = '?' + process.argv[1];
  }

  let page = process.env.ELECTRON_TARGET_URL || url.format({
    protocol: 'file',
    slashes: true,
    pathname: require.resolve('@bfemulator/client/public/index.html')
  });

  if (/^http:\/\//.test(page)) {
    console.warn(`Loading emulator code from ${page}`);
  }

  if (queryString) {
    page = page + queryString;
  }
  mainWindow.browserWindow.loadURL(page);
}

Electron.app.on('ready', function () {
  if (!mainWindow) {
    if (process.argv.find(val => val.includes('--vscode-debugger'))) {
      // workaround for delay in vscode debugger attach
      setTimeout(createMainWindow, 5000);
      // createMainWindow();
    } else {
      createMainWindow();
    }
  }
});

Electron.app.on('window-all-closed', async function (event: Event) {
  // if (process.platform !== 'darwin') {
  const { azure } = getSettings();
  if (azure.signedInUser && !azure.persistLogin) {
    event.preventDefault();
    await mainWindow.commandService.call(SharedConstants.Commands.Azure.SignUserOutOfAzure, false);
  }
  saveSettings<PersistentSettings>('server.json', getSettings());
  Electron.app.quit();
  // }
});

Electron.app.on('activate', async function () {
  if (!mainWindow) {
    await createMainWindow();
  }
});
