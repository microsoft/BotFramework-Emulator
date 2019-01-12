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
  newNotification,
  Notification,
  PersistentSettings,
  Settings,
  SharedConstants
} from "@bfemulator/app-shared";
import Users from "@bfemulator/emulator-core/lib/facility/users";
import { ProgressInfo } from "builder-util-runtime";
import * as Electron from "electron";
import { app, Menu, systemPreferences } from "electron";
import { UpdateInfo } from "electron-updater";
import * as path from "path";
import { Store } from "redux";
import { setTimeout } from "timers";
import * as url from "url";

import { appendCustomUserAgent } from "./appendCustomUserAgent";
import { AppMenuBuilder } from "./appMenuBuilder";
import { AppUpdater } from "./appUpdater";
import { getStore } from "./botData/store";
import * as commandLine from "./commandLine";
import { CommandRegistry, registerAllCommands } from "./commands";
import { Emulator, emulator } from "./emulator";
import "./fetchProxy";
import { ngrokEmitter } from "./ngrok";
import { Window } from "./platform/window";
import { azureLoggedInUserChanged } from "./settingsData/actions/azureAuthActions";
import {
  rememberBounds,
  rememberTheme
} from "./settingsData/actions/windowStateActions";
import {
  dispatch,
  getSettings,
  getStore as getSettingsStore
} from "./settingsData/store";
import {
  botListsAreDifferent,
  ensureStoragePath,
  saveSettings,
  writeFile
} from "./utils";
import { openFileFromCommandLine } from "./utils/openFileFromCommandLine";
import { sendNotificationToClient } from "./utils/sendNotificationToClient";
import { WindowManager } from "./windowManager";

export let mainWindow: Window;
export let windowManager: WindowManager;

const store = getStore();
// -----------------------------------------------------------------------------
(process as NodeJS.EventEmitter).on("uncaughtException", (error: Error) => {
  console.error(error);
});

// -----------------------------------------------------------------------------
// TODO - localization
if (app) {
  app.setName("Bot Framework Emulator");
}

// -----------------------------------------------------------------------------
// App-Updater events

AppUpdater.on("update-available", async (update: UpdateInfo) => {
  try {
    AppMenuBuilder.refreshAppUpdateMenu();

    if (AppUpdater.userInitiated) {
      const {
        ShowUpdateAvailableDialog,
        ShowProgressIndicator,
        UpdateProgressIndicator
      } = SharedConstants.Commands.UI;
      const result = await mainWindow.commandService.remoteCall(
        ShowUpdateAvailableDialog,
        update.version
      );
      if (result) {
        // show but don't block on result of progress indicator dialog
        await mainWindow.commandService.remoteCall(UpdateProgressIndicator, {
          label: "Downloading...",
          progress: 0
        });
        mainWindow.commandService.remoteCall(ShowProgressIndicator);
        const { installAfterDownload = false } = result;
        await AppUpdater.downloadUpdate(installAfterDownload);
      }
    }
  } catch (e) {
    console.error(
      `An error occurred in the updater's "update-available" event handler: ${e}`
    );
  }
});

AppUpdater.on("update-downloaded", async (update: UpdateInfo) => {
  try {
    AppMenuBuilder.refreshAppUpdateMenu();

    // TODO - localization
    if (AppUpdater.userInitiated) {
      // update the progress indicator
      const { UpdateProgressIndicator } = SharedConstants.Commands.UI;
      const progressPayload = { label: "Download finished.", progress: 100 };
      await mainWindow.commandService.remoteCall(
        UpdateProgressIndicator,
        progressPayload
      );

      // send a notification when the update is finished downloading
      const notification = newNotification(
        `Emulator version ${
          update.version
        } has finished downloading. Restart and update now?`
      );
      notification.addButton("Dismiss", () => {
        const { Commands } = SharedConstants;
        mainWindow.commandService.remoteCall(
          Commands.Notifications.Remove,
          notification.id
        );
      });
      notification.addButton("Restart", async () => {
        try {
          AppUpdater.quitAndInstall();
        } catch (e) {
          sendNotificationToClient(
            newNotification(e),
            mainWindow.commandService
          );
        }
      });
      sendNotificationToClient(notification, mainWindow.commandService);
    }
  } catch (e) {
    console.error(
      `An error occurred in the updater's "update-downloaded" event handler: ${e}`
    );
  }
});

