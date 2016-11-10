import * as Electron from 'electron';
import * as Os from 'os';
import { Store, Reducer, Dispatch, createStore, combineReducers, Action } from 'redux';
import { frameworkReducer } from './reducers/frameworkReducer';
import { botsReducer, activeBotReducer } from './reducers/botReducer';
import { windowStateReducer } from './reducers/windowStateReducer';
import { usersReducer } from './reducers/usersReducer';
import { frameworkDefault } from '../types/serverSettingsTypes';
import { loadSettings, saveSettings } from '../utils';
import { IBot } from '../types/botTypes';
import { logReady } from './log';
import {
    IFrameworkSettings,
    IWindowStateSettings,
    IUserSettings,
    IPersistentSettings,
    ISettings,
    Settings,
    settingsDefault
} from '../types/serverSettingsTypes';


export class PersistentSettings implements IPersistentSettings {
    public framework: IFrameworkSettings;
    public bots: IBot[];
    public windowState: IWindowStateSettings;
    public users: IUserSettings;

    constructor(settings: ISettings) {
        Object.assign(this, {
            framework: settings.framework,
            bots: settings.bots,
            windowState: settings.windowState,
            users: settings.users
        });
    }
}

let started = false;
let store: Store<ISettings>;

export const getStore = (): Store<ISettings> => {
    console.assert(started, 'getStore() called before startup!');
    if (!store) {
        // Create the settings store with initial settings from disk.
        const initialSettings = loadSettings('server.json', settingsDefault);
        // TODO: Validate the settings still apply.

        store = createStore(combineReducers<ISettings>({
            framework: frameworkReducer,
            bots: botsReducer,
            activeBot: activeBotReducer,
            windowState: windowStateReducer,
            users: usersReducer
        }), initialSettings);
    }
    return store;
}

export const dispatch = <T extends Action>(obj: any) => getStore().dispatch<T>(obj);

export const getSettings = () => {
    return new Settings(getStore().getState());
}

export type SettingsActor = (settings: Settings) => void;

let acting = false;
let actors: SettingsActor[] = [];

export const addSettingsListener = (actor: SettingsActor) => {
    actors.push(actor);
    var isSubscribed = true;
    return function unsubscribe() {
        if (!isSubscribed) {
            return;
        }
        isSubscribed = false;
        let index = actors.indexOf(actor);
        actors.splice(index, 1);
    }
}


export const startup = () => {
    Electron.ipcMain.on('logStarted', () => {
        logReady(true);
    });
    Electron.ipcMain.on('logStopped', () => {
        logReady(false);
    });
    // Listen for settings change requests from the client.
    Electron.ipcMain.on('serverChangeSetting', (event, ...args) => {
        // Apply change requests to the settings store.
        getStore().dispatch({
            type: args[0],
            state: args[1]
        });
    });

    // Some defaults must be computed.
    if (Os.platform() === 'win32') {
        frameworkDefault.ngrokPath = `${process.env['USERPROFILE']}\\AppData\\Roaming\\npm\\node_modules\\ngrok\\bin\\ngrok.exe`;
    } else {
        // mac and linux using: npm install -g ngrok
        frameworkDefault.ngrokPath = '/usr/local/bin/ngrok';
    }

    // Guard against calling getSettings before startup.
    started = true;
    // When changes to settings are made, save to disk.
    let saveTimer;
    getStore().subscribe(() => {
        if (!acting) {
            acting = true;
            actors.forEach(actor => actor(getSettings()));
            acting = false;
        }
        clearTimeout(saveTimer);
        saveTimer = setTimeout(() => {
            saveSettings('server.json', new PersistentSettings(getStore().getState()));
        }, 1000);
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
