import { DirectLineServer } from './directLine/directLineServer';
import { FrameworkServer } from './framework/frameworkServer';
import { ConversationStore } from './conversationStore';
import { ISettings } from './settingsTypes';
import * as Electron from 'electron';
import { mainWindow } from './main';


class Emulator {
    directLineServer = new DirectLineServer();
    frameworkServer = new FrameworkServer();
    conversationStore = new ConversationStore();

    send = (channel: string, ...args: any[]) => {
        mainWindow.webContents.send(channel, args);
    }
}

export var emulator: Emulator;

export const configure = (settings: ISettings) => {
    console.log(`configure: ${settings}`);
    emulator = emulator || new Emulator();
    emulator.directLineServer.configure(settings.directLineSettings);
    emulator.frameworkServer.configure(settings.frameworkSettings);
    emulator.send('configure', settings);
}

export const change = (event: Electron.IpcMainEvent, ...args: any[]) => {
    console.log(`change: ${event}, ${args}`);
}