AppUpdater.on("up-to-date", async () => {
  try {
    // TODO - localization
    AppMenuBuilder.refreshAppUpdateMenu();

    // only show the alert if the user explicity checked for update, and no update was downloaded
    const { userInitiated, updateDownloaded } = AppUpdater;
    if (userInitiated && !updateDownloaded) {
      const { ShowUpdateUnavailableDialog } = SharedConstants.Commands.UI;
      await mainWindow.commandService.remoteCall(ShowUpdateUnavailableDialog);
    }
  } catch (e) {
    console.error(
      `An error occurred in the updater's "up-to-date" event handler: ${e}`
    );
  }
});

AppUpdater.on("download-progress", async (info: ProgressInfo) => {
  try {
    AppMenuBuilder.refreshAppUpdateMenu();

    // update the progress bar component
    const { UpdateProgressIndicator } = SharedConstants.Commands.UI;
    const progressPayload = { label: "Downloading...", progress: info.percent };
    await mainWindow.commandService.remoteCall(
      UpdateProgressIndicator,
      progressPayload
    );
  } catch (e) {
    console.error(
      `An error occurred in the updater's "download-progress" event handler: ${e}`
    );
  }
});

AppUpdater.on("error", async (err: Error, message: string = "") => {
  // TODO - localization
  AppMenuBuilder.refreshAppUpdateMenu();
  // TODO - Send to debug.txt / error dump file
  if (message.includes(".yml")) {
    AppUpdater.emit("up-to-date");
    return;
  }
  if (AppUpdater.userInitiated) {
    await mainWindow.commandService.call(
      SharedConstants.Commands.Electron.ShowMessageBox,
      true,
      {
        title: app.getName(),
        message: `An error occurred while using the updater: ${err}`
      }
    );
  }
});

// -----------------------------------------------------------------------------
// Ngrok events

ngrokEmitter.on("expired", () => {
  // when ngrok expires, spawn notification to reconnect
  const ngrokNotification: Notification = newNotification(
    "Your ngrok tunnel instance has expired. Would you like to reconnect to a new tunnel?"
  );
  ngrokNotification.addButton("Dismiss", () => {
    const { Commands } = SharedConstants;
    mainWindow.commandService.remoteCall(
      Commands.Notifications.Remove,
      ngrokNotification.id
    );
  });
  ngrokNotification.addButton("Reconnect", async () => {
    try {
      const { Commands } = SharedConstants;
      await mainWindow.commandService.call(Commands.Ngrok.Reconnect);
      mainWindow.commandService.remoteCall(
        Commands.Notifications.Remove,
        ngrokNotification.id
      );
    } catch (e) {
      sendNotificationToClient(newNotification(e), mainWindow.commandService);
    }
  });
  sendNotificationToClient(ngrokNotification, mainWindow.commandService);
  emulator.ngrok.broadcastNgrokExpired();
});

// -----------------------------------------------------------------------------

