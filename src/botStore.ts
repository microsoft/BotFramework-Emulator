import { Reducer } from 'redux';
import { uniqueId } from './utils';
import * as SettingsStore from './settingsStore';


export interface IBot {
    botId: string;
    botUrl: string;
    msaAppId: string;
    msaPassword: string;
}

export type BotsAction = {
    type: 'Bots_AddBot',
    bot: IBot
} | {
    type: 'Bots_RemoveBot',
    botId: string
} | {
    type: 'Bots_EditBot',
    botId: string
    bot: IBot
} | {
    type: 'Bots_SetState',
    bots: IBot[]
}

export const botsReducer: Reducer<IBot[]> = (
    state: IBot[] = [],
    action: BotsAction
) => {
    console.log('botsReducer', JSON.stringify(action), JSON.stringify(state));
    switch (action.type) {
        case 'Bots_AddBot': {
            return [
                ...state,
                Object.assign({}, action.bot, { botId: uniqueId(), activities: [] })];
        }
        case 'Bots_RemoveBot': {
            let index = state.findIndex(value => value.botId == action.botId);
            if (index) {
                return [
                    ...state.slice(0, index),
                    ...state.slice(index + 1)];
            } else {
                return state;
            }
        }
        case 'Bots_EditBot': {
            let index = state.findIndex(value => value.botId == action.botId);
            if (index) {
                return [
                    ...state.slice(0, index),
                    Object.assign({}, action.bot, { botId: state[index].botId}),
                    ...state.slice(index + 1)];
            } else {
                return state;
            }
        }
        case 'Bots_SetState': {
            return [...(action.bots || []).slice(0)];
        }
        default:
            return state
    }
}

export type ActiveBotAction = {
    type: 'ActiveBot_Set',
    botId: string
} | {
    type: 'ActiveBot_SetState',
    botId: string
}

export const activeBotReducer: Reducer<string> = (
    state = '',
    action: ActiveBotAction
) => {
    console.log('activeBotReducer', JSON.stringify(action), JSON.stringify(state));
    switch (action.type) {
        case 'ActiveBot_Set':
        case 'ActiveBot_SetState':
            return action.botId || state;
        default:
            return state
    }
}

export const botForId = (botId: string): IBot => {
    return SettingsStore.store.getState().bots.find(value => value.botId === botId);
}
