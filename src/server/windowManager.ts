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
import { getSettings, dispatch } from './settings';
import { WindowStateAction } from './reducers/windowStateReducer';
import { UserTokenController } from './controllers/connector/userTokenController';

export class WindowManager {
    private mainWindow: Electron.BrowserWindow;
    private windows: Electron.BrowserWindow[];

    constructor() {
        this.windows = [];

        Electron.ipcMain.on('createCheckoutWindow', (event, args) => {
            this.createCheckoutWindow(args.payload, args.settings, args.serviceUrl);
        });
        Electron.ipcMain.on('createOAuthWindow', (event, args) => {
            this.createOAuthWindow(args.url, args.settings, args.serviceUrl);
        });
        Electron.ipcMain.on('getCheckoutState', (event, args) => {
            let state = event.sender['checkoutState'];
            event.returnValue = state;
        });
        Electron.ipcMain.on('getOAuthState', (event, args) => {
            let state = event.sender['oauthState'];
            event.returnValue = state;
        });
    }

    public addMainWindow(window: Electron.BrowserWindow) {
        this.mainWindow = window;
    }

    public hasMainWindow(): boolean {
        return this.mainWindow !== undefined;
    }

    public getMainWindow(): Electron.BrowserWindow {
        return this.mainWindow;
    }

    public add(window: Electron.BrowserWindow) {
        this.windows.push(window);
    }

    public remove(window: Electron.BrowserWindow) {
        let idx = this.windows.indexOf(window);
        if (idx !== -1) {
            this.windows.splice(idx, 1);
        }
    }

    public zoomIn() {
        let zoomLevel = getSettings().windowState.zoomLevel;
        zoomLevel = Math.min(zoomLevel + 1, 8);
        this.zoomTo(zoomLevel);
    }
    public zoomOut() {
        let zoomLevel = getSettings().windowState.zoomLevel;
        zoomLevel = Math.max(zoomLevel - 1, -4);
        this.zoomTo(zoomLevel);
    }
    public zoomTo(zoomLevel: number) {
        this.mainWindow.webContents.setZoomLevel(zoomLevel);
        this.windows.forEach(win => win.webContents.setZoomLevel(zoomLevel));
        dispatch<WindowStateAction>({
            type: 'Window_RememberZoomLevel',
            state: {
                zoomLevel: zoomLevel
            }
        });
    }

    public createCheckoutWindow(payload: string, settings: any, serviceUrl: string) {
        let page = URL.format({
            protocol: 'file',
            slashes: true,
            pathname: path.join(__dirname, '../client/payments/index.html')
        });
        page += '?' + payload;

        let checkoutWindow = new Electron.BrowserWindow({
            width: 1000,
            height: 620,
            title: 'Checkout with Microsoft Emulator'
        });
        this.add(checkoutWindow);

        checkoutWindow.webContents['checkoutState'] = {
            settings: settings,
            serviceUrl: serviceUrl
        };

        checkoutWindow.on('closed', () => {
            this.remove(checkoutWindow);
        });

        // checkoutWindow.webContents.openDevTools();

        // Load a remote URL
        checkoutWindow.loadURL(page);

        checkoutWindow.webContents.setZoomLevel(getSettings().windowState.zoomLevel);
    }

    public createOAuthWindow(url: string, settings: any, serviceUrl: string) {
        /*let page = URL.format({
            protocol: 'file',
            slashes: true,
            pathname: path.join(__dirname, '../client/oauth/index.html')
        });
        page += '?' + connectionName;

        let oauthWindow = new Electron.BrowserWindow({
            width: 800,
            height: 180,
            title: 'OAuth Emulator'
        });
        this.add(oauthWindow);

        oauthWindow.webContents['oauthState'] = {
            settings: settings,
            serviceUrl: serviceUrl
        };

        

        oauthWindow.webContents.openDevTools();

        // Load a remote URL
        oauthWindow.loadURL(page);

        oauthWindow.webContents.setZoomLevel(getSettings().windowState.zoomLevel);*/
        let win = new Electron.BrowserWindow({
            width: 800,
            height: 600,
            title: 'SignIn'
        });
        let webContents = win.webContents;
        /*webContents.on('did-get-redirect-request', (event, oldURL, newURL, isMainFrame) => 
        {
            console.log(oldURL);
            console.log(newURL);
        });*/
        
        webContents.setZoomLevel(getSettings().windowState.zoomLevel);
        
        win.on('closed', () => {
            this.remove(win);
        });

        const ses = webContents.session;
        ses.webRequest.onBeforeRequest((details, callback) => {
            if (details.url.toLowerCase().indexOf('postemulatorsignincallback') !== -1) {
                // final OAuth redirect so augment the call with the code_verifier
                var newUrl = details.url + '&code_verifier=' + UserTokenController.CodeVerifier;
                callback({ redirectURL: newUrl });
            }
            else {
                // let the request happen
                callback({});
            }
        });
        
        win.loadURL(url);
    }

    public closeAll() {
        let openWindows = [];
        this.windows.forEach(win => openWindows.push(win));
        openWindows.forEach(win => win.close());
        this.windows = [];
        this.mainWindow = undefined;
    }
}