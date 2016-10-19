import * as Electron from 'electron';
import { Emulator } from './emulator';

require('electron-debug')();

Emulator.startup();

export var mainWindow: Electron.BrowserWindow;

const createMainWindow = () => {
    // TODO @eanders: Read client.json settings file for window size, etc.
    mainWindow = new Electron.BrowserWindow({ width: 1500, height: 1000 });
    mainWindow.setMenu(null);
    mainWindow.loadURL(`file://${__dirname}/../client/index.html`);

    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}

Electron.app.on('ready', createMainWindow);

Electron.app.on('window-all-closed', function () {
    // TODO @eanders: Write client.json settings file for window size, etc.
    if (process.platform !== 'darwin') {
        Electron.app.quit();
    }
});

Electron.app.on('activate', function () {
    if (mainWindow === null) {
        createMainWindow();
    }
});
