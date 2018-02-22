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
import { Menu } from 'electron';
import { Subject } from 'rxjs';
import { getSettings, dispatch } from './settings';
import { WindowStateAction } from './reducers/windowStateReducer';
import * as url from 'url';
import * as path from 'path';
import * as log from './log';
import { Emulator, emulator } from './emulator';
import { WindowManager } from './windowManager';
import * as commandLine from './commandLine'
import * as electronLocalShortcut from 'electron-localshortcut';
import { setTimeout } from 'timers';
import { Window } from './platform/window';
import { CommandRegistry } from 'botframework-emulator-shared/built/platform/commands/commandRegistry';
import { ensureStoragePath, readFileSync, showOpenDialog, writeFile } from './utils';
import { uniqueId } from 'botframework-emulator-shared/built/utils';
import * as BotActions from './data-v2/action/bot';
import * as ChatActions from './data-v2/action/chat';
import { IBot } from 'botframework-emulator-shared/built/types/botTypes';

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

/** COMMAND REGISTRATION */

// Load bots from file system
CommandRegistry.registerCommand('bot:list:load', (context: Window, ...args: any[]): any => {
  const botsJsonPath = `${ensureStoragePath()}/bots.json`;
  const botsJson = JSON.parse(readFileSync(botsJsonPath));

  if (botsJson && botsJson.bots) {
    const bots = botsJson.bots;
    context.store.dispatch(BotActions.load(bots));
    return { bots: bots };
  } else {
    console.log('No bots file exists on disk, creating one.');
    const newBotsJson = { 'bots': [] };
    try {
      writeFile(botsJsonPath, newBotsJson);
      return { bots: [] };
    } catch (e) {
      console.error(`Failure writing new bots.json to ${botsJsonPath}: `, e);
      throw e;
    }
  }
});

// Create a bot
CommandRegistry.registerCommand('bot:list:create', (context: Window, ...args: any[]): any => {
  const botId = uniqueId();

  const bot: IBot = {
    botId,
    botUrl: 'http://localhost:3978/api/messages',
    msaAppId: '',
    msaPassword: '',
    locale: 'en-US',
    path: ''
  };

  context.store.dispatch(BotActions.create(bot));

  return bot;
});

// Show explorer prompt to set a local path for a bot
CommandRegistry.registerCommand('bot:settings:chooseFolder', (context: Window, ...args: any[]): any => {
  return showOpenDialog({ title: 'Choose a folder for your bot', buttonLabel: 'Create', properties: ['openDirectory', 'promptToCreate'] });
});

// Save bot file and cause a bots list write
CommandRegistry.registerCommand('bot:save', (context: Window, bot: IBot, originalHandle: string): any => {
  context.store.dispatch(BotActions.patch(originalHandle, bot));
  return true;
});

CommandRegistry.registerCommand('bot:setActive', (context: Window, botId: string): any => {
  context.store.dispatch(BotActions.setActive(botId));
  return true;
});

// Read file
CommandRegistry.registerCommand('file:read', (context: Window, path: string): any => {
  try {
    const contents = readFileSync(path);
    return contents;
  } catch (e) {
    console.error(`Failure reading file at ${path}: `, e);
    throw e;
  }
});

// Write file
CommandRegistry.registerCommand('file:write', (context: Window, path: string, contents: object | string): any => {
  try {
    writeFile(path, contents);
    return true;
  } catch (e) {
    console.error(`Failure writing to file at ${path}: `, e);
    throw e;
  }
});

// Send app settings to client
CommandRegistry.registerCommand("client:loaded", (context: Window, ...args: any[]): any => {
  context.commandService.remoteCall("settings:emulator:url:set", emulator.framework.router.url);
});

// Create a new livechat conversation
CommandRegistry.registerCommand("livechat:new", (context: any, ...args: any[]): any => {
  const action = ChatActions.newLiveChat();
  // TODO: Validate a bot is active first
  context.store.dispatch(action);
  return action.payload.conversationId;
});

// Sets the app's title bar
CommandRegistry.registerCommand('app:setTitleBar', (context: Window, text: string): any => {
  context.browserWindow.setTitle('Bot Framework Emulator - ' + text);
});

//=============================================================================

const createMainWindow = () => {

  const windowTitle = "Bot Framework Emulator";

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
        const botsJson = { bots: state.bot.bots };
        const filePath = `${ensureStoragePath()}/bots.json`;

        try {
          writeFile(filePath, botsJson);
        } catch (e) { console.error('Error writing bot settings to disk: ', e); }

        /* Timeout's are currently busted in Electron; will write on every store change until fix is in official build.
        // Issue: https://github.com/electron/electron/issues/7079
        // Commit for fix: https://github.com/ifedapoolarewaju/igdm/commit/63496c3d38f3d4cc55b26da38f3613796b615623

        clearTimeout(botSettingsTimer);

        // wait 5 seconds after updates to bots list to write to disk
        botSettingsTimer = setTimeout(() => {
          const filePath = `${ensureStoragePath()}/bots.json`;
          try {
            writeFile(filePath, botsJson);
            console.log('Wrote bot settings to desk.');
          } catch (e) { console.error('Error writing bot settings to disk: ', e); }
        }, 1000);*/
      });
    });

  mainWindow.browserWindow.setTitle(windowTitle);
  windowManager = new WindowManager();

  //mainWindow.webContents.openDevTools();

  if (process.platform === 'darwin') {
    // Create the Application's main menu
    var template: Electron.MenuItemConstructorOptions[] = [
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
      }
    ];
    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
  } else {
    Menu.setApplicationMenu(null);
  }

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

  let registerHotkeys = (hotkeys: Array<string>, callback: () => void, window?: Electron.BrowserWindow) => {
    const eventStream = new Subject();
    eventStream.debounceTime(100).subscribe(callback);
    const addToEventStream = () => eventStream.next("");
    if (window) {
      hotkeys.forEach(hotkey => electronLocalShortcut.register(window, hotkey, addToEventStream));
    } else {
      hotkeys.forEach(hotkey => electronLocalShortcut.register(hotkey, addToEventStream));
    }
  };

  registerHotkeys(["CmdOrCtrl+="], () => {
    windowManager.zoomIn();
  });
  registerHotkeys(["CmdOrCtrl+-"], () => {
    windowManager.zoomOut();
  });
  registerHotkeys(["CmdOrCtrl+0"], () => {
    windowManager.zoomTo(0);
  });
  registerHotkeys(["F10", "Alt+F"], () => {
    Emulator.send('open-menu');
  }, mainWindow.browserWindow);
  registerHotkeys(["F5", "CmdOrCtrl+R"], () => {
    Emulator.send('new-conversation');
  }, mainWindow.browserWindow);
  registerHotkeys(["F6", "CmdOrCtrl+L"], () => {
    Emulator.send('toggle-address-bar-focus');
  }, mainWindow.browserWindow);

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
    pathname: path.join(__dirname, '../client/index.html')
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

// Do this last, otherwise startup bugs are harder to diagnose.
require('electron-debug')();
