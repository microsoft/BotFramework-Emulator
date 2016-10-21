import { Store, createStore, combineReducers, Reducer } from 'redux';
import { Subject } from '@reactivex/rxjs';
import * as Electron from 'electron';
import { ISettings as IServerSettings, Settings as ServerSettings } from '../server/settings';
import { loadSettings, saveSettings } from '../utils';
import { settingsReducer } from './reducers/reducers';


export interface ISettings {
    horizSplit?: number | string;
    vertSplit?: number | string;
}

export class Settings implements ISettings {
    horizSplit: number | string;
    vertSplit: number | string;

    constructor(settings?: ISettings) {
        if (settings) {
            Object.assign(this, settings);
        }
    }
}

export const settingsDefault: ISettings = {
    horizSplit: '66%',
    vertSplit: '33%'
}

export var store: Store<ISettings>;
export const getSettings = () => new Settings(store ? store.getState() : settingsDefault);
export var serverSettings$ = new Subject<ServerSettings>();

export const startup = () => {

    const initialSettings = loadSettings('client.json', settingsDefault);

    store = createStore(settingsReducer, initialSettings);

    // When changes to settings are made, save to disk.
    var saveTimerSet = false;
    store.subscribe(() => {
        if (!saveTimerSet) {
            saveTimerSet = true;
            setTimeout(() => {
                saveSettings('client.json', store.getState());
                saveTimerSet = false;
            }, 1000);
        }
    });

    // Listen for new settings from the server.
    Electron.ipcRenderer.on('serverSettings', (event, ...args) => {
        let serverSettings = (args[0][0]) as IServerSettings;
        serverSettings$.next(new ServerSettings(serverSettings));

        // TEST ONLY: Add a bot
        if (serverSettings.bots.length == 0) {
            setTimeout(() => {
                serverChangeSetting('Bots_AddBot', { bot: { 
                    botUrl: 'http://localhost:8023/api/MessagesV3'
                    /*botUrl: 'https://cjensentestbot.azurewebsites.net/api/messagesv3', 
                    msaAppId: 'bf4af2fd-4c4e-49eb-ac5d-9976faaa5aa0', 
                    msaPassword: 'LtPc2heSZyD5iDdmnW7KmBC', 
                    botId: 'TestBotV3'*/  
                }});
            }, 100);
        }

        // TEST ONLY: Select a bot
        if (!serverSettings.activeBot.length && serverSettings.bots.length > 0) {
            setTimeout(() => {
                serverChangeSetting('ActiveBot_Set', { botId: serverSettings.bots[0].botId });
            }, 100);
        }
    });

    // Let the server know we're done starting up.
    Electron.ipcRenderer.send('clientStarted');
}

/**
 * Sends settings change requests to the server.
 */
export const serverChangeSetting = (action: string, state) => {
    Electron.ipcRenderer.send('serverChangeSetting', action, state);
}
