//
// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license.
//
// Microsoft Bot Framework: http://botframework.com
//
// Bot Framework Emulator Github:
// https://github.com/Microsoft/BotFramwork-Emulator
//
// Copyright (c) Microsoft Corporation
// All rights reserved.
//
// MIT License:
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//

import * as Electron from 'electron';
import { Store, createStore, combineReducers, Action } from 'redux';
import { BehaviorSubject } from 'rxjs';
import { ActivityOrID } from '../types/activityTypes';
import { Settings as ServerSettings } from '../types/serverSettingsTypes';
import { InspectorActions, ConversationActions, HotkeyActions } from './reducers';
import { loadSettings, saveSettings } from '../shared/utils';
import {
    layoutReducer,
    addressBarReducer,
    conversationReducer,
    logReducer,
    wordWrapReducer,
    inspectorReducer,
    hotkeyReducer,
    serverSettingsReducer,
    ServerSettingsActions,
    AddressBarActions
} from './reducers';
import { IBot } from '../types/botTypes';
import * as log from './log';
import { Emulator } from './emulator';


export const selectedActivity$ = (): BehaviorSubject<ActivityOrID> => {
    if (!global['selectedActivity$']) {
        global['selectedActivity$'] = new BehaviorSubject<ActivityOrID>({});
    }
    return global['selectedActivity$'];
}

export const deselectActivity = () => {
    selectedActivity$().next({});
}

export interface ILayoutState {
    horizSplit?: number | string,
    vertSplit?: number | string,
}

export interface IWordWrapState {
    wordwrap?: boolean
}

export interface IAddressBarState {
    text?: string,
    matchingBots?: IBot[],
    selectedBot: IBot,
    showAbout: boolean,
    showAppSettings: boolean,
    showConversationSettings: boolean,
    showSearchResults: boolean,
    showBotCreds: boolean,
    hasFocus: boolean
}

export interface IConversationState {
    chatEnabled?: boolean,
    conversationId?: string
}

export interface ILogState {
    autoscroll?: boolean
}

export interface IHotkeyState {
    openMenu: boolean,
    toggleAddressBarFocus: boolean,
}

export interface IInspectorState {
    selectedObject?: any
}

export interface IPersistentSettings {
    layout?: ILayoutState,
    wordwrap?: IWordWrapState
}

export class PersistentSettings implements IPersistentSettings {
    layout: ILayoutState;
    wordwrap: IWordWrapState;
    constructor(settings: ISettings) {
        Object.assign(this, {
            layout: {
                horizSplit: settings.layout.horizSplit,
                vertSplit: settings.layout.vertSplit
            },
            wordwrap: {
                wordwrap: settings.wordwrap.wordwrap
            }
        });
    }
}

export interface ISettings extends IPersistentSettings {
    addressBar?: IAddressBarState,
    conversation: IConversationState,
    log?: ILogState,
    inspector?: IInspectorState,
    hotkey?: IHotkeyState,
    serverSettings?: ServerSettings,
}

export class Settings implements ISettings {
    layout: ILayoutState;
    addressBar: IAddressBarState;
    conversation: IConversationState;
    log: ILogState;
    inspector: IInspectorState;
    serverSettings: ServerSettings;
    wordwrap: IWordWrapState;
    hotkey: IHotkeyState;

    constructor(settings?: ISettings) {
        Object.assign(this, settings);
    }
}

export const layoutDefault: ILayoutState = {
    horizSplit: 200,
    vertSplit: 300
}

export const addressBarDefault: IAddressBarState = {
    text: '',
    matchingBots: [],
    selectedBot: null,
    showAbout: false,
    showAppSettings: false,
    showConversationSettings: false,
    showSearchResults: false,
    showBotCreds: false,
    hasFocus: false
}

export const conversationDefault: IConversationState = {
    chatEnabled: false,
    conversationId: ''
}

export const logDefault: ILogState = {
    autoscroll: true
}

export const wordWrapDefault: IWordWrapState = {
    wordwrap: false
}

export const inspectorDefault: IInspectorState = {
    selectedObject: null
}

export const hotkeyDefault: IHotkeyState = {
    openMenu: false,
    toggleAddressBarFocus: false,
}

export const settingsDefault: ISettings = {
    layout: layoutDefault,
    addressBar: addressBarDefault,
    conversation: conversationDefault,
    log: logDefault,
    wordwrap: wordWrapDefault,
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
            wordwrap: wordWrapReducer,
            inspector: inspectorReducer,
            hotkey: hotkeyReducer,
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

    selectedActivity$().subscribe((value) => {
        InspectorActions.setSelectedObject(value);
    });

    // Listen for new settings from the server.
    Electron.ipcRenderer.on('serverSettings', (event, ...args) => {
        const serverSettings = new ServerSettings(args[0]);
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
    Electron.ipcRenderer.on('show-about', () => {
        AddressBarActions.showAbout()
    });
    Electron.ipcRenderer.on('open-menu', () => {
        HotkeyActions.openMenu()
    });
    Electron.ipcRenderer.on('toggle-address-bar-focus', () => {
        HotkeyActions.toggleAddressBarFocus()
    });
    Electron.ipcRenderer.on('new-conversation', (event, ...args) => {
        ConversationActions.newConversation(args[0]);
    });
    Electron.ipcRenderer.on('listening', (event, ...args) => {
        Emulator.serviceUrl = args[0].serviceUrl;
    });

    // Let the server know we're done starting up. In response, it will send us it's current settings (bot list and such).
    Electron.ipcRenderer.send('clientStarted');
}

/**
 * Sends settings change requests to the server.
 * TODO: Pass this through the Emulator REST API rather than IPC (for future headless emulator support).
 */
export const serverChangeSetting = (action: string, state) => {
    Electron.ipcRenderer.send('serverChangeSetting', action, state);
}
