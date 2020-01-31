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

import { BotConfigWithPath, StartConversationParams } from '@bfemulator/sdk-shared';
import { Action } from 'redux';

import { BotInfo } from '../../types';
import { newBot } from '../../utils';

export enum BotActionType {
  close = 'BOT/CLOSE',
  browse = 'BOT/BROWSE',
  hashGenerated = 'BOT/HASH_GENERATED',
  load = 'BOT/LOAD',
  open = 'BOT/OPEN',
  openViaUrl = 'BOT/OPEN_VIA_URL',
  openViaFilePath = 'BOT/OPEN_VIA_FILE_PATH',
  setActive = 'BOT/SET_ACTIVE',
  setDirectory = 'BOT/SET_DIRECTORY',
}

export interface BotAction<T = any> extends Action {
  type: BotActionType;
  payload: T;
}

export interface LoadBotPayload {
  bots: BotInfo[];
}

export interface SetActivePayload {
  bot: BotConfigWithPath;
}

export interface SetDirectoryPayload {
  directory: string;
}

export interface BotConfigWithPathPayload {
  bot: BotConfigWithPath;
}

export interface BotInfosPayload {
  bots: BotInfo[];
}

export interface HashPayload {
  hash: string;
}

export function load(bots: BotInfo[]): BotAction<LoadBotPayload> {
  // prune bad bots
  bots = bots.filter(bot => !!bot);

  return {
    type: BotActionType.load,
    payload: {
      bots,
    },
  };
}

export function setActive(bot: BotConfigWithPath): BotAction<SetActivePayload> {
  return {
    type: BotActionType.setActive,
    payload: {
      bot,
    },
  };
}

export function setDirectory(directory: string): BotAction<SetDirectoryPayload> {
  return {
    type: BotActionType.setDirectory,
    payload: {
      directory,
    },
  };
}

export function mockAndSetActive(mock?: BotConfigWithPath): BotAction {
  const bot = newBot(
    {
      version: '',
      name: 'Random Bot',
      description: '',
      services: [],
      padlock: '',
    },
    mock
  );
  return setActive(bot);
}

export function botHashGenerated(hash: string): BotAction<HashPayload> {
  return {
    type: BotActionType.hashGenerated,
    payload: { hash },
  };
}

export function browse(): BotAction<{}> {
  return {
    type: BotActionType.browse,
    payload: {},
  };
}

export function closeBot(): BotAction<{}> {
  return {
    type: BotActionType.close,
    payload: {},
  };
}

export function openBotViaFilePathAction(path: string): BotAction<string> {
  return {
    type: BotActionType.openViaFilePath,
    payload: path,
  };
}

interface BotSource {
  isFromBotFile?: boolean;
}

export function openBotViaUrlAction(
  startConversationParams: Partial<StartConversationParams> & BotSource
): BotAction<Partial<StartConversationParams> & BotSource> {
  return {
    type: BotActionType.openViaUrl,
    payload: startConversationParams,
  };
}
