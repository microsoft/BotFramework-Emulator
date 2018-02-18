import * as BotActions from '../action/bot';

export interface IBotState {
  activeBot: string;
  bots: Array<any>;
}

export type BotAction = {
  type: 'BOT/CREATE';
  payload: any;
} | {
  type: 'BOT/LOAD_BOTS_RESPONSE',
  payload: any
} | {
  type: 'BOT/OPEN';
  payload: any;
} | {
  type: 'BOT/PATCH',
  payload: any;
};

const DEFAULT_STATE: IBotState = {
  activeBot: null,
  bots: []
};

export const bot: any = (state: IBotState = DEFAULT_STATE, action: BotAction) => {
  const payload = action.payload;

  switch(action.type) {
    case BotActions.CREATE:
    case BotActions.OPEN: {
      // set active bot and add bot to bots list
      const bots = [...state.bots, payload];
      state = setBotsState(bots, state);
      state = setActiveBot(payload.handle, state);
      break;
    }

    case BotActions.PATCH: {
      const botIndex = state.bots.findIndex(bot => bot.handle === payload.handle);
      const patchedBot = {
        ...state.bots[botIndex],
        ...payload.bot
      };
      const bots = [...state.bots];
      bots[botIndex] = patchedBot;
      state = setBotsState(bots, state);
      state = setActiveBot(patchedBot.handle, state);
      break;
    }

    default: break;
  }
  return state;
}

function setActiveBot(botHandle, state) {
  let newState = Object.assign({}, state);

  newState.activeBot = botHandle;
  return newState;
}

function setBotsState(botsState, state) {
  let newState = Object.assign({}, state);

  newState.bots = botsState;
  return newState;
}
