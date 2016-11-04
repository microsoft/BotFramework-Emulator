import { Store, createStore, combineReducers, Reducer, Action } from 'redux';
import * as Electron from 'electron';
import { ISettings as IServerSettings, Settings as ServerSettings } from '../types/serverSettingsTypes';
import { loadSettings, saveSettings } from '../utils';
import {
    layoutReducer,
    addressBarReducer,
    conversationReducer,
    logReducer,
    inspectorReducer,
    serverSettingsReducer,
    ServerSettingsActions
} from './reducers';
import { IBot, newBot } from '../types/botTypes';
import { uniqueId } from '../utils';
import * as log from './log';


export interface ILayoutState {
    horizSplit?: number | string,
    vertSplit?: number | string,
}

export interface IAddressBarState {
    text?: string,
    matchingBots?: IBot[],
    selectedBot: IBot,
    showAppSettings: boolean,
    showConversationSettings: boolean
}

export interface IConversationState {
    chatEnabled?: boolean,
    conversationId?: string
}

export interface ILogState {
    autoscroll?: boolean
}

export interface IInspectorState {
    selectedObject?: any
}

export interface IPersistentSettings {
    layout?: ILayoutState
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

export interface ISettings extends IPersistentSettings {
    addressBar?: IAddressBarState,
    conversation: IConversationState,
    log?: ILogState,
    inspector?: IInspectorState,
    serverSettings?: ServerSettings
}

export class Settings implements ISettings {
    layout: ILayoutState;
    addressBar: IAddressBarState;
    conversation: IConversationState;
    log: ILogState;
    inspector: IInspectorState;
    serverSettings: ServerSettings;

    constructor(settings?: ISettings) {
        Object.assign(this, settings);
    }
}

export const layoutDefault: ILayoutState = {
    horizSplit: '33%',
    vertSplit: '33%'
}

export const addressBarDefault: IAddressBarState = {
    text: '',
    matchingBots: [],
    selectedBot: null,
    showAppSettings: false,
    showConversationSettings: false
}

export const conversationDefault: IConversationState = {
    chatEnabled: false,
    conversationId: ''
}

export const logDefault: ILogState = {
    autoscroll: true
}

export const inspectorDefault: IInspectorState = {
    selectedObject: null
}

export const settingsDefault: ISettings = {
    layout: layoutDefault,
    addressBar: addressBarDefault,
    conversation: conversationDefault,
    log: logDefault,
    inspector: inspectorDefault,
    serverSettings: new ServerSettings()
}

let store: Store<ISettings>;

const getStore = (): Store<ISettings> => {
    if (!store) {
       // Create the settings store with initial settings from disk.
        const initialSettings = loadSettings('client.json', settingsDefault);
        store = createStore(combineReducers<ISettings>({
            layout: layoutReducer,
            addressBar: addressBarReducer,
            conversation: conversationReducer,
            log: logReducer,
            inspector: inspectorReducer,
            serverSettings: serverSettingsReducer
        }), initialSettings);
    }
    return store;
}

export const dispatch = <T extends Action>(obj: any) => getStore().dispatch<T>(obj);

export const getSettings = () => new Settings(getStore().getState());

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
            saveSettings('client.json', new PersistentSettings(getStore().getState()));
        }, 1000);
    });

    // Listen for new settings from the server.
    Electron.ipcRenderer.on('serverSettings', (event, ...args) => {
        const serverSettings = new ServerSettings((args[0][0]));
        //console.info("Received new server state.", serverSettings);
        ServerSettingsActions.set(serverSettings);
    });
    // Listen for log messages from the server.
    Electron.ipcRenderer.on('log-log', (event, ...args) => {
        log.log(args[0], ...args.slice(1));
    });
    Electron.ipcRenderer.on('log-info', (event, ...args) => {
        log.info(args[0], ...args.slice(1));
    });
    Electron.ipcRenderer.on('log-trace', (event, ...args) => {
        log.trace(args[0], ...args.slice(1));
    });
    Electron.ipcRenderer.on('log-debug', (event, ...args) => {
        log.debug(args[0], ...args.slice(1));
    });
    Electron.ipcRenderer.on('log-warn', (event, ...args) => {
        log.warn(args[0], ...args.slice(1));
    });
    Electron.ipcRenderer.on('log-error', (event, ...args) => {
        log.error(args[0], ...args.slice(1));
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
