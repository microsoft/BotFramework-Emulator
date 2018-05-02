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

import { IBotConfig } from 'msbot/bin/schema';
import { IBotConfigWithPath } from '@bfemulator/sdk-shared';
import { cloneBot, getBotInfoByPath } from '../../botHelpers';
import * as BotActions from '../action/bot';
import { getBotDisplayName, IBotInfo } from '@bfemulator/app-shared';

export interface IBotState {
  activeBot: IBotConfig;
  botFiles: IBotInfo[];
  currentBotDirectory: string;
}

export type BotAction = {
  type: 'BOT/LOAD',
  payload: {
    bots: IBotInfo[]
  }
} | {
  type: 'BOT/PATCH',
  payload: {
    bot: IBotConfigWithPath,
    secret?: string
  }
} | {
  type: 'BOT/SET_ACTIVE',
  payload: {
    bot: IBotConfigWithPath
  }
} | {
  type: 'BOT/SET_DIRECTORY',
  payload: {
    directory: string
  }
 } | {
    type: 'BOT/CLOSE',
    payload: {
    }
};

const DEFAULT_STATE: IBotState = {
  activeBot: null,
  botFiles: [],
  currentBotDirectory: ''
};

export const bot: any = (state: IBotState = DEFAULT_STATE, action: BotAction) => {
  switch(action.type) {
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

    case BotActions.SET_DIRECTORY: {
      state = setCurrentBotDirectory(action.payload.directory, state);
      break;
    }

    case BotActions.CLOSE: {
      // close the active bot
      state = setActiveBot(null, state);
      break;
    }

    default: break;
  }
  return state;
}

function setActiveBot(bot: IBotConfig, state: IBotState): IBotState {
  return Object.assign({}, state, {
    get activeBot() {
      return cloneBot(bot); // Clones only - this guarantees only pristine bots will exist in the store
    }
  });
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
