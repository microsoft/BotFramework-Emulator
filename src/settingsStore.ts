import { Store, createStore, combineReducers, Reducer } from 'redux';
import { IDirectLineState, directLineDefault, directLineReducer } from './directLine/directLineStore';
import { IFrameworkState, frameworkDefault, frameworkReducer } from './framework/frameworkStore';
import { IBot, botsReducer, activeBotReducer } from './botStore';


export var store: Store<ISettings>;

export interface ISettings {
    directLine: IDirectLineState,
    framework: IFrameworkState,
    bots: IBot[],
    activeBot: string
}

export const settingsDefault: ISettings = {
    directLine: directLineDefault,
    framework: frameworkDefault,
    bots: [],
    activeBot: ''
}

export const startup = (initialSettings = settingsDefault) => {
    store = createStore(combineReducers<ISettings>({
        directLine: directLineReducer,
        framework: frameworkReducer,
        bots: botsReducer,
        activeBot: activeBotReducer
    }), initialSettings);
}
