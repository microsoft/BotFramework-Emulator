import * as BotActions from '../action/botActions';
import { IBot, IBotInfo } from '@bfemulator/app-shared';
import { CommandService } from '../../platform/commands/commandService';

export interface IBotState {
  activeBot: IBot;
  botFiles: IBotInfo[];
}

export type BotAction = {
  type: 'BOT/CREATE',
  payload: IBot
} | {
  type: 'BOT/DELETE',
  payload: string
} | {
  type: 'BOT/LOAD',
  payload: IBotInfo[]
} | {
  type: 'BOT/PATCH',
  payload: IBot
} | {
  type: 'BOT/SET_ACTIVE',
  payload: IBot
};

const DEFAULT_STATE: IBotState = {
  activeBot: null,
  botFiles: []
};

export const bot: any = (state: IBotState = DEFAULT_STATE, action: BotAction) => {
  switch(action.type) {
    case BotActions.CREATE: {
      // set active bot and add bot to bots list
      const newBot: IBotInfo = { path: action.payload.path };
      const bots = [...state.botFiles];
      bots.unshift(newBot);
      state = setBotFilesState(bots, state);
      state = setActiveBot(action.payload, state);
      break;
    }

    case BotActions.DELETE: {
      const bots = state.botFiles.filter(bot => bot.path !== action.payload);
      state = setBotFilesState(bots, state);

      if (state.activeBot.path === action.payload) {
        state = setActiveBot(null, state);
      }
      break;
    }

    case BotActions.LOAD: {
      state = setBotFilesState(action.payload, state);
      break;
    }

    case BotActions.PATCH: {
      const patchedBot = {
        ...state.activeBot,
        ...action.payload
      };
      state = setActiveBot(patchedBot, state);
      break;
    }

    case BotActions.SET_ACTIVE: {
      state = setActiveBot(action.payload, state);
      break;
    }

    default: break;
  }
  return state;
}

function setActiveBot(bot: IBot, state: IBotState): IBotState {
  let newState = Object.assign({}, state);

  newState.activeBot = bot;
  return newState;
}

function setBotFilesState(botFilesState: IBotInfo, state: IBotState): IBotState {
  let newState = Object.assign({}, state);

  newState.botFiles = botFilesState;
  return newState;
}
