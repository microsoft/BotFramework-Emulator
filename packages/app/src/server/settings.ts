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
import { frameworkReducer } from './reducers/frameworkReducer';
import { botsReducer, activeBotReducer } from './reducers/botReducer';
import { windowStateReducer } from './reducers/windowStateReducer';
import { usersReducer } from './reducers/usersReducer';
import { loadSettings, saveSettings } from '../shared/utils';
import { IBot } from '../types/botTypes';
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
    // Listen for settings change requests from the client.
    Electron.ipcMain.on('serverChangeSetting', (event, ...args) => {
        // Apply change requests to the settings store.
        getStore().dispatch({
            type: args[0],
            state: args[1]
        });
    });

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
    tokenEndpoint: 'https://login.microsoftonline.com/botframework.com/oauth2/v2.0/token',
    openIdMetadata: 'https://login.microsoftonline.com/botframework.com/v2.0/.well-known/openid-configuration',
    botTokenAudience: 'https://api.botframework.com',
}

export const v31AuthenticationSettings = {
    tokenIssuer: 'https://sts.windows.net/d6d49420-f39b-4df7-a1dc-d59a935871db/',
}

export const v32AuthenticationSettings = {
    tokenIssuerV1: 'https://sts.windows.net/f8cdef31-a31e-4b4a-93e4-5f571e91255a/',
    tokenIssuerV2: 'https://login.microsoftonline.com/f8cdef31-a31e-4b4a-93e4-5f571e91255a/v2.0'
}

export const speechSettings = {
    tokenEndpoint: 'https://login.botframework.com/v3/speechtoken'
}