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
import * as path from 'path';
import { setTimeout } from 'timers';
import * as url from 'url';

import { newNotification, Notification, PersistentSettings, Settings, SharedConstants } from '@bfemulator/app-shared';
import { app, BrowserWindow, dialog, Rectangle, screen, systemPreferences } from 'electron';
import { Store } from 'redux';

import { AppMenuBuilder } from './appMenuBuilder';
import { AppUpdater } from './appUpdater';
import { getStore } from './data/store';
import * as commandLine from './commandLine';
import { Protocol } from './constants';
import { Emulator } from './emulator';
import './fetchProxy';
import { ngrokEmitter } from './ngrok';
import { Window } from './platform/window';
import { azureLoggedInUserChanged } from './settingsData/actions/azureAuthActions';
import { rememberBounds, rememberTheme } from './settingsData/actions/windowStateActions';
import { dispatch, getSettings, getStore as getSettingsStore } from './settingsData/store';
import { TelemetryService } from './telemetry';
import { botListsAreDifferent, ensureStoragePath, isMac, saveSettings, writeFile } from './utils';
import { openFileFromCommandLine } from './utils/openFileFromCommandLine';
import { sendNotificationToClient } from './utils/sendNotificationToClient';
import { WindowManager } from './windowManager';
import { ProtocolHandler } from './protocolHandler';
import { setOpenUrl } from './data/actions/protocolActions';
import { CommandRegistryImpl } from '@bfemulator/sdk-shared';

export let mainWindow: Window;
export let windowManager: WindowManager;
let splashWindow: Window;

// start app startup timer
const beginStartupTime = Date.now();

const store = getStore();

// -----------------------------------------------------------------------------
(process as NodeJS.EventEmitter).on('uncaughtException', (error: Error) => {
  // eslint-disable-next-line no-console
  console.error(error);
});

// -----------------------------------------------------------------------------
// TODO - localization
if (app) {
  app.setName('Bot Framework Emulator');
}

// -----------------------------------------------------------------------------
let protocolUsed = false;
const onOpenUrl = function(event: any, url: string): void {
  event.preventDefault();
  if (isMac()) {
    protocolUsed = true;
    if (mainWindow && mainWindow.webContents) {
      // the app is already running, send a message containing the url to the renderer process
      ProtocolHandler.parseProtocolUrlAndDispatch(url);
    } else {
      // the app is not yet running, so store the url so the UI can request it later
      store.dispatch(setOpenUrl(url));
    }
  }
};

// Parse command line
commandLine.parseArgs();

app.on('will-finish-launching', () => {
  // On Mac, a protocol handler invocation sends urls via this event
  app.on('open-url', onOpenUrl);
});

let fileToOpen: string;
app.on('open-file', async (event: Event, file: string) => {
  if (!mainWindow || !mainWindow.commandService) {
    fileToOpen = file;
  } else {
    await openFileFromCommandLine(file, mainWindow.commandService);
  }
});

const windowIsOffScreen = function(windowBounds: Rectangle): boolean {
  const nearestDisplay = screen.getDisplayMatching(windowBounds).workArea;
  return (
    windowBounds.x > nearestDisplay.x + nearestDisplay.width ||
    windowBounds.x + windowBounds.width < nearestDisplay.x ||
    windowBounds.y > nearestDisplay.y + nearestDisplay.height ||
    windowBounds.y + windowBounds.height < nearestDisplay.y
  );
};

const createMainWindow = async () => {
  mainWindow = new Window(
    new BrowserWindow({
      show: false,
      backgroundColor: '#f7f7f7',
      width: 1400,
      height: 920,
    })
  );

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
        // eslint-disable-next-line no-console
        console.error('Error writing bot list to disk: ', e);
      }
    }
  });
  loadMainPage();

  mainWindow.browserWindow.setTitle(app.getName());
  windowManager = new WindowManager();

  AppMenuBuilder.initAppMenu().catch(err => {
    dialog.showErrorBox('Bot Framework Emulator', `An error occurred while initializing the application menu: ${err}`);
  });
};

function loadMainPage() {
  let page =
    process.env.ELECTRON_TARGET_URL ||
    url.format({
      protocol: 'file',
      slashes: true,
      pathname: require.resolve('@bfemulator/client/public/index.html'),
    });

  if (/^http:\/\//.test(page)) {
    // eslint-disable-next-line no-console
    console.warn(`Loading emulator code from ${page}`);
  }

  mainWindow.browserWindow.loadURL(page);
}

function createSplashScreen(): void {
  // create the splash window
  splashWindow = new Window(
    new BrowserWindow({
      show: false,
      width: 400,
      height: 300,
      center: true,
      frame: false,
    })
  );
  // dereference on close
  splashWindow.browserWindow.once('closed', () => {
    splashWindow = null;
  });
  const splashPage = process.env.ELECTRON_TARGET_URL
    ? `${process.env.ELECTRON_TARGET_URL}splash.html`
    : url.format({
        protocol: 'file',
        slashes: true,
        pathname: require.resolve('@bfemulator/client/public/splash.html'),
      });
  splashWindow.browserWindow.loadURL(splashPage);
  splashWindow.browserWindow.once('ready-to-show', () => {
    // only show if the main window still hasn't loaded
    const showSplashScreen = !mainWindow || (mainWindow.browserWindow && !mainWindow.browserWindow.isVisible());
    showSplashScreen && splashWindow.browserWindow.show();
  });
}

