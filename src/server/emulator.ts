import { DirectLineServer } from './directLine/directLineServer';
import { FrameworkServer } from './framework/frameworkServer';
import { ConversationManager } from './conversationManager';
import * as Settings from './settings';
import * as Electron from 'electron';
import { mainWindow } from './main';


/**
 * Top-level state container for the Node process.
 */
export class Emulator {
    mainWindow: Electron.BrowserWindow;
    directLine = new DirectLineServer();
    framework = new FrameworkServer();
    conversations = new ConversationManager();

    constructor() {
        // When the client notifies us it has started up, send it the configuration.
        Electron.ipcMain.on('clientStarted', () => {
            this.mainWindow = mainWindow;
            this.send('serverSettings', Settings.getStore().getState());
        });
        Settings.getStore().subscribe(() => {
            this.send('serverSettings', Settings.getStore().getState());
        });
    }

    /**
     * Loads settings from disk and then creates the emulator.
     */
    static startup = () => {
        Settings.startup();
        emulator = new Emulator();
    }

    /**
     * Sends a command to the client.
     */
    send = (channel: string, ...args: any[]) => {
        if (this.mainWindow) {
            this.mainWindow.webContents.send(channel, args);
        }
    }
}

export var emulator: Emulator;
