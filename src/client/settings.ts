import { Store, createStore, combineReducers, Reducer } from 'redux';
import * as Electron from 'electron';
import { ISettings as IServerSettings, Settings as ServerSettings } from '../server/settings';
import { loadSettings, saveSettings } from '../utils';
import { layoutReducer, addressBarReducer, conversationReducer, serverSettingsReducer, ServerSettingsActions } from './reducers';
import { IBot, newBot } from '../types/botTypes';
import { uniqueId } from '../utils';


export interface ILayoutState {
    horizSplit?: number | string,
    vertSplit?: number | string,
}

export interface IPersistentSettings {
    layout: ILayoutState
}

export class PersistentSettings implements IPersistentSettings {
    layout: ILayoutState;
    constructor(settings: ISettings) {
        Object.assign(this, {
            layout: {
                horizSplit: settings.layout.horizSplit,
                vertSplit: settings.layout.vertSplit
            }
        });
    }
}

export interface IAddressBarState {
    text?: string,
    matchingBots?: IBot[],
    selectedBot: IBot
}

export interface IConversationState {
    chatEnabled?: boolean,
    conversationId?: string
}

export interface ISettings extends IPersistentSettings {
    addressBar?: IAddressBarState,
    conversation: IConversationState,
    serverSettings?: ServerSettings
}

export class Settings implements ISettings {
    layout: ILayoutState;
    addressBar: IAddressBarState;
    conversation: IConversationState;
    serverSettings: ServerSettings;

    constructor(settings?: ISettings) {
        Object.assign(this, settings);
    }
}

export const layoutDefault: ILayoutState = {
    horizSplit: '66%',
    vertSplit: '33%'
}

export const addressBarDefault: IAddressBarState = {
    text: '',
    matchingBots: [],
    selectedBot: null
}

export const conversationDefault: IConversationState = {
    chatEnabled: false,
    conversationId: ''
}

export const settingsDefault: ISettings = {
    layout: layoutDefault,
    addressBar: addressBarDefault,
    conversation: conversationDefault,
    serverSettings: new ServerSettings()
}

export const getStore = (): Store<ISettings> => {
    var global = Function('return this')();
    if (!global['emulator-client'])
        global['emulator-client'] = {};
    if (!global['emulator-client'].store) {
        // Create the settings store with initial settings from disk.
        const initialSettings = loadSettings('client.json', settingsDefault);
        global['emulator-client'].store = createStore(combineReducers<ISettings>({
            layout: layoutReducer,
            addressBar: addressBarReducer,
            conversation: conversationReducer,
            serverSettings: serverSettingsReducer
        }), initialSettings);
    }
    return global['emulator-client'].store;
}

export const getSettings = () => new Settings(getStore().getState());

export const startup = () => {
    // When changes to settings are made, save to disk.
    var saveTimerSet = false;
    getStore().subscribe(() => {
        if (!saveTimerSet) {
            saveTimerSet = true;
            setTimeout(() => {
                saveSettings('client.json', new PersistentSettings(getStore().getState()));
                saveTimerSet = false;
            }, 1000);
        }
    });

    // Listen for new settings from the server.
    Electron.ipcRenderer.on('serverSettings', (event, ...args) => {
        const serverSettings = new ServerSettings((args[0][0]));
        console.info("Received new server state.", serverSettings);
        ServerSettingsActions.set(serverSettings);
    });

    // Let the server know we're done starting up. In response, it will send us it's current settings (bot list and such).
    Electron.ipcRenderer.send('clientStarted');
}

/**
 * Sends settings change requests to the server.
 */
export const serverChangeSetting = (action: string, state) => {
    Electron.ipcRenderer.send('serverChangeSetting', action, state);
}
