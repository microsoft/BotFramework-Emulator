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

import './commands';
import * as path from 'path';
import * as url from 'url';

import {
  addNotification,
  azureLoggedInUserChanged,
  isMac,
  newNotification,
  rememberBounds,
  setOpenUrl,
  updateNewTunnelInfo,
  updateTunnelError,
  updateTunnelStatus,
  Notification,
  PersistentSettings,
  SharedConstants,
  TunnelError,
  TunnelInfo,
  TunnelStatus,
} from '@bfemulator/app-shared';
import { app, BrowserWindow, nativeTheme, Rectangle, screen } from 'electron';
import { CommandServiceImpl, CommandServiceInstance } from '@bfemulator/sdk-shared';

import { AppUpdater } from './appUpdater';
import * as commandLine from './commandLine';
import { Protocol } from './constants';
import { Emulator } from './emulator';
import './fetchProxy';
import { Window } from './platform/window';
import { dispatch, getSettings, store } from './state/store';
import { TelemetryService } from './telemetry';
import { botListsAreDifferent, ensureStoragePath, saveSettings, writeFile } from './utils';
import { openFileFromCommandLine } from './utils/openFileFromCommandLine';
import { sendNotificationToClient } from './utils/sendNotificationToClient';
import { WindowManager } from './windowManager';
import { ProtocolHandler } from './protocolHandler';
import { WebSocketServer } from './server/webSocketServer';

const genericTunnelError =
  'Oops.. Your ngrok tunnel seems to have an error. Please check the Ngrok Status Viewer for more details';
// start app startup timer
const beginStartupTime = Date.now();

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

let protocolUsed = false;

// Parse command line
commandLine.parseArgs();

function windowIsOffScreen(windowBounds: Rectangle): boolean {
  const nearestDisplay = screen.getDisplayMatching(windowBounds).workArea;
  return (
    windowBounds.x > nearestDisplay.x + nearestDisplay.width ||
    windowBounds.x + windowBounds.width < nearestDisplay.x ||
    windowBounds.y > nearestDisplay.y + nearestDisplay.height ||
    windowBounds.y + windowBounds.height < nearestDisplay.y
  );
}

class SplashScreen {
  private static splashWindow: BrowserWindow;

  public static show(mainBrowserWindow: BrowserWindow) {
    if (this.splashWindow) {
      return;
    }
    this.splashWindow = new BrowserWindow({
      show: false,
      width: 400,
      height: 300,
      center: true,
      frame: false,
    });
    const splashPage = process.env.ELECTRON_TARGET_URL
      ? `${process.env.ELECTRON_TARGET_URL}splash.html`
      : url.format({
          protocol: 'file',
          slashes: true,
          pathname: require.resolve('@bfemulator/client/public/splash.html'),
        });
    this.splashWindow.loadURL(splashPage);
    this.splashWindow.once('ready-to-show', () => {
      // only show if the main window still hasn't loaded
      if (!mainBrowserWindow.isVisible()) {
        this.splashWindow.show();
      } else {
        this.hide();
      }
    });
  }

  public static hide() {
    if (!this.splashWindow) {
      return;
    }
    this.splashWindow.destroy();
    this.splashWindow = null;
  }
}

class EmulatorApplication {
  @CommandServiceInstance()
  public commandService: CommandServiceImpl;
  public mainBrowserWindow: BrowserWindow;
  public mainWindow: Window;
  public windowManager = new WindowManager();

  private botsRef = store.getState().bot.botFiles;
  private fileToOpen: string;

  constructor() {
    Emulator.initialize();
    this.initializeNgrokListeners();
    this.initializeAppListeners();
    this.initializeSystemPreferencesListeners();
    store.subscribe(this.storeSubscriptionHandler);
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
    Emulator.getInstance().ngrok.ngrokEmitter.on('onTunnelError', this.onTunnelError);
    Emulator.getInstance().ngrok.ngrokEmitter.on('onNewTunnelConnected', this.onNewTunnelConnected);
    Emulator.getInstance().ngrok.ngrokEmitter.on('onTunnelStatusPing', this.onTunnelStatusPing);
  }

  private initializeSystemPreferencesListeners() {
    nativeTheme.on('updated', this.onInvertedColorSchemeChanged);
  }

  private initializeAppListeners() {
    app.on('activate', this.onAppActivate);
    app.on('ready', this.onAppReady);
    app.on('open-file', this.onAppOpenFile);
    app.on('open-url', this.onAppOpenUrl);
    app.on('will-quit', this.onAppWillQuit);
  }

  // Main browser window listeners
  private onBrowserWindowClose = async (event: Event) => {
    const { azure } = getSettings();
    if (azure.signedInUser && !azure.persistLogin) {
      event.preventDefault();
      await this.commandService.call(SharedConstants.Commands.Azure.SignUserOutOfAzure, false);
    }
    saveSettings<PersistentSettings>('server.json', getSettings());
    app.quit();
  };

