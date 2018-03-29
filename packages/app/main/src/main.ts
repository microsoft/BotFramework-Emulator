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
import { getSettings, dispatch } from './settings';
import { WindowStateAction } from './reducers/windowStateReducer';
import * as url from 'url';
import * as path from 'path';
import * as log from './log';
import { Emulator } from './emulator';
import { WindowManager } from './windowManager';
import * as commandLine from './commandLine'
import { setTimeout } from 'timers';
import { Window } from './platform/window';
import { ensureStoragePath, writeFile, isDev } from './utils';
import * as squirrel from './squirrelEvents';
import * as Commands from './commands';
import { getBotInfoById } from './botHelpers';
import { getAppMenuTemplate } from './appMenuBuilder';

(process as NodeJS.EventEmitter).on('uncaughtException', (error: Error) => {
  console.error(error);
  log.error('[err-server]', error.message.toString(), JSON.stringify(error.stack));
});

export let mainWindow: Window;
export let windowManager: WindowManager;

var openUrls = [];
var onOpenUrl = function (event, url) {
  event.preventDefault();
  if (process.platform === 'darwin') {
    if (mainWindow && mainWindow.webContents) {
      // the app is already running, send a message containing the url to the renderer process
      mainWindow.webContents.send('botemulator', url);
    } else {
      // the app is not yet running, so store the url so the UI can request it later
      openUrls.push(url);
    }
  }
};

// REGISTER ALL COMMANDS
Commands.registerCommands();

// PARSE COMMAND LINE
commandLine.parseArgs();

Electron.app.on('will-finish-launching', (event, args) => {
  Electron.ipcMain.on('getUrls', (event, arg) => {
    openUrls.forEach(url => mainWindow.webContents.send('botemulator', url));
    openUrls = [];
  });

  // On Mac, a protocol handler invocation sends urls via this event
  Electron.app.on('open-url', onOpenUrl);
});

var windowIsOffScreen = function (windowBounds: Electron.Rectangle): boolean {
  const nearestDisplay = Electron.screen.getDisplayMatching(windowBounds).workArea;
  return (
    windowBounds.x > (nearestDisplay.x + nearestDisplay.width) ||
    (windowBounds.x + windowBounds.width) < nearestDisplay.x ||
    windowBounds.y > (nearestDisplay.y + nearestDisplay.height) ||
    (windowBounds.y + windowBounds.height) < nearestDisplay.y
  );
}

const createMainWindow = () => {
  if (squirrel.handleStartupEvent()) {
    return;
  }

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
  mainWindow = new Window(
    new Electron.BrowserWindow(
      {
        show: false,
        backgroundColor: '#f7f7f7',
        width: initBounds.width,
        height: initBounds.height,
        x: initBounds.x,
        y: initBounds.y
      }));

  mainWindow.initStore()
    .then(store => {
      store.subscribe(() => {
        const state = store.getState();
        const botsJson = { bots: state.bot.botFiles.filter(botFile => !!botFile) };
        const botsJsonPath = path.join(ensureStoragePath(), 'bots.json');

        try {
          // write bots list
          writeFile(botsJsonPath, botsJson);
          // write active bot
          if (state.bot.activeBot && state.bot.activeBot.id) {
            const activeBotInfo = getBotInfoById(state.bot.activeBot.id);
            if (activeBotInfo) {
              writeFile(activeBotInfo.path, state.bot.activeBot);
            }
          }
        } catch (e) { console.error('Error writing bot settings to disk: ', e); }

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
      });
    });

  mainWindow.browserWindow.setTitle(app.getName());
  windowManager = new WindowManager();

  const template: Electron.MenuItemConstructorOptions[] = getAppMenuTemplate();

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));

  const rememberBounds = () => {
    const bounds = mainWindow.browserWindow.getBounds();
    dispatch<WindowStateAction>({
      type: 'Window_RememberBounds',
      state: {
        displayId: Electron.screen.getDisplayMatching(bounds).id,
        width: bounds.width,
        height: bounds.height,
        left: bounds.x,
        top: bounds.y
      }
    });
  }

  mainWindow.browserWindow.on('resize', () => {
    rememberBounds();
  });

  mainWindow.browserWindow.on('move', () => {
    rememberBounds();
  });

  mainWindow.browserWindow.on('closed', function () {
    windowManager.closeAll();
    mainWindow = null;
  });

  mainWindow.browserWindow.on('restore', () => {
    if (windowIsOffScreen(mainWindow.browserWindow.getBounds())) {
      const bounds = mainWindow.browserWindow.getBounds();
      let display = Electron.screen.getAllDisplays().find(display => display.id === getSettings().windowState.displayId);
      display = display || Electron.screen.getDisplayMatching(bounds);
      mainWindow.browserWindow.setPosition(display.workArea.x, display.workArea.y);
      dispatch<WindowStateAction>({
        type: 'Window_RememberBounds',
        state: {
          displayId: display.id,
          width: bounds.width,
          height: bounds.height,
          left: display.workArea.x,
          top: display.workArea.y
        }
      });
    }
  });

  mainWindow.browserWindow.once('ready-to-show', () => {
    mainWindow.webContents.setZoomLevel(settings.windowState.zoomLevel);
    mainWindow.browserWindow.show();
  });

  let queryString = '';
  if (process.argv[1] && process.argv[1].indexOf('botemulator') !== -1) {
    // add a query string with the botemulator protocol handler content
    queryString = '?' + process.argv[1];
  }

  let page = process.env.ELECTRON_TARGET_URL || url.format({
    protocol: 'file',
    slashes: true,
    pathname: path.join(__dirname, '../../node_modules/@bfemulator/client/build/index.html')
  });

  if (/^http:\/\//.test(page)) {
    log.warn(`Loading emulator code from ${page}`);
  }

  if (queryString) {
    page = page + queryString;
  }

  mainWindow.browserWindow.loadURL(page);
}

Emulator.startup();

Electron.app.on('ready', function () {
  if (!mainWindow) {
    if (process.argv.find(val => val.includes('--vscode-debugger'))) {
      // workaround for delay in vscode debugger attach
      setTimeout(createMainWindow, 5000);
    } else {
      createMainWindow();
    }
  }
});

Electron.app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    Electron.app.quit();
  }
});

Electron.app.on('activate', function () {
  if (!mainWindow) {
    createMainWindow();
  }
});
