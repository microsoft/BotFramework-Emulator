import { Store, createStore, combineReducers, Reducer } from 'redux';
import * as Fs from 'fs';
import * as SettingsStore from './settingsStore';
import * as Electron from 'electron';
import { emulator } from '../emulator';
import { IBot } from '../types/botTypes';


interface IPersistentSettings {
    directLine: {
        port: number
    },
    framework: {
        port: number
    },
    bots: IBot[],
    activeBot: string
}

const loadSettings = (): SettingsStore.ISettings => {
    try {
        let savedSettings = JSON.parse(Fs.readFileSync('settings.json', 'utf8'));
        let settings: SettingsStore.ISettings = {
            directLine: Object.assign(SettingsStore.settingsDefault.directLine, savedSettings.directLine),
            framework: Object.assign(SettingsStore.settingsDefault.framework, savedSettings.framework),
            bots: [...(savedSettings.bots || SettingsStore.settingsDefault.bots)],
            activeBot: savedSettings.activeBot || SettingsStore.settingsDefault.activeBot
        };
        return settings;
    } catch (e) {
        console.error('Failed to read settings.json', e);
        return SettingsStore.settingsDefault;
    }
}

export const saveSettings = (settings: SettingsStore.ISettings) => {
    try {
        let savedSettings: IPersistentSettings = {
            directLine: Object.assign({}, settings.directLine),
            framework: Object.assign({}, settings.framework),
            bots: [...settings.bots],
            activeBot: settings.activeBot
        };
        Fs.writeFileSync('settings.json', JSON.stringify(savedSettings, null, 2), 'utf8');
    } catch (e) {
        console.error('Failed to write settings.json', e);
    }
}

export const startup = () => {
    const initialSettings = loadSettings();
    SettingsStore.startup(initialSettings);
    SettingsStore.store.subscribe(() => {
        const newSettings = SettingsStore.store.getState();
        emulator.configure(newSettings);
    });
    Electron.ipcMain.on('change', (event, ...args) => {
        console.log('change', JSON.stringify(args));
        SettingsStore.store.dispatch({
            type: args[0],
            state: args[1]
        });
    });
    emulator.configure(initialSettings);
}
