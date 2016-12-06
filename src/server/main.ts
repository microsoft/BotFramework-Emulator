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
import { getSettings, dispatch } from './settings';
import { WindowStateAction } from './reducers/windowStateReducer';
import * as url from 'url';
import * as path from 'path';
import * as log from './log';
import { Emulator, emulator } from './emulator';
var pjson = require('../../package.json');

process.on('uncaughtException', (error: Error) => {
    console.error(error);
    log.error('[err-server]', error.message.toString(), JSON.stringify(error.stack));
});

export let mainWindow: Electron.BrowserWindow;

const createMainWindow = () => {
    // TODO: Make a better/safer window state restoration module
    // (handles change in display dimensions, maximized state, etc)
    const safeLowerBound = (val: any, lowerBound: number) => {
        if (typeof (val) === 'number') {
            return Math.max(lowerBound, val);
        }
    }
    const settings = getSettings();
    mainWindow = new Electron.BrowserWindow(
        {
            width: safeLowerBound(settings.windowState.width, 0),
            height: safeLowerBound(settings.windowState.height, 0),
            x: safeLowerBound(settings.windowState.left, 0),
            y: safeLowerBound(settings.windowState.top, 0)
        });
    mainWindow.setTitle(`Microsoft Bot Framework Emulator (v${pjson.version})`);


    //mainWindow.webContents.openDevTools();


    if (process.platform === 'darwin') {
        // Create the Application's main menu
        var template: Electron.MenuItemOptions[] = [
            {
                label: "Bot Framework Emulator",
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
                { label: "Paste", accelerator: "CmdOrCtrl+V", role: "paste" }
            ]}
        ];
        Menu.setApplicationMenu(Menu.buildFromTemplate(template));
    } else {
        Menu.setApplicationMenu(null);
    }

    mainWindow.on('resize', () => {
        const bounds = mainWindow.getBounds();
        dispatch<WindowStateAction>({
            type: 'Window_RememberBounds',
            state: {
                width: bounds.width,
                height: bounds.height,
                left: bounds.x,
                top: bounds.y
            }
        });
    });
    mainWindow.on('move', () => {
        const bounds = mainWindow.getBounds();
        dispatch<WindowStateAction>({
            type: 'Window_RememberBounds',
            state: {
                width: bounds.width,
                height: bounds.height,
                left: bounds.x,
                top: bounds.y
            }
        });
    });
    mainWindow.on('closed', function () {
        mainWindow = null;
    });

    mainWindow.webContents.once('did-finish-load', () => {
        let page = url.format({
            protocol: 'file',
            slashes: true,
            pathname: path.join(__dirname, '../client/index.html')
        });
        mainWindow.loadURL(page);
    });
    let splash = url.format({
        protocol: 'file',
        slashes: true,
        pathname: path.join(__dirname, '../client/splash.html')
    });
    mainWindow.loadURL(splash);
}

const shouldQuit = Electron.app.makeSingleInstance((commandLine, workingDirectory) => {
    if (mainWindow) {
        if (mainWindow.isMinimized())
            mainWindow.restore();
        mainWindow.focus();
    }
});

if (shouldQuit) {
    Electron.app.quit();
} else {
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
}

// Do this last, otherwise startup bugs are harder to diagnose.
require('electron-debug')();
