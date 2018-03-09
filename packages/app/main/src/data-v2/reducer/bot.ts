import * as BotActions from '../action/bot';
import { getBotDisplayName, IBot, IBotInfo } from '@bfemulator/app-shared';

export interface IBotState {
  activeBot: IBot;
  botFiles: IBotInfo[];
}

export type BotAction = {
  type: 'BOT/CREATE',
  payload: {
    bot: IBot,
    botFilePath: string
  }
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
      const newBot: IBotInfo = { path: action.payload.botFilePath, id: action.payload.bot.id, displayName: getBotDisplayName(action.payload.bot) };
      const bots = [...state.botFiles];
      bots.unshift(newBot);
      state = setBotFilesState(bots, state);
      state = setActiveBot(action.payload.bot, state);
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
      // update the bot display name in the list if it was changed
      const bot = state.botFiles.find(bot => bot.id === action.payload.id);
      bot.displayName = getBotDisplayName(action.payload);
      state = setActiveBot(patchedBot, state);
      break;
    }

    case BotActions.SET_ACTIVE: {
      // move active bot up to the top of the recent bots list
      const mostRecentBot = state.botFiles.find(bot => bot.id === action.payload.id);
      let recentBots = state.botFiles.filter(bot => bot.id !== action.payload.id);
      recentBots.unshift(mostRecentBot);
      state = setBotFilesState(recentBots, state);
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

function setBotFilesState(botFilesState: IBotInfo[], state: IBotState): IBotState {
  let newState = Object.assign({}, state);

  newState.botFiles = botFilesState;
  return newState;
}
