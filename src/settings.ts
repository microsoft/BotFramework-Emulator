import { Store, createStore, combineReducers, Reducer } from 'redux';
import * as fs from 'fs';
import { IDirectLineState, DirectLineAction, directLineSettings, directLineDefault } from './directLine/directLineServer';
import { IFrameworkState, FrameworkAction, frameworkSettings, frameworkDefault } from './framework/frameworkServer';
import * as Emulator from './emulator';


interface IBot {
    botUrl: string;
    msaAppId: string;
    msaPassword: string;
}


export interface ISettings {
    // Persistent values
    directLineSettings: IDirectLineState,
    frameworkSettings: IFrameworkState,
    bots: IBot[]
    // Transient values
    //locale: string;
    //username: string;
    //conversations: string[];
    //memberCount: number;
}

const settingsDefault: ISettings = {
    directLineSettings: directLineDefault,
    frameworkSettings: frameworkDefault,
    bots: []
}

var store: Store<ISettings>;

export const startup = () => {
    let settings: ISettings;
    try {
        settings = JSON.parse(fs.readFileSync('settings.json', 'utf8'));
    } catch (e) {
        settings = settingsDefault;
    }

    Emulator.configure(settings);

    store = createStore(combineReducers<ISettings>({
        directLineSettings,
        frameworkSettings
    }), settings);

    store.subscribe(() => updateFromStore());
}

const updateFromStore = () => {
    const settings = store.getState();
    fs.writeFileSync('settings.json', JSON.stringify(settings, null, 2), 'utf8');
    Emulator.configure(settings);
}
