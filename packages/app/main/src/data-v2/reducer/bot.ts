import * as BotActions from '../action/bot';
import { getBotDisplayName, IBot, IBotInfo } from '@bfemulator/app-shared';

export interface IBotState {
  activeBot: IBot;
  botFiles: IBotInfo[];
  currentBotDirectory: string;
}

export type BotAction = {
  type: 'BOT/CREATE',
  payload: {
    bot: IBot,
    botFilePath: string
  }
} | {
  type: 'BOT/DELETE',
  payload: {
    path: string,
  }
} | {
  type: 'BOT/LOAD',
  payload: {
    bots: IBotInfo[]
  }
} | {
  type: 'BOT/PATCH',
  payload: {
    bot: IBot
  }
} | {
  type: 'BOT/SET_ACTIVE',
  payload: {
    bot: IBot,
    botDirectory: string
  }
};

const DEFAULT_STATE: IBotState = {
  activeBot: null,
  botFiles: [],
  currentBotDirectory: ''
};

export const bot: any = (state: IBotState = DEFAULT_STATE, action: BotAction) => {
  switch(action.type) {
    case BotActions.CREATE: {
      const newBot: IBotInfo = { path: action.payload.botFilePath, id: action.payload.bot.id, displayName: getBotDisplayName(action.payload.bot) };
      const bots = [...state.botFiles];
      bots.unshift(newBot);
      state = setBotFilesState(bots, state);
      break;
    }

    case BotActions.DELETE: {
      const bots = state.botFiles.filter(bot => bot.path !== action.payload.path);
      state = setBotFilesState(bots, state);

      if (state.activeBot.path === action.payload.path) {
        state = setActiveBot(null, state);
      }
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
      const bot = state.botFiles.find(bot => bot && bot.id === action.payload.bot.id);
      bot.displayName = getBotDisplayName(action.payload.bot);
      state = setActiveBot(patchedBot, state);
      break;
    }

    case BotActions.SET_ACTIVE: {
      // move active bot up to the top of the recent bots list
      const mostRecentBot = state.botFiles.find(bot => bot && bot.id === action.payload.bot.id);
      let recentBots = state.botFiles.filter(bot => bot && bot.id !== action.payload.bot.id);
      recentBots.unshift(mostRecentBot);
      state = setBotFilesState(recentBots, state);
      state = setActiveBot(action.payload.bot, state);
      state = setCurrentBotDirectory(action.payload.botDirectory, state);
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

function setCurrentBotDirectory(botDirectory: string, state: IBotState): IBotState {
  let newState = Object.assign({}, state);

  newState.currentBotDirectory = botDirectory;
  return newState;
}
