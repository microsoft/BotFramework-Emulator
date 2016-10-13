import * as Electron from 'electron';
import { readFileSync } from 'fs';
import { Emulator } from './emulator';

require('electron-debug')();

Emulator.startup();

export var mainWindow: Electron.BrowserWindow;

const createMainWindow = () => {
    mainWindow = new Electron.BrowserWindow({ width: 1500, height: 1000 });
    mainWindow.setMenu(null);
    mainWindow.loadURL(`file://${__dirname}/index.html`);

    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}

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
