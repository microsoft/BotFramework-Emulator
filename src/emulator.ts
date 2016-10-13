import { DirectLineServer } from './directLine/directLineServer';
import { FrameworkServer } from './framework/frameworkServer';
import { ConversationManager } from './conversationManager';
import * as SettingsStore from './settings/settingsStore';
import * as SettingsServer from './settings/settingsServer';
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
        Electron.ipcMain.on('started', () => {
            this.mainWindow = mainWindow;
            this.send('configure', SettingsStore.store.getState());
        });
    }

    /**
     * Creates the emulator and loads configuration from disk.
     */
    static startup = () => {
        emulator = new Emulator();
        SettingsServer.startup();
    }

    /**
     * Sends a command to the client.
     */
    send = (channel: string, ...args: any[]) => {
        if (this.mainWindow) {
            this.mainWindow.webContents.send(channel, args);
        }
    }

    /**
     * Applies configuration changes to the system and forwards the new configuration to the client.
     */
    configure = (settings: SettingsStore.ISettings) => {
        console.log("configure: ", settings);
        SettingsServer.saveSettings(settings);
        this.directLine.configure(settings);
        this.framework.configure(settings);
        this.conversations.configure(settings);
        this.send('configure', settings);
    }
}

export var emulator: Emulator;
