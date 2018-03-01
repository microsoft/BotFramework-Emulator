import * as BotActions from '../action/bot';
import { IBot } from '@bfemulator/app-shared';

export interface IBotState {
  activeBot: string;
  bots: IBot[];
}

export type BotAction = {
  type: 'BOT/CREATE';
  payload: IBot;
} | {
  type: 'BOT/DELETE',
  payload: any;
} | {
  type: 'BOT/LOAD',
  payload: any
} | {
  type: 'BOT/PATCH',
  payload: any;
} | {
  type: 'BOT/SET_ACTIVE',
  payload: any
};

const DEFAULT_STATE: IBotState = {
  activeBot: null,
  bots: []
};

export const bot: any = (state: IBotState = DEFAULT_STATE, action: BotAction) => {
  switch(action.type) {
    case BotActions.CREATE: {
      // set active bot and add bot to bots list
      const bots = [...state.bots, action.payload];
      state = setBotsState(bots, state);
      state = setActiveBot(action.payload.id, state);
      break;
    }

    case BotActions.DELETE: {
      const bots = state.bots.filter(bot => bot.id !== action.payload.id);
      state = setBotsState(bots, state);

      if (state.activeBot === action.payload.id) {
        state = setActiveBot(null, state);
      }
      break;
    }

    case BotActions.LOAD: {
      state = setBotsState(action.payload, state);
      break;
    }

    case BotActions.PATCH: {
      const botIndex = state.bots.findIndex(bot => bot.id === action.payload.id);
      const patchedBot = {
        ...state.bots[botIndex],
        ...action.payload.bot
      };
      const bots = [...state.bots];
      bots[botIndex] = patchedBot;
      state = setBotsState(bots, state);
      state = setActiveBot(patchedBot.id, state);
      break;
    }

    case BotActions.SET_ACTIVE: {
      state = setActiveBot(action.payload.id, state);
      break;
    }

    default: break;
  }
  return state;
}

function setActiveBot(id, state) {
  let newState = Object.assign({}, state);

  newState.activeBot = id;
  return newState;
}

function setBotsState(botsState, state) {
  let newState = Object.assign({}, state);

  newState.bots = botsState;
  return newState;
}
