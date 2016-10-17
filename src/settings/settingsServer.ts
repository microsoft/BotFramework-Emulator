import { Store, createStore, combineReducers, Reducer } from 'redux';
import { directLineReducer } from './directLineReducer';
import { frameworkReducer } from './frameworkReducer';
import { botsReducer, activeBotReducer } from './botReducer';
import * as Fs from 'fs';
import * as Electron from 'electron';
import { emulator } from '../emulator';
import { IBot } from '../types/botTypes';
import { ISettings, Settings, settingsDefault } from '../types/settingsTypes';


export var store: Store<ISettings>;

export const settings = () => new Settings(store ? store.getState() : settingsDefault);

const loadSettings = (): ISettings => {
    try {
        let savedSettings = JSON.parse(Fs.readFileSync('settings.json', 'utf8'));
        let settings: ISettings = {
            directLine: Object.assign(settingsDefault.directLine, savedSettings.directLine),
            framework: Object.assign(settingsDefault.framework, savedSettings.framework),
            bots: [...(savedSettings.bots || settingsDefault.bots)],
            activeBot: savedSettings.activeBot || settingsDefault.activeBot
        };
        return settings;
    } catch (e) {
        console.error('Failed to read settings.json', e);
        return settingsDefault;
    }
}

const saveSettings = () => {
    try {
        Fs.writeFileSync('settings.json', JSON.stringify(store.getState(), null, 2), 'utf8');
    } catch (e) {
        console.error('Failed to write settings.json', e);
    }
}

export const startup = (callback: Function) => {
    // Create the settings store with initial settings from disk.
    const initialSettings = loadSettings();
    store = createStore(combineReducers<ISettings>({
        directLine: directLineReducer,
        framework: frameworkReducer,
        bots: botsReducer,
        activeBot: activeBotReducer
    }), initialSettings);

    // When changes to settings are made, save to disk and also forward to the client.
    store.subscribe(() => {
        saveSettings();
        emulator.send('configure', store.getState());
    });

    // Listen for settings change requests from the client.
    Electron.ipcMain.on('change', (event, ...args) => {
        // Apply change requests to the settings store.
        store.dispatch({
            type: args[0],
            state: args[1]
        });
    });

    // Done with setup.
    callback();
}
