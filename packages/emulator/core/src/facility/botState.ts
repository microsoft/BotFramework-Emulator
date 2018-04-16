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

import * as HttpStatus from 'http-status-codes';

import approximateObjectSize from '../utils/approximateObjectSize';
import Bot from '../bot';
import botDataKey from './botDataKey';
import Conversation from './conversation';
import createAPIException from '../utils/createResponse/apiException';
import ErrorCodes from '../types/errorCodes';
import IBotData from '../types/botData';
import { makeExternalLink } from '../utils/linkHelpers';

export default class BotState {
  constructor(
    public bot: Bot,
    public stateSizeLimitKB: number
  ) {}

  private botDataStore: { [key: string]: IBotData } = {};

  private logBotStateApiDeprecationWarning(conversationId: string) {
    const conversation: Conversation = this.bot.facilities.conversations.conversationById(conversationId);

    if (conversation && !conversation.stateApiDeprecationWarningShown) {
      conversation.stateApiDeprecationWarningShown = true;

      this.bot.facilities.logger.logWarning(
        'Warning: The Bot Framework State API is not recommended for production environments, and may be deprecated in a future release.',
        makeExternalLink('Learn how to implement your own storage adapter.', 'https://aka.ms/botframework-state-service')
      );
    }
  }

  public getBotData(channelId: string, conversationId: string, userId: string): IBotData {
    this.logBotStateApiDeprecationWarning(conversationId);

    const key = botDataKey(channelId, conversationId, userId);

    return this.botDataStore[key] || {
      data: null,
      eTag: '*'
    };
  }

  public setBotData(channelId: string, conversationId: string, userId: string, incomingData: IBotData): IBotData {
    this.logBotStateApiDeprecationWarning(conversationId);

    const key = botDataKey(channelId, conversationId, userId);
    const oldData = this.botDataStore[key];

    if (oldData && oldData.eTag && (oldData.eTag.length > 0) && (incomingData.eTag != '*') && (oldData.eTag != incomingData.eTag)) {
      throw createAPIException(HttpStatus.PRECONDITION_FAILED, ErrorCodes.BadArgument, 'The data is changed');
    }

    if ((this.stateSizeLimitKB > 0) && (approximateObjectSize(incomingData) > this.stateSizeLimitKB * 1024)) {
      throw createAPIException(HttpStatus.BAD_REQUEST, ErrorCodes.MessageSizeTooBig, 'State size exceeded configured limit.');
    }

    const newData: IBotData = {
      eTag: new Date().getTime().toString(),
      data: incomingData.data
    };

    if (!incomingData.data) {
      delete this.botDataStore[key];
      newData.eTag = '*';
    } else {
      this.botDataStore[key] = newData;
    }

    return newData;
  }

  public deleteBotData(userId: string) {
    const keys = Object.keys(this.botDataStore);

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];

      if (key.endsWith(`!${ userId }`)) {
        delete this.botDataStore[key];
      }
    }
  }
}
