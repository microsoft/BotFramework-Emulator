import * as BotActions from '../action/botActions';
import { getBotDisplayName, IBotInfo } from '@bfemulator/app-shared';
import { IBotConfig } from '@bfemulator/sdk-shared';
import { getBotInfoByPath } from '../botHelpers';

export interface IBotState {
  activeBot: IBotConfig;
  botFiles: IBotInfo[];
}

export type BotAction = {
  type: 'BOT/CREATE',
  payload: {
    bot: IBotConfig,
    botFilePath: string,
    secret: string
  }
} | {
  type: 'BOT/LOAD',
  payload: {
    bots: IBotInfo[]
  }
} | {
  type: 'BOT/PATCH',
  payload: {
    bot: IBotConfig,
    secret?: string
  }
} | {
  type: 'BOT/SET_ACTIVE',
  payload: {
    bot: IBotConfig
  }
} | {
  type: 'BOT/CLOSE',
  payload: {   
  } 
};

const DEFAULT_STATE: IBotState = {
  activeBot: null,
  botFiles: []
};

export default function bot(state: IBotState = DEFAULT_STATE, action: BotAction) {
  switch(action.type) {
    case BotActions.CREATE: {
      const newBot: IBotInfo = { path: action.payload.botFilePath, displayName: getBotDisplayName(action.payload.bot), secret: action.payload.secret };
      const bots = [...state.botFiles].filter(bot => bot.path !== action.payload.botFilePath);
      bots.unshift(newBot);
      state = setBotFilesState(bots, state);
      break;
    }

    case BotActions.LOAD: {
      state = setBotFilesState(action.payload.bots, state);
      break;
    }

    case BotActions.PATCH: {
      const patchedBot = {
        ...state.activeBot,
        ...action.payload.bot
      };
      // update the bot display name in the list if it was changed
      const bot = getBotInfoByPath(action.payload.bot.path);
      if (bot) {
        bot.displayName = getBotDisplayName(action.payload.bot);
        if (action.payload.secret)
          bot.secret = action.payload.secret;
      }
      state = setActiveBot(patchedBot, state);
      break;
    }

    case BotActions.SET_ACTIVE: {
      // move active bot up to the top of the recent bots list
      const mostRecentBot = state.botFiles.find(bot => bot && bot.path === action.payload.bot.path);
      let recentBots = state.botFiles.filter(bot => bot && bot.path !== action.payload.bot.path);
      recentBots.unshift(mostRecentBot);
      state = setBotFilesState(recentBots, state);
      state = setActiveBot(action.payload.bot, state);
      break;
    }

    case BotActions.CLOSE: {
      // close the ative bot
      state = setActiveBot(null, state);
      break;
    }
    
    default: break;
  }
  return state;
}

function setActiveBot(bot: IBotConfig, state: IBotState): IBotState {
  let newState = Object.assign({}, state);

  newState.activeBot = bot;
  return newState;
}

function setBotFilesState(botFilesState: IBotInfo[], state: IBotState): IBotState {
  let newState = Object.assign({}, state);

  newState.botFiles = botFilesState;
  return newState;
}
