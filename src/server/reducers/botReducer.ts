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
