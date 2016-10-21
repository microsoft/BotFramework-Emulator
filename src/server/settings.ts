import { Store, createStore, combineReducers, Reducer } from 'redux';
import { directLineReducer } from './reducers/directLineReducer';
import { frameworkReducer } from './reducers/frameworkReducer';
import { botsReducer, activeBotReducer } from './reducers/botReducer';
import { windowStateReducer } from './reducers/windowStateReducer';
import * as Electron from 'electron';
import { emulator } from './emulator';
import { IBot } from '../types/botTypes';
import { loadSettings, saveSettings } from '../utils';


export interface IDirectLineSettings {
    port: number,
}

export interface IFrameworkSettings {
    port: number,
}

export interface IWindowStateSettings {
    width: number,
    height: number,
    left: number,
    top: number
}

export interface ISettings {
    directLine?: IDirectLineSettings,
    framework?: IFrameworkSettings,
    bots?: IBot[],
    activeBot?: string,
    windowState?: IWindowStateSettings
}

export class Settings implements ISettings {
    directLine: IDirectLineSettings;
    framework: IFrameworkSettings;
    bots: IBot[];
    activeBot: string;
    windowState: IWindowStateSettings;

    constructor(settings?: ISettings) {
        if (settings) {
            Object.assign(this, settings);
        }
    }

    getActiveBot = () => {
        return this.botById(this.activeBot);
    }

    botById = (botId: string) => {
        return this.bots.find(value => value.botId === botId);
    }
}

export const directLineDefault: IDirectLineSettings = {
    port: 9001
}

export const frameworkDefault: IFrameworkSettings = {
    port: 9002
}

export const windowStateDefault: IWindowStateSettings = {
    width: 800,
    height: 600,
    left: 100,
    top: 50
}

export const settingsDefault: ISettings = {
    directLine: directLineDefault,
    framework: frameworkDefault,
    bots: [],
    activeBot: '',
    windowState: windowStateDefault
};

export var store: Store<ISettings>;

export const getSettings = () => new Settings(store ? store.getState() : settingsDefault);

export const startup = () => {
    // Create the settings store with initial settings from disk.
    const initialSettings = loadSettings('server.json', settingsDefault);
    store = createStore(combineReducers<ISettings>({
        directLine: directLineReducer,
        framework: frameworkReducer,
        bots: botsReducer,
        activeBot: activeBotReducer,
        windowState: windowStateReducer
    }), initialSettings);

    // When changes to settings are made, save to disk.
    var saveTimerSet = false;
    store.subscribe(() => {
        if (!saveTimerSet) {
            saveTimerSet = true;
            setTimeout(() => {
                saveSettings('server.json', store.getState());
                saveTimerSet = false;
            }, 1000);
        }
    });

    // Listen for settings change requests from the client.
    Electron.ipcMain.on('serverChangeSetting', (event, ...args) => {
        // Apply change requests to the settings store.
        store.dispatch({
            type: args[0],
            state: args[1]
        });
    });
}

export const authenticationSettings = {
    refreshEndpoint: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    refreshScope: 'https://graph.microsoft.com/.default',
    msaOpenIdMetadata: 'https://login.microsoftonline.com/common/v2.0/.well-known/openid-configuration',
    msaIssuer: 'https://sts.windows.net/72f988bf-86f1-41af-91ab-2d7cd011db47/',
    msaAudience: 'https://graph.microsoft.com',
    stateEndpoint:  'https://state.botframework.com'
}