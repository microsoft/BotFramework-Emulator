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

import { BotInfo } from '@bfemulator/app-shared';
import {
  applyBotConfigOverrides,
  BotConfigWithPath,
  botsAreTheSame,
} from '@bfemulator/sdk-shared';

import { BotAction, BotActions } from '../action/botActions';

export interface BotState {
  activeBot: BotConfigWithPath;
  activeBotDigest: string;
  botFiles: BotInfo[];
}

const DEFAULT_STATE: BotState = {
  activeBot: null,
  activeBotDigest: null,
  botFiles: [],
};

export function bot(state: BotState = DEFAULT_STATE, action: BotAction) {
  switch (action.type) {
    case BotActions.load: {
      state = setBotFilesState(action.payload.bots, state);
      break;
    }

    case BotActions.setActive: {
      // move active bot up to the top of the recent bots list
      const mostRecentBot = state.botFiles.find(
        botArg => botArg && botArg.path === action.payload.bot.path
      );
      const recentBots = state.botFiles.filter(
        botArg => botArg && botArg.path !== action.payload.bot.path
      );
      if (mostRecentBot) {
        recentBots.unshift(mostRecentBot);
      }
      let newActiveBot = action.payload.bot;
      if (botsAreTheSame(state.activeBot, newActiveBot)) {
        newActiveBot = applyBotConfigOverrides(
          newActiveBot,
          state.activeBot.overrides
        );
      }
      state = setBotFilesState(recentBots, state);
      state = setActiveBot(newActiveBot, state);
      break;
    }

    case BotActions.close: {
      // close the active bot
      state = setActiveBot(null, state);
      break;
    }

    case BotActions.hashGenerated:
      return { ...state, activeBotDigest: action.payload.hash };

    default:
      break;
  }
  return state;
}

function setActiveBot(botConfig: BotConfigWithPath, state: BotState): BotState {
  return {
    ...state,
    get activeBot() {
      // Clones only - this guarantees only pristine bots will exist in the store
      return JSON.parse(JSON.stringify(botConfig));
    },
  };
}

function setBotFilesState(botFilesState: BotInfo[], state: BotState): BotState {
  const newState = { ...state };

  newState.botFiles = botFilesState;
  return newState;
}
