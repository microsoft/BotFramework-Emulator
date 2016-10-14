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
        let settings = {
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
    const initialSettings = loadSettings();
    store = createStore(combineReducers<ISettings>({
        directLine: directLineReducer,
        framework: frameworkReducer,
        bots: botsReducer,
        activeBot: activeBotReducer
    }), initialSettings);

    store.subscribe(() => {
        saveSettings();
        emulator.send('configure', store.getState());
    });

    Electron.ipcMain.on('change', (event, ...args) => {
        console.log('change', JSON.stringify(args));
        store.dispatch({
            type: args[0],
            state: args[1]
        });
    });

    if (callback) {
        callback();
    }
}