app.on('ready', function() {
  if (!mainWindow) {
    createSplashScreen();
    if (process.argv.find(val => val.includes('--vscode-debugger'))) {
      // workaround for delay in vscode debugger attach
      setTimeout(createMainWindow, 5000);
    } else {
      createMainWindow();
    }
  }
});

app.on('activate', async function() {
  if (!mainWindow) {
    await createMainWindow();
  }
});

class EmulatorApplication {
  public mainBrowserWindow = new BrowserWindow({ show: false, backgroundColor: '#f7f7f7', width: 1400, height: 920 });
  public mainWindow = new Window(this.mainBrowserWindow);
  public windowManager = new WindowManager();
  public splashWindow = new Window(
    new BrowserWindow({
      show: false,
      width: 400,
      height: 300,
      center: true,
      frame: false,
    })
  );

  private commandRegistry: CommandRegistryImpl;

  constructor() {
    this.initializeBrowserWindowListeners();
    this.initializeNgrokListeners();
    this.initializeAppListeners();
  }

  private initializeBrowserWindowListeners() {
    this.mainBrowserWindow.once('close', this.onBrowserWindowClose);
    this.mainBrowserWindow.once('ready-to-show', this.onBrowserWindowReadyToShow);
    this.mainBrowserWindow.on('restore', this.onBrowserWindowRestore);
    this.mainBrowserWindow.on('closed', this.onBrowserWindowClosed);
    this.mainBrowserWindow.on('move', this.rememberCurrentBounds);
    this.mainBrowserWindow.on('restore', this.rememberCurrentBounds);
  }

  private initializeNgrokListeners() {
    ngrokEmitter.on('expired', this.onNgrokSessionExpired);
  }

  private initializeAppListeners() {}

  // Main browser window listeners
  private onBrowserWindowClose = async (event: Event) => {
    const { azure } = getSettings();
    if (azure.signedInUser && !azure.persistLogin) {
      event.preventDefault();
      await mainWindow.commandService.call(SharedConstants.Commands.Azure.SignUserOutOfAzure, false);
    }
    saveSettings<PersistentSettings>('server.json', getSettings());
    app.quit();
  };

  private onBrowserWindowReadyToShow = async () => {
    const { zoomLevel, theme, availableThemes } = getSettings().windowState;
    const themeInfo = availableThemes.find(availableTheme => availableTheme.name === theme);
    const isHighContrast = systemPreferences.isInvertedColorScheme();
    const settingsStore: Store<Settings> = getSettingsStore();
    if (themeInfo) {
      settingsStore.dispatch(rememberTheme(isHighContrast ? 'high-contrast' : themeInfo.name));
    }
    mainWindow.webContents.setZoomLevel(zoomLevel);
    splashWindow.browserWindow.close();
    mainWindow.browserWindow.show();

    // Start auto-updater
    await AppUpdater.startup();

    // Renew arm token
    const { persistLogin, signedInUser } = settingsStore.getState().azure;
    if (persistLogin && signedInUser) {
      const result = await this.commandRegistry.getCommand(SharedConstants.Commands.Azure.RetrieveArmToken)(true);
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

    // log app startup time in seconds
    const endStartupTime = Date.now();
    const startupTime = (endStartupTime - beginStartupTime) / 1000;
    const launchedByProtocol = process.argv.some(arg => arg.includes(Protocol)) || protocolUsed;
    TelemetryService.trackEvent('app_launch', {
      method: launchedByProtocol ? 'protocol' : 'binary',
      startupTime,
    });
  };

  private onBrowserWindowRestore = () => {
    if (windowIsOffScreen(mainWindow.browserWindow.getBounds())) {
      const currentBounds = mainWindow.browserWindow.getBounds();
      let display = screen.getAllDisplays().find(displayArg => displayArg.id === getSettings().windowState.displayId);
      display = display || screen.getDisplayMatching(currentBounds);
      mainWindow.browserWindow.setPosition(display.workArea.x, display.workArea.y);
      const bounds = {
        displayId: display.id,
        width: currentBounds.width,
        height: currentBounds.height,
        left: display.workArea.x,
        top: display.workArea.y,
      };
      dispatch(rememberBounds(bounds));
    }
  };

  private onBrowserWindowClosed = () => {
    windowManager.closeAll();
    mainWindow = null;
  };

  private rememberCurrentBounds = () => {
    const currentBounds = mainWindow.browserWindow.getBounds();
    const bounds = {
      displayId: screen.getDisplayMatching(currentBounds).id,
      width: currentBounds.width,
      height: currentBounds.height,
      left: currentBounds.x,
      top: currentBounds.y,
    };

    dispatch(rememberBounds(bounds));
  };

  // ngrok listeners
  private onNgrokSessionExpired = async () => {
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
        await sendNotificationToClient(newNotification(e), mainWindow.commandService);
      }
    });
    await sendNotificationToClient(ngrokNotification, mainWindow.commandService);
    Emulator.getInstance().ngrok.broadcastNgrokExpired();
  };
}
