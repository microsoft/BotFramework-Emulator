import * as Electron from 'electron';
import { Emulator } from './emulator';
import { store, getSettings } from './settings';
import { WindowStateAction } from './reducers/windowStateReducer';

require('electron-debug')();

Emulator.startup();

export var mainWindow: Electron.BrowserWindow;

const createMainWindow = () => {
    const settings = getSettings();

    mainWindow = new Electron.BrowserWindow(
    {
        width: settings.windowState.width,
        height: settings.windowState.height,
        x: settings.windowState.left,
        y: settings.windowState.top
    });
    mainWindow.setMenu(null);
    mainWindow.loadURL(`file://${__dirname}/../client/index.html`);

    mainWindow.on('resize', () => {
        const bounds = mainWindow.getBounds();
        store.dispatch<WindowStateAction>({
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
        store.dispatch<WindowStateAction>({
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
