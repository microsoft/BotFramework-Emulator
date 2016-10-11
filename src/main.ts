import * as Electron from 'electron';
import { readFileSync } from 'fs';
import * as Settings from './settingsServer';

require('electron-debug')();

export var mainWindow: Electron.BrowserWindow;

const createMainWindow = () => {
    mainWindow = new Electron.BrowserWindow({ width: 1000, height: 600 });
    mainWindow.setMenu(null);
    const url = `file://${__dirname}/index.html`;
    mainWindow.loadURL(url);

    mainWindow.on('closed', function () {
        mainWindow = null;
    });

    Settings.startup();
}

const app = Electron.app;

app.on('ready', createMainWindow);

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    if (mainWindow === null) {
        createMainWindow();
    }
});
