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
import { Subject} from 'rxjs';
import { getSettings, dispatch } from './settings';
import { WindowStateAction } from './reducers/windowStateReducer';
import * as url from 'url';
import * as path from 'path';
import * as log from './log';
import { Emulator } from './emulator';
import { WindowManager } from './windowManager';
import * as commandLine from './commandLine'
import * as electronLocalShortcut from 'electron-localshortcut';

// Ensure further options aren't passed to Chromium
Electron.app.setAsDefaultProtocolClient('botemulator', process.execPath, [
    '--protocol-launcher',
    '--'
]);

// Uncaught exception handler
(process as NodeJS.EventEmitter).on('uncaughtException', (error: Error) => {
    console.error(error);
    log.error('[err-server]', error.message.toString(), JSON.stringify(error.stack));
});

export let mainWindow: Electron.BrowserWindow;
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


var windowIsOffScreen = function(windowBounds: Electron.Rectangle): boolean {
    const nearestDisplay = Electron.screen.getDisplayMatching(windowBounds).workArea;
    return (
        windowBounds.x > (nearestDisplay.x + nearestDisplay.width) ||
        (windowBounds.x + windowBounds.width) < nearestDisplay.x ||
        windowBounds.y > (nearestDisplay.y + nearestDisplay.height) ||
        (windowBounds.y + windowBounds.height) < nearestDisplay.y
    );
}

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
    mainWindow = new Electron.BrowserWindow(
        {
            show: false,
            backgroundColor: '#f7f7f7',
            width: initBounds.width,
            height: initBounds.height,
            x: initBounds.x,
            y: initBounds.y
        });
    mainWindow.setTitle(windowTitle);
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
            ]}
        ];
        Menu.setApplicationMenu(Menu.buildFromTemplate(template));
    } else {
        Menu.setApplicationMenu(null);
    }

    const rememberBounds = () => {
        const bounds = mainWindow.getBounds();
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

    mainWindow.on('resize', () => {
        rememberBounds();
    });

    mainWindow.on('move', () => {
        rememberBounds();
    });

    mainWindow.on('closed', function () {
        windowManager.closeAll();
        mainWindow = null;
    });

    mainWindow.on('restore', () => {
        if (windowIsOffScreen(mainWindow.getBounds())) {
            const bounds = mainWindow.getBounds();
            let display = Electron.screen.getAllDisplays().find(display => display.id === getSettings().windowState.displayId);
            display = display || Electron.screen.getDisplayMatching(bounds);
            mainWindow.setPosition(display.workArea.x, display.workArea.y);
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
    }, mainWindow);
    registerHotkeys(["F5", "CmdOrCtrl+R"], () => {
        Emulator.send('new-conversation');
    }, mainWindow);
    registerHotkeys(["F6", "CmdOrCtrl+L"], () => {
        Emulator.send('toggle-address-bar-focus');
    }, mainWindow);

    mainWindow.once('ready-to-show', () => {
        mainWindow.webContents.setZoomLevel(settings.windowState.zoomLevel);
        mainWindow.show();
    });

    let queryString = '';
    if (process.argv[1] && process.argv[1].indexOf('botemulator') !== -1) {
        // add a query string with the botemulator protocol handler content
        queryString = '?' + process.argv[1];
    }

    let page = url.format({
        protocol: 'file',
        slashes: true,
        pathname: path.join(__dirname, '../client/index.html')
    });

    if (queryString) {
        page = page + queryString;
    }

    mainWindow.loadURL(page);
}

Emulator.startup();
Electron.app.on('ready', createMainWindow);
Electron.app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        Electron.app.quit();
    }
});

Electron.app.on('activate', function () {
    if (mainWindow === null) {
        createMainWindow();
    }
});

// Do this last, otherwise startup bugs are harder to diagnose.
require('electron-debug')();

