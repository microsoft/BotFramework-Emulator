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

import { IBotInfo, IBotConfig } from '@bfemulator/app-shared';
import { BotAction } from '../reducer/bot';

export const CREATE ='BOT/CREATE';
export const LOAD = 'BOT/LOAD';
export const PATCH = 'BOT/PATCH';
export const SET_ACTIVE = 'BOT/SET_ACTIVE';

export function create(bot: IBotConfig, botFilePath: string, secret: string): BotAction {
  return {
    type: CREATE,
    payload: {
      bot,
      botFilePath,
      secret
    }
  };
}

export function load(bots: IBotInfo[]): BotAction {
  // prune bad bots
  bots = bots.filter(bot => !!bot);

  return {
    type: LOAD,
    payload: {
      bots
    }
  };
}

export function patch(bot: IBotConfig, secret?: string): BotAction {
  return {
    type: PATCH,
    payload: {
      bot,
      secret
    }
  };
}
export function setActive(bot: IBotConfig, botDirectory: string): BotAction {
  return {
    type: SET_ACTIVE,
    payload: {
      bot,
      botDirectory
    }
  };
}
