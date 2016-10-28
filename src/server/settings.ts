import * as Electron from 'electron';
import { Store, createStore, combineReducers, Reducer } from 'redux';
import { directLineReducer } from './reducers/directLineReducer';
import { frameworkReducer } from './reducers/frameworkReducer';
import { botsReducer, activeBotReducer } from './reducers/botReducer';
import { windowStateReducer } from './reducers/windowStateReducer';
import { usersReducer } from './reducers/usersReducer';
import { loadSettings, saveSettings } from '../utils';
import { IBot } from '../types/botTypes';
import {
    IDirectLineSettings,
    IFrameworkSettings,
    IWindowStateSettings,
    IUserSettings,
    IPersistentSettings,
    ISettings,
    Settings,
    settingsDefault
} from '../types/serverSettingsTypes';


<<<<<<< HEAD
=======
export interface IDirectLineSettings {
    port?: number,
}

export interface IFrameworkSettings {
    port?: number,
    ngrokPath?: string
}

export interface IWindowStateSettings {
    width?: number,
    height?: number,
    left?: number,
    top?: number
}

export interface IUserSettings {
    currentUserId?: string,
    usersById?: { [id: string]: IUser }
}

export interface IPersistentSettings {
    directLine?: IDirectLineSettings,
    framework?: IFrameworkSettings,
    bots?: IBot[],
    windowState?: IWindowStateSettings,
    users: IUserSettings
}

export const getStore = (): Store<ISettings> => {
    let global = Function('return this')();
    if (!global['emulator-server'])
        global['emulator-server'] = {};
    if (!global['emulator-server'].store) {
        // Create the settings store with initial settings from disk.
        const initialSettings = loadSettings('server.json', settingsDefault);
        global['emulator-server'].store = createStore(combineReducers<ISettings>({
            directLine: directLineReducer,
            framework: frameworkReducer,
            bots: botsReducer,
            activeBot: activeBotReducer,
            windowState: windowStateReducer,
            users: usersReducer
        }), initialSettings);
    }
    return global['emulator-server'].store;
}

export const getSettings = () => new Settings(getStore().getState());

export const startup = () => {
    // When changes to settings are made, save to disk.
    let saveTimerSet = false;
    getStore().subscribe(() => {
        if (!saveTimerSet) {
            saveTimerSet = true;
            setTimeout(() => {
                saveSettings('server.json', new PersistentSettings(getStore().getState()));
                saveTimerSet = false;
            }, 1000);
        }
    });

    // Listen for settings change requests from the client.
    Electron.ipcMain.on('serverChangeSetting', (event, ...args) => {
        // Apply change requests to the settings store.
        getStore().dispatch({
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
    stateEndpoint: 'https://state.botframework.com'
}
