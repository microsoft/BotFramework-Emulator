import { ISettings, settingsDefault } from './settingsTypes';
import * as Electron from 'electron';

export const startup = () => {

    Electron.ipcRenderer.on('configure', (event: Electron.IpcRendererEvent, ...args: any[]) => {
        console.log(`configure: ${event}, ${args}`);

    });

    Electron.ipcRenderer.on('change', (event: Electron.IpcRendererEvent, ...args: any[]) => {
        console.log(`change: ${event}, ${args}`);
    });
}

export const change = (action: string, args: any[]) => {
    Electron.ipcRenderer.send('change', args);
}
