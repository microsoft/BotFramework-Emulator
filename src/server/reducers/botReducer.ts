import { Reducer } from 'redux';
import { uniqueId } from '../../utils';
import { IBot } from '../../types/botTypes';
import { getSettings } from '../settings';


export type BotsAction = {
    type: 'Bots_AddOrUpdateBot',
    state: {
        bot: IBot
    }
} | {
    type: 'Bots_RemoveBot',
    state: {
        botId: string
    }
}

export const botsReducer: Reducer<IBot[]> = (
    state: IBot[] = [],
    action: BotsAction
) => {
    switch (action.type) {
        case 'Bots_AddOrUpdateBot': {
            let botId = action.state.bot.botId || uniqueId();
            const settings = getSettings();
            if (settings.bots.find(value => value.botId === botId)) {
                botId = uniqueId();
            }
            let index = state.findIndex(value => value.botId === action.state.bot.botId);
            if (index >= 0) {
                return [
                    ...state.slice(0, index),
                    Object.assign({}, action.state.bot, { botId: state[index].botId }),
                    ...state.slice(index + 1)];
            } else {
                return [
                    ...state,
                    Object.assign({}, action.state.bot, { botId: botId })];
            }
        }
        case 'Bots_RemoveBot': {
            return state.filter(value => value.botId !== action.state.botId);
        }
        default:
            return state;
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
            return state;
    }
}
