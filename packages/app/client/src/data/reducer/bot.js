import * as BotActions from '../action/botActions';
import * as Constants from '../../constants';

const DEFAULT_STATE = {
  activeBot: null,
  bots: []
};

export default function bot(state = DEFAULT_STATE, action) {
  const payload = action.payload;

  switch(action.type) {
    case BotActions.CREATE: {
      // set active bot and add bot to bots list
      const bots = [...state.bots, payload];
      state = setBotsState(bots, state);
      state = setActiveBot(payload.botId, state);
      break;
    }

    case BotActions.LOAD: {
      state = setBotsState(payload, state);
      break;
    }

    case BotActions.PATCH: {
      const botIndex = state.bots.findIndex(bot => bot.botId === payload.botId);
      const patchedBot = {
        ...state.bots[botIndex],
        ...payload.bot
      };
      const bots = [...state.bots];
      bots[botIndex] = patchedBot;
      state = setBotsState(bots, state);
      state = setActiveBot(patchedBot.botId, state);
      break;
    }

    case BotActions.REMOVE:
      break;

    case BotActions.SET_ACTIVE:
      state = setActiveBot(payload, state);
      break;

    default:
      break;
  }
  return state;
}

function setBotsState(bots, state) {
  let newState = Object.assign({}, state);

  newState.bots = bots;
  return newState;
}

function setActiveBot(botId, state) {
  let newState = Object.assign({}, state);

  newState.activeBot = botId;
  return newState;
}
