import { Store, createStore, combineReducers, Reducer } from 'redux';
import { directLineReducer } from './reducers/directLineReducer';
import { frameworkReducer } from './reducers/frameworkReducer';
import { botsReducer, activeBotReducer } from './reducers/botReducer';
import { windowStateReducer } from './reducers/windowStateReducer';
import { usersReducer } from './reducers/usersReducer';
import * as Electron from 'electron';
import { emulator } from './emulator';
import { IBot } from '../types/botTypes';
import { IUser } from '../types/userTypes';
import { loadSettings, saveSettings } from '../utils';


export interface IDirectLineSettings {
    port?: number,
}

export interface IFrameworkSettings {
    port?: number,
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

export class PersistentSettings implements IPersistentSettings {
    public directLine: IDirectLineSettings;
    public framework: IFrameworkSettings;
    public bots: IBot[];
    public windowState: IWindowStateSettings;
    public users: IUserSettings;

    constructor(settings: ISettings) {
        Object.assign(this, {
            directLine: settings.directLine,
            framework: settings.framework,
            bots: settings.bots,
            windowState: settings.windowState,
            users: settings.users
        });
    }
}

export interface ISettings extends IPersistentSettings {
    activeBot?: string
}

export class Settings implements ISettings {
    public directLine: IDirectLineSettings;
    public framework: IFrameworkSettings;
    public bots: IBot[];
    public windowState: IWindowStateSettings;
    public users: IUserSettings;

    public activeBot: string;

    constructor(settings?: ISettings) {
        Object.assign(this, settings);
    }

    public getActiveBot(): IBot {
        return this.botById(this.activeBot);
    }

    public botById(botId: string): IBot {
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

export const usersDefault: IUserSettings = {
    currentUserId: '12345',
    usersById: {
        '12345': {
            id: '12345',
            name: 'User 1'
        }
    }
}

export const settingsDefault: ISettings = {
    directLine: directLineDefault,
    framework: frameworkDefault,
    bots: [],
    activeBot: '',
    windowState: windowStateDefault,
    users: usersDefault
};

export const getStore = (): Store<ISettings> => {
    var global = Function('return this')();
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
    var saveTimerSet = false;
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