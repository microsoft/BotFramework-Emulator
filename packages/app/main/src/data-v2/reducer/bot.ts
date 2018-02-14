import * as BotActions from '../action/bot';

export interface IBotState {
  activeBot: string;
  bots: Array<any>;
}

export type BotAction = {
  type: 'BOT/LOAD_BOTS_RESPONSE',
  payload: any
} | {
  type: 'BOT/LOAD_BOTS_SERVER',
  payload: any
};

const DEFAULT_STATE: IBotState = {
  activeBot: null,
  bots: []
};

export const bot: any = (state: IBotState = DEFAULT_STATE, action: BotAction) => {
  switch(action.type) {
    case BotActions.LOAD_BOTS_RESPONSE: {
      state = setBotsState(action.payload, state);
      break;
    }

    default: break;
  }
  return state;
}

function setBotsState(botsState, state) {
  let newState = Object.assign({}, state);

  newState.bots = botsState;
  return newState;
}
