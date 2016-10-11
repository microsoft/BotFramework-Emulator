import { Store, createStore, combineReducers, Reducer } from 'redux';
import * as fs from 'fs';
import { IDirectLineState, directLineDefault } from './directLine/directLineTypes';
import { DirectLineAction, directLineSettings } from './directLine/directLineServer';
import { IFrameworkState, frameworkDefault } from './framework/frameworkTypes';
import { FrameworkAction, frameworkSettings } from './framework/frameworkServer';
import { ISettings, settingsDefault } from './settingsTypes';
import * as Electron from 'electron';
import * as Emulator from './emulator';


var store: Store<ISettings>;

export const startup = () => {
    let settings: ISettings;
    try {
        settings = JSON.parse(fs.readFileSync('settings.json', 'utf8'));
    } catch (e) {
        settings = settingsDefault;
    }

    Emulator.configure(settings);

    store = createStore(combineReducers<ISettings>({
        directLineSettings,
        frameworkSettings
    }), settings);

    store.subscribe(() => {
        const settings = store.getState();
        fs.writeFileSync('settings.json', JSON.stringify(settings, null, 2), 'utf8');
        Emulator.configure(settings);
    });

    Electron.ipcMain.on('change', (event: Electron.IpcMainEvent, ...args: any[]) => {
        Emulator.change(event, args);
    })
}
