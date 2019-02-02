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

import { IEndpointService } from 'botframework-config/lib/schema';

import { BotConfigOverrides, BotConfigWithPath, BotConfigWithPathImpl } from '../types';

/**
 * Takes bot config overrides and applies them to the target bot
 * @param targetBot The bot that the overrides will be applied to
 * @param overrides The overrides to apply to the target bot
 */
export function applyBotConfigOverrides(
  targetBot: BotConfigWithPath,
  overrides: BotConfigOverrides
): BotConfigWithPath {
  const botConfig: BotConfigWithPath = BotConfigWithPathImpl.fromJSON({
    ...targetBot,
    ...{ overrides },
  });
  return botConfig;
}

/**
 * Returns true if the two bots have the same path, otherwise false
 * @param bot1 First bot to be compared
 * @param bot2 Second bot to be compared
 */
export function botsAreTheSame(bot1: BotConfigWithPath, bot2: BotConfigWithPath): boolean {
  if (bot1 && bot2) {
    return bot1.path === bot2.path;
  }
  return false;
}

/**
 * Takes two endpoints, merges them together, and returns the result. Any shared properties
 * between the endpoints will be taken from the second endpoint.
 * @param endpoint1 First endpoint
 * @param endpoint2 Second endpoint (will overwrite properties from first endpoint)
 * @returns The result of the merge
 */
export function mergeEndpoints(endpoint1: IEndpointService, endpoint2: Partial<IEndpointService>): IEndpointService {
  return { ...endpoint1, ...endpoint2 };
}
