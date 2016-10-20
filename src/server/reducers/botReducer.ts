import { Reducer } from 'redux';
import { uniqueId } from '../../utils';
import { IBot } from '../../types/botTypes';

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
    switch (action.type) {
        case 'Bots_AddBot': {
            return [
                ...state,
                Object.assign({}, action.state.bot, { botId: uniqueId() })];
        }
        case 'Bots_RemoveBot': {
            let index = state.findIndex(value => value.botId === action.state.botId);
            if (index) {
                return [
                    ...state.slice(0, index),
                    ...state.slice(index + 1)];
            } else {
                return state;
            }
        }
        case 'Bots_EditBot': {
            let index = state.findIndex(value => value.botId === action.state.botId);
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
}

export const activeBotReducer: Reducer<string> = (
    state = '',
    action: ActiveBotAction
) => {
    switch (action.type) {
        case 'ActiveBot_Set':
            return action.state.botId || state;
        default:
            return state
    }
}
