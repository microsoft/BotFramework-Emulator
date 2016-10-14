import { DirectLineServer } from './directLine/directLineServer';
import { FrameworkServer } from './framework/frameworkServer';
import { ConversationManager } from './conversationManager';
import * as SettingsServer from './settings/settingsServer';
import * as Electron from 'electron';
import { mainWindow } from './main';


/**
 * Top-level state container for the Node process.
 */
export class Emulator {
    mainWindow: Electron.BrowserWindow;
    directLine: DirectLineServer;
    framework: FrameworkServer;
    conversations: ConversationManager;

    /**
     * Creates the emulator and loads configuration from disk.
     */
    static startup = () => {
        emulator = new Emulator();
        SettingsServer.startup(() => {
            emulator.create();
            // When the client notifies us it has started up, send it the configuration.
            Electron.ipcMain.on('started', () => {
                emulator.mainWindow = mainWindow;
                emulator.send('configure', SettingsServer.store.getState());
            });
        });
    }

    /**
     * Sends a command to the client.
     */
    send = (channel: string, ...args: any[]) => {
        if (this.mainWindow) {
            this.mainWindow.webContents.send(channel, args);
        }
    }

    private create = () => {
        this.directLine = new DirectLineServer();
        this.framework = new FrameworkServer();
        this.conversations = new ConversationManager();
    }
}

export var emulator: Emulator;
