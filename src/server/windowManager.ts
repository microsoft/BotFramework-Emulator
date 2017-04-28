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
import * as URL from 'url';
import * as path from 'path';

export class WindowManager {
    private mainWindow: Electron.BrowserWindow;
    private windows: Electron.BrowserWindow[];
    private walletState: {};

    constructor() {
        this.windows = [];

        Electron.ipcMain.on('createWalletWindow', (event, args) => {
            this.createWalletWindow(args.payload, args.settings, args.serviceUrl);
        });
        Electron.ipcMain.on('getWalletState', (event, args) => {
            let state = event.sender['walletState'];
            event.returnValue = state;
        });
    }

    public addMainWindow(window: Electron.BrowserWindow) {
        this.mainWindow = window;
    }

    public hasMainWindow(): boolean {
        return this.mainWindow !== undefined;
    }

    public add(window: Electron.BrowserWindow) {
        this.windows.push(window);
    }

    public remove(window: Electron.BrowserWindow) {
        let idx = this.windows.indexOf(window);
        if (idx !== -1) {
            this.windows = this.windows.splice(idx, 1);
        }
    }

    public createWalletWindow(payload: string, settings: any, serviceUrl: string) {
        let page = URL.format({
            protocol: 'file',
            slashes: true,
            pathname: path.join(__dirname, '../client/payments/index.html')
        });
        page += '?' + payload;

        let walletWindow = new Electron.BrowserWindow({
            width: 1000, 
            height: 620, 
            title: 'Bot Framework Wallet Emulator'});
        this.add(walletWindow);

        walletWindow.webContents['walletState'] = {
            settings: settings,
            serviceUrl: serviceUrl
        };
        
        walletWindow.on('closed', () => {
            this.remove(walletWindow);
        });

        //walletWindow.webContents.openDevTools();

        // Load a remote URL
        walletWindow.loadURL(page);
    }

    public sendToAll(channel: string, ...args: any[]) {
        this.sendToMainWindow(channel, ...args);
        this.sendToWindows(channel, args);
    }

    public sendToMainWindow(channel: string, ...args: any[]) {
        if (this.mainWindow) {
            this.mainWindow.webContents.send(channel, ...args);
        }
    }

    public sendToWindows(channel: string, ...args: any[]) {
        this.windows.forEach(window => window.webContents.send(channel, ...args));
    }
}