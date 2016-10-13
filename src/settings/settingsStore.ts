import { Store, createStore, combineReducers, Reducer } from 'redux';
import { IDirectLineState, directLineDefault, directLineReducer } from './directLineReducer';
import { IFrameworkState, frameworkDefault, frameworkReducer } from './frameworkReducer';
import { botsReducer, activeBotReducer } from './botReducer';
import { IBot } from '../types/botTypes';


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

export const getActiveBot = () => {
    const state = store.getState();
    return state.bots.find(value => value.botId == state.activeBot);
}
