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
import { app, Menu, systemPreferences } from 'electron';

import { dispatch, getSettings, getStore as getSettingsStore } from './settingsData/store';
import * as url from 'url';
import * as path from 'path';
import { Emulator, emulator } from './emulator';
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
import { newNotification, Notification, PersistentSettings, Settings, SharedConstants } from '@bfemulator/app-shared';
import { rememberBounds, rememberTheme } from './settingsData/actions/windowStateActions';
import { Store } from 'redux';
import { azureLoggedInUserChanged } from './settingsData/actions/azureAuthActions';
import { ngrokEmitter } from './ngrok';
import { sendNotificationToClient } from './utils/sendNotificationToClient';
import Users from '@bfemulator/emulator-core/lib/facility/users';
import { openFileFromCommandLine } from './utils/openFileFromCommandLine';

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
  app.setName('Bot Framework Emulator');
}

// -----------------------------------------------------------------------------
// App-Updater events

AppUpdater.on('checking-for-update', async (...args) => {
  await AppMenuBuilder.refreshAppUpdateMenu();
});

AppUpdater.on('update-available', async (update: UpdateInfo) => {
  await AppMenuBuilder.refreshAppUpdateMenu();

  if (AppUpdater.userInitiated) {
    // TODO - localization
    mainWindow.commandService.call(SharedConstants.Commands.Electron.ShowMessageBox, true, {
      title: app.getName(),
      message: `A new update, ${update.version}, is available. Download it now?`,
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

AppUpdater.on('update-downloaded', async (update: UpdateInfo) => {
  await AppMenuBuilder.refreshAppUpdateMenu();

  // TODO - localization
  if (AppUpdater.userInitiated) {
    mainWindow.commandService.call(SharedConstants.Commands.Electron.ShowMessageBox, true, {
      title: app.getName(),
      message: `Finished downloading update ${update.version}. Restart and install now?`,
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

AppUpdater.on('up-to-date', async (update: UpdateInfo) => {
  // TODO - localization
  await AppMenuBuilder.refreshAppUpdateMenu();
  // only show the alert if the user explicity checked for update, and no update was downloaded
  const { userInitiated, updateDownloaded } = AppUpdater;
  if (userInitiated && !updateDownloaded) {
    mainWindow.commandService.call(SharedConstants.Commands.Electron.ShowMessageBox, true, {
      title: app.getName(),
      message: 'There are no updates currently available.'
    });
  }
});

AppUpdater.on('download-progress', async (progress: ProgressInfo) => {
  await AppMenuBuilder.refreshAppUpdateMenu();
});

AppUpdater.on('error', async (err: Error, message: string) => {
  // TODO - localization
  await AppMenuBuilder.refreshAppUpdateMenu();
  // TODO - Send to debug.txt / error dump file
  console.error(err, message);
  if (AppUpdater.userInitiated) {
    mainWindow.commandService.call(SharedConstants.Commands.Electron.ShowMessageBox, true, {
      title: app.getName(),
      message: 'Something went wrong while checking for updates.'
    });
  }
});

// -----------------------------------------------------------------------------
// Ngrok events

ngrokEmitter.on('expired', () => {
  // when ngrok expires, spawn notification to reconnect
  const ngrokNotification: Notification = newNotification(
    'Your ngrok tunnel instance has expired. Would you like to reconnect to a new tunnel?'
  );
  ngrokNotification.addButton('Dismiss', () => {
    const { Commands } = SharedConstants;
    mainWindow.commandService.remoteCall(Commands.Notifications.Remove, ngrokNotification.id);
  });
  ngrokNotification.addButton('Reconnect', async () => {
    try {
      const { Commands } = SharedConstants;
      await mainWindow.commandService.call(Commands.Ngrok.Reconnect);
      mainWindow.commandService.remoteCall(Commands.Notifications.Remove, ngrokNotification.id);
    } catch (e) {
      sendNotificationToClient(newNotification(e), mainWindow.commandService);
    }
  });
  sendNotificationToClient(ngrokNotification, mainWindow.commandService);
  emulator.ngrok.broadcastNgrokExpired();
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

let fileToOpen: string;
Electron.app.on('open-file', async (event: Event, file: string) => {
  if (!mainWindow || !mainWindow.commandService) {
    fileToOpen = file;
  } else {
    await openFileFromCommandLine(file, mainWindow.commandService);
  }
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
    }
  });
  const emulatorInstance = await Emulator.startup();
  const { facilities } = emulatorInstance.framework.server.botEmulator;
  const { users: userSettings, framework } = getSettingsStore().getState();

  const users = new Users();
  users.currentUserId = userSettings.currentUserId;
  users.users = userSettings.usersById;

  facilities.locale = framework.locale;
  facilities.users = users;
  loadMainPage();

  mainWindow.browserWindow.setTitle(app.getName());
  windowManager = new WindowManager();

  // Start auto-updater
  AppUpdater.startup();

  AppMenuBuilder.getMenuTemplate().then((template: Electron.MenuItemConstructorOptions[]) => {
    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
  });

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
    const isHighContrast = systemPreferences.isInvertedColorScheme();
    const settingsStore: Store<Settings> = getSettingsStore();
    if (themeInfo) {
      settingsStore.dispatch(rememberTheme(isHighContrast ? 'high-contrast' : themeInfo.name));
    }
    mainWindow.webContents.setZoomLevel(zoomLevel);
    mainWindow.browserWindow.show();
    if (process.env.NODE_ENV !== 'development') {
      AppUpdater.checkForUpdates(false, true);
    }
    // Renew arm token
    const { persistLogin, signedInUser } = settingsStore.getState().azure;
    if (persistLogin && signedInUser) {
      const result = await CommandRegistry.getCommand(SharedConstants.Commands.Azure.RetrieveArmToken).handler(true);
      if (result && 'access_token' in result) {
        await mainWindow.commandService.remoteCall(SharedConstants.Commands.UI.ArmTokenReceivedOnStartup, result);
      } else if (!result) {
        settingsStore.dispatch(azureLoggedInUserChanged(''));
        await mainWindow.commandService.call(SharedConstants.Commands.Electron.UpdateFileMenu);
      }
    }

    if (fileToOpen) {
      await openFileFromCommandLine(fileToOpen, mainWindow.commandService);
      fileToOpen = null;
    }
  });

  mainWindow.browserWindow.once('close', async function (event: Event) {
    const { azure } = getSettings();
    if (azure.signedInUser && !azure.persistLogin) {
      event.preventDefault();
      await mainWindow.commandService.call(SharedConstants.Commands.Azure.SignUserOutOfAzure, false);
    }
    saveSettings<PersistentSettings>('server.json', getSettings());
    Electron.app.quit();
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

Electron.app.on('activate', async function () {
  if (!mainWindow) {
    await createMainWindow();
  }
});
