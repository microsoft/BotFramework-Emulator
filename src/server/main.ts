import * as Electron from 'electron';
import { Emulator } from './emulator';
import { getSettings, dispatch } from './settings';
import { WindowStateAction } from './reducers/windowStateReducer';
import * as url from 'url';
import * as path from 'path';


process.on('uncaughtException', function (error) {
    console.error(error);
});

Emulator.startup();

export let mainWindow: Electron.BrowserWindow;

const createMainWindow = () => {
    const settings = getSettings();

    mainWindow = new Electron.BrowserWindow(
    {
        width: settings.windowState.width,
        height: settings.windowState.height,
        x: settings.windowState.left,
        y: settings.windowState.top
    });
    mainWindow.setTitle('Bot Framework Emulator');
    mainWindow.setMenu(null);
    let page = url.format({
        protocol:'file',
        slashes : true,
        pathname: path.join(__dirname, '../client/index.html')
    });
    mainWindow.loadURL(page);

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
}

Electron.app.on('ready', createMainWindow);

Electron.app.on('window-all-closed', function () {
    // TODO: Write client.json settings file for window size, etc.
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