  private onBrowserWindowReadyToShow = async () => {
    this.onInvertedColorSchemeChanged();
    const { zoomLevel } = getSettings().windowState;
    this.mainWindow.webContents.setZoomLevel(zoomLevel);
    SplashScreen.hide();
    this.mainBrowserWindow.show();

    // Start auto-updater
    await AppUpdater.startup();

    // Renew arm token
    await this.renewArmToken();

    await WebSocketServer.init();

    if (this.fileToOpen) {
      await openFileFromCommandLine(this.fileToOpen, this.commandService);
      this.fileToOpen = null;
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
    if (windowIsOffScreen(this.mainWindow.browserWindow.getBounds())) {
      const currentBounds = this.mainWindow.browserWindow.getBounds();
      let display = screen.getAllDisplays().find(displayArg => displayArg.id === getSettings().windowState.displayId);
      display = display || screen.getDisplayMatching(currentBounds);
      this.mainWindow.browserWindow.setPosition(display.workArea.x, display.workArea.y);
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
    this.windowManager.closeAll();
    this.mainWindow = null;
  };

  private rememberCurrentBounds = () => {
    const currentBounds = this.mainWindow.browserWindow.getBounds();
    const bounds = {
      displayId: screen.getDisplayMatching(currentBounds).id,
      width: currentBounds.width,
      height: currentBounds.height,
      left: currentBounds.x,
      top: currentBounds.y,
    };

    dispatch(rememberBounds(bounds));
  };

  private onTunnelStatusPing = async (status: TunnelStatus) => {
    dispatch(updateTunnelStatus({ tunnelStatus: status }));
  };

  private onNewTunnelConnected = async (tunnelInfo: TunnelInfo) => {
    dispatch(updateNewTunnelInfo(tunnelInfo));
  };

  private onTunnelError = async (response: TunnelError) => {
    const { Commands } = SharedConstants;
    dispatch(updateTunnelError({ ...response }));

    const ngrokNotification: Notification = newNotification(genericTunnelError);
    dispatch(addNotification(ngrokNotification.id));

    this.commandService.call(Commands.Ngrok.OpenStatusViewer, false);

    ngrokNotification.addButton('Debug Console', () => {
      this.commandService.remoteCall(Commands.Notifications.Remove, ngrokNotification.id);
      this.commandService.call(Commands.Ngrok.OpenStatusViewer);
    });
    await sendNotificationToClient(ngrokNotification, this.commandService);
    Emulator.getInstance().ngrok.broadcastNgrokError(genericTunnelError);
  };

  private onInvertedColorSchemeChanged = () => {
    const { theme, availableThemes } = getSettings().windowState;
    const themeInfo = availableThemes.find(availableTheme => availableTheme.name === theme);

    const isHighContrast = nativeTheme.shouldUseInvertedColorScheme || nativeTheme.shouldUseHighContrastColors;

    const themeName = isHighContrast ? 'high-contrast' : themeInfo.name;
    const themeComponents = isHighContrast ? path.join('.', 'themes', 'high-contrast.css') : themeInfo.href;

    this.commandService.remoteCall(SharedConstants.Commands.UI.SwitchTheme, themeName, themeComponents, false);
  };

  // App listeners
  private onAppReady = () => {
    if (this.mainBrowserWindow) {
      return;
    }
    this.mainBrowserWindow = new BrowserWindow({
      show: false,
      backgroundColor: '#f7f7f7',
      width: 1400,
      height: 920,
      webPreferences: { contextIsolation: false, nodeIntegration: true, webviewTag: true },
    });
    this.initializeBrowserWindowListeners();

    this.mainWindow = new Window(this.mainBrowserWindow);
    Emulator.getInstance().initServer({ fetch, logService: this.mainWindow.logService });

    if (process.env.NODE_ENV !== 'test') {
      SplashScreen.show(this.mainBrowserWindow);
    }
    const page =
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

    this.mainBrowserWindow.loadURL(page);
    this.mainBrowserWindow.setTitle(app.getName());
  };

  private onAppActivate = () => {
    this.onAppReady();
  };

  private onAppWillQuit = () => {
    WebSocketServer.cleanup();
  };

  private onAppOpenUrl = (event: Event, url: string): void => {
    event.preventDefault();
    if (isMac()) {
      protocolUsed = true;
      if (this.mainWindow && this.mainWindow.webContents) {
        // the app is already running, send a message containing the url to the renderer process
        ProtocolHandler.parseProtocolUrlAndDispatch(url);
      } else {
        // the app is not yet running, so store the url so the UI can request it later
        store.dispatch(setOpenUrl(url));
      }
    }
  };

  private onAppOpenFile = async (event: Event, file: string) => {
    if (!this.mainWindow || !this.commandService) {
      this.fileToOpen = file;
    } else {
      await openFileFromCommandLine(file, this.commandService);
    }
  };

  private storeSubscriptionHandler = () => {
    const state = store.getState();

    // if the bots list changed, write it to disk
    const bots = state.bot.botFiles.filter(botFile => !!botFile);
    if (botListsAreDifferent(this.botsRef, bots)) {
      const botsJson = { bots };
      const botsJsonPath = path.join(ensureStoragePath(), 'bots.json');

      try {
        // write bots list
        writeFile(botsJsonPath, botsJson);
        // update cached version to check against for changes
        this.botsRef = bots;
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Error writing bot list to disk: ', e);
      }
    }
  };

  private async renewArmToken() {
    const { persistLogin, signedInUser } = getSettings().azure;
    if (persistLogin && signedInUser) {
      const result = await this.commandService.registry.getCommand(SharedConstants.Commands.Azure.RetrieveArmToken)(
        true
      );
      if (result && 'access_token' in result) {
        await this.commandService.remoteCall(SharedConstants.Commands.UI.ArmTokenReceivedOnStartup, result);
      } else if (!result) {
        store.dispatch(azureLoggedInUserChanged(''));
        await this.commandService.call(SharedConstants.Commands.Electron.UpdateFileMenu);
      }
    }
  }
}

export const emulatorApplication = new EmulatorApplication();
