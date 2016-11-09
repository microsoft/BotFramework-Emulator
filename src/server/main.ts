import * as Electron from 'electron';
import { Emulator } from './emulator';
import { getSettings, dispatch } from './settings';
import { WindowStateAction } from './reducers/windowStateReducer';
import * as url from 'url';
import * as path from 'path';
import * as log from './log';


process.on('uncaughtException', (error: Error) => {
    console.error(error);
    log.error('[err-server]', error.message.toString(), JSON.stringify(error.stack));
});

Emulator.startup();

export let mainWindow: Electron.BrowserWindow;

const createMainWindow = () => {
    // TODO: Make a better/safer window state restoration module
    // (handles change in display dimensions, maximized state, etc)
    const safeLowerBound = (val: any, lowerBound: number) => {
        if (typeof(val) === 'number') {
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
    //mainWindow.webContents.openDevTools();

    mainWindow.setTitle('Microsoft Bot Framework Emulator (alpha)');
    // Mac requires a menu for cut/paste to work.
    if (process.platform !== 'darwin') {
        mainWindow.setMenu(null);
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
            protocol:'file',
            slashes : true,
            pathname: path.join(__dirname, '../client/index.html')
        });
        mainWindow.loadURL(page);
    });
    let splash = url.format({
        protocol:'file',
        slashes : true,
        pathname: path.join(__dirname, '../client/splash.html')
    });
    mainWindow.loadURL(splash);
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
