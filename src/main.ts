import * as Electron from 'electron';
import { readFileSync } from 'fs';
import * as Settings from './settings';

const app = Electron.app;

let mainWindow: Electron.BrowserWindow | null = null;

const createMainWindow = () => {
    mainWindow = new Electron.BrowserWindow({ width: 1000, height: 600 });
    const url = `file://${__dirname}/index.html`;
    mainWindow.loadURL(url);

    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}

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

Settings.startup();
