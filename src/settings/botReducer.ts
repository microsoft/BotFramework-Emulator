import { Reducer } from 'redux';
import { uniqueId } from '../utils';
import * as SettingsStore from './settingsStore';
import { IBot } from '../bot';

export type BotsAction = {
    type: 'Bots_AddBot',
    state: {
        bot: IBot
    }
} | {
    type: 'Bots_RemoveBot',
    state: {
        botId: string
    }
} | {
    type: 'Bots_EditBot',
    state: {
        botId: string,
        bot: IBot
    }
} | {
    type: 'Bots_SetState',
    state: {
        bots: IBot[]
    }
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
                Object.assign({}, action.state.bot, { botId: uniqueId() })];
        }
        case 'Bots_RemoveBot': {
            let index = state.findIndex(value => value.botId == action.state.botId);
            if (index) {
                return [
                    ...state.slice(0, index),
                    ...state.slice(index + 1)];
            } else {
                return state;
            }
        }
        case 'Bots_EditBot': {
            let index = state.findIndex(value => value.botId == action.state.botId);
            if (index) {
                return [
                    ...state.slice(0, index),
                    Object.assign({}, action.state.bot, { botId: state[index].botId }),
                    ...state.slice(index + 1)];
            } else {
                return state;
            }
        }
        case 'Bots_SetState': {
            return [...(action.state.bots || []).slice(0)];
        }
        default:
            return state
    }
}

export type ActiveBotAction = {
    type: 'ActiveBot_Set',
    state: {
        botId: string
    }
} | {
    type: 'ActiveBot_SetState',
    state: {
        botId: string
    }
}

export const activeBotReducer: Reducer<string> = (
    state = '',
    action: ActiveBotAction
) => {
    console.log('activeBotReducer', JSON.stringify(action), JSON.stringify(state));
    switch (action.type) {
        case 'ActiveBot_Set':
        case 'ActiveBot_SetState':
            return action.state.botId || state;
        default:
            return state
    }
}

export const botForId = (botId: string): IBot => {
    return SettingsStore.store.getState().bots.find(value => value.botId === botId);
}