let openUrls = [];
const onOpenUrl = function(event: any, url1: any) {
  event.preventDefault();
  if (process.platform === "darwin") {
    if (mainWindow && mainWindow.webContents) {
      // the app is already running, send a message containing the url to the renderer process
      mainWindow.webContents.send("botemulator", url1);
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

Electron.app.on("will-finish-launching", () => {
  Electron.ipcMain.on("getUrls", () => {
    openUrls.forEach(url2 => mainWindow.webContents.send("botemulator", url2));
    openUrls = [];
  });

  // On Mac, a protocol handler invocation sends urls via this event
  Electron.app.on("open-url", onOpenUrl);
});

let fileToOpen: string;
Electron.app.on("open-file", async (event: Event, file: string) => {
  if (!mainWindow || !mainWindow.commandService) {
    fileToOpen = file;
  } else {
    await openFileFromCommandLine(file, mainWindow.commandService);
  }
});

const windowIsOffScreen = function(windowBounds: Electron.Rectangle): boolean {
  const nearestDisplay = Electron.screen.getDisplayMatching(windowBounds)
    .workArea;
  return (
    windowBounds.x > nearestDisplay.x + nearestDisplay.width ||
    windowBounds.x + windowBounds.width < nearestDisplay.x ||
    windowBounds.y > nearestDisplay.y + nearestDisplay.height ||
    windowBounds.y + windowBounds.height < nearestDisplay.y
  );
};

const createMainWindow = async () => {
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
    new Electron.BrowserWindow({
      show: false,
      backgroundColor: "#f7f7f7",
      /*
        width: initBounds.width,
        height: initBounds.height,
        x: initBounds.x,
        y: initBounds.y
        */
      width: 1400,
      height: 920
    })
  );

  // attach custom user agent string
  mainWindow.webContents.session.webRequest.onBeforeSendHeaders(
    appendCustomUserAgent
  );

  // get reference to bots list in state for comparison against state changes
  let botsRef = store.getState().bot.botFiles;

  store.subscribe(() => {
    const state = store.getState();

    // if the bots list changed, write it to disk
    const bots = state.bot.botFiles.filter(botFile => !!botFile);
    if (botListsAreDifferent(botsRef, bots)) {
      const botsJson = { bots };
      const botsJsonPath = path.join(ensureStoragePath(), "bots.json");

      try {
        // write bots list
        writeFile(botsJsonPath, botsJson);
        // update cached version to check against for changes
        botsRef = bots;
      } catch (e) {
        console.error("Error writing bot list to disk: ", e);
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

  AppMenuBuilder.initAppMenu().catch(err => {
    Electron.dialog.showErrorBox(
      "Bot Framework Emulator",
      `An error occurred while initializing the application menu: ${err}`
    );
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

  mainWindow.browserWindow.on("resize", () => {
    rememberCurrentBounds();
  });

  mainWindow.browserWindow.on("move", () => {
    rememberCurrentBounds();
  });

  mainWindow.browserWindow.on("closed", function() {
    windowManager.closeAll();
    mainWindow = null;
  });

  mainWindow.browserWindow.on("restore", () => {
    if (windowIsOffScreen(mainWindow.browserWindow.getBounds())) {
      const currentBounds = mainWindow.browserWindow.getBounds();
      let display = Electron.screen
        .getAllDisplays()
        .find(
          displayArg => displayArg.id === getSettings().windowState.displayId
        );
      display = display || Electron.screen.getDisplayMatching(currentBounds);
      mainWindow.browserWindow.setPosition(
        display.workArea.x,
        display.workArea.y
      );
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

  mainWindow.browserWindow.once("ready-to-show", async () => {
    const { zoomLevel, theme, availableThemes } = getSettings().windowState;
    const themeInfo = availableThemes.find(
      availableTheme => availableTheme.name === theme
    );
    const isHighContrast = systemPreferences.isInvertedColorScheme();
    const settingsStore: Store<Settings> = getSettingsStore();
    if (themeInfo) {
      settingsStore.dispatch(
        rememberTheme(isHighContrast ? "high-contrast" : themeInfo.name)
      );
    }
    mainWindow.webContents.setZoomLevel(zoomLevel);
    mainWindow.browserWindow.show();

    // Start auto-updater
    AppUpdater.startup();

    // Renew arm token
    const { persistLogin, signedInUser } = settingsStore.getState().azure;
    if (persistLogin && signedInUser) {
      const result = await CommandRegistry.getCommand(
        SharedConstants.Commands.Azure.RetrieveArmToken
      ).handler(true);
      if (result && "access_token" in result) {
        await mainWindow.commandService.remoteCall(
          SharedConstants.Commands.UI.ArmTokenReceivedOnStartup,
          result
        );
      } else if (!result) {
        settingsStore.dispatch(azureLoggedInUserChanged(""));
        await mainWindow.commandService.call(
          SharedConstants.Commands.Electron.UpdateFileMenu
        );
      }
    }

    if (fileToOpen) {
      await openFileFromCommandLine(fileToOpen, mainWindow.commandService);
      fileToOpen = null;
    }
  });

  mainWindow.browserWindow.once("close", async function(event: Event) {
    const { azure } = getSettings();
    if (azure.signedInUser && !azure.persistLogin) {
      event.preventDefault();
      await mainWindow.commandService.call(
        SharedConstants.Commands.Azure.SignUserOutOfAzure,
        false
      );
    }
    saveSettings<PersistentSettings>("server.json", getSettings());
    Electron.app.quit();
  });
};

function loadMainPage() {
  let queryString = "";
  if (process.argv[1] && process.argv[1].indexOf("botemulator") !== -1) {
    // add a query string with the botemulator protocol handler content
    queryString = "?" + process.argv[1];
  }

  let page =
    process.env.ELECTRON_TARGET_URL ||
    url.format({
      protocol: "file",
      slashes: true,
      pathname: require.resolve("@bfemulator/client/public/index.html")
    });

  if (/^http:\/\//.test(page)) {
    console.warn(`Loading emulator code from ${page}`);
  }

  if (queryString) {
    page = page + queryString;
  }
  mainWindow.browserWindow.loadURL(page);
}

Electron.app.on("ready", function() {
  if (!mainWindow) {
    if (process.argv.find(val => val.includes("--vscode-debugger"))) {
      // workaround for delay in vscode debugger attach
      setTimeout(createMainWindow, 5000);
      // createMainWindow();
    } else {
      createMainWindow();
    }
  }
});

Electron.app.on("activate", async function() {
  if (!mainWindow) {
    await createMainWindow();
  }
});
