import { DirectLineServer } from './directLine/directLineServer';
import { FrameworkServer } from './framework/frameworkServer';
import * as SettingsStore from './settingsStore';
import * as SettingsServer from './settingsServer';
import * as Electron from 'electron';
import { mainWindow } from './main';



class Emulator {
    mainWindow: Electron.BrowserWindow;
    directLineServer = new DirectLineServer();
    frameworkServer = new FrameworkServer();

    constructor() {
        Electron.ipcMain.on('started', () => {
            this.mainWindow = mainWindow;
            this.send('configure', SettingsStore.store.getState());
        });
    }

    send = (channel: string, ...args: any[]) => {
        if (this.mainWindow) {
            this.mainWindow.webContents.send(channel, args);
        }
    }

    configure = (settings: SettingsStore.ISettings) => {
        console.log("configure: ", settings);
        SettingsServer.saveSettings(settings);
        this.directLineServer.configure(settings);
        this.frameworkServer.configure(settings);
        this.send('configure', settings);
    }
}

var emulator: Emulator;

export const startup = () => {
    emulator = new Emulator();
    SettingsServer.startup();
}

export const configure = (settings: SettingsStore.ISettings) => {
    emulator.configure(settings);
}
