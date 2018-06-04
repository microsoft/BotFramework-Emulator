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

import { BotInfo, getBotDisplayName } from '@bfemulator/app-shared';
import { BotConfigWithPath } from '@bfemulator/sdk-shared';
import { BotAction, BotActions } from '../action/botActions';
import { getBotInfoByPath } from '../botHelpers';

export interface BotState {
  activeBot: BotConfigWithPath;
  botFiles: BotInfo[];
}

const DEFAULT_STATE: BotState = {
  activeBot: null,
  botFiles: []
};

export default function bot(state: BotState = DEFAULT_STATE, action: BotAction) {
  switch (action.type) {
    case BotActions.create: {
      const newBot: BotInfo = {
        path: action.payload.botFilePath,
        displayName: getBotDisplayName(action.payload.bot),
        secret: action.payload.secret
      };
      const bots = [...state.botFiles].filter(botArg => botArg.path !== action.payload.botFilePath);
      bots.unshift(newBot);
      state = setBotFilesState(bots, state);
      break;
    }

    case BotActions.load: {
      state = setBotFilesState(action.payload.bots, state);
      break;
    }

    case BotActions.patch: {
      const patchedBot = {
        ...state.activeBot,
        ...action.payload.bot
      };
      // update the bot display name in the list if it was changed
      const botInfo = getBotInfoByPath(action.payload.bot.path);
      if (botInfo) {
        botInfo.displayName = getBotDisplayName(action.payload.bot);
        if (action.payload.secret) {
          botInfo.secret = action.payload.secret;
        }
        const botInfoIndex = state.botFiles.findIndex(bf => bf.path === action.payload.bot.path);
        let patchedBots = [...state.botFiles];
        patchedBots.splice(botInfoIndex, 1, botInfo);
        state = setBotFilesState(patchedBots, state);
      }
      state = setActiveBot(patchedBot, state);
      break;
    }

    case BotActions.setActive: {
      // move active bot up to the top of the recent bots list
      const mostRecentBot = state.botFiles.find(botArg => botArg && botArg.path === action.payload.bot.path);
      let recentBots = state.botFiles.filter(botArg => botArg && botArg.path !== action.payload.bot.path);
      if (mostRecentBot) {
        recentBots.unshift(mostRecentBot);
      }
      state = setBotFilesState(recentBots, state);
      state = setActiveBot(action.payload.bot, state);
      break;
    }

    case BotActions.close: {
      // close the ative bot
      state = setActiveBot(null, state);
      break;
    }

    default:
      break;
  }
  return state;
}

function setActiveBot(botConfig: BotConfigWithPath, state: BotState): BotState {
  let newState = Object.assign({}, state);

  newState.activeBot = botConfig;
  return newState;
}

function setBotFilesState(botFilesState: BotInfo[], state: BotState): BotState {
  let newState = Object.assign({}, state);

  newState.botFiles = botFilesState;
  return newState;
}
