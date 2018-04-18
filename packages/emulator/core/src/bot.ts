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
import * as Restify from 'restify';
import fetch from 'node-fetch';

import { speech as speechEndpoint, authentication as authenticationEndpoint } from './authEndpoints';
import { URL, URLSearchParams } from 'url';
import Attachments from './facility/attachments';
import BotOptions from './types/botOptions';
import BotState from './facility/botState';
import ConsoleLogService from './facility/consoleLogService';
import ConversationSet from './facility/conversationSet';
import ILogger from './types/logger';
import ILogService from './types/log/service';
import ISpeechTokenInfo from './types/speechToken';
import LoggerAdapter from './facility/loggerAdapter';
import LogLevel from './types/log/level';
import registerAttachmentRoutes from './attachments/registerRoutes';
import registerBotStateRoutes from './botState/registerRoutes';
import registerConversationRoutes from './conversations/registerRoutes';
import registerDirectLineRoutes from './directLine/registerRoutes';
import statusCodeFamily from './utils/statusCodeFamily';
import stripEmptyBearerToken from './utils/stripEmptyBearerToken';
import Users from './facility/users';

const DEFAULT_OPTIONS: BotOptions = {
  fetch,
  loggerOrLogService: new ConsoleLogService(),
  stateSizeLimitKB: 64,
  use10Tokens: false
};

// We will refresh if the token is going to expire within 5 minutes
const TIME_TO_REFRESH = 5 * 60 * 1000;

export default class Bot {
  constructor(
    public botId: string,
    public botUrl: string,
    public serviceUrl: string,
    public msaAppId?: string,
    public msaPassword?: string,
    options: BotOptions = DEFAULT_OPTIONS
  ) {
    this.options = { ...DEFAULT_OPTIONS, ...options };

    const logService = this.options.loggerOrLogService as ILogService;
    const logger: ILogger = (logService && logService.logToChat) ? new LoggerAdapter(logService as ILogService) : (this.options.loggerOrLogService as ILogger);

    this.facilities = {
      attachments: new Attachments(),
      botState: new BotState(this, this.options.stateSizeLimitKB),
      conversations: new ConversationSet(),
      logger,
      users: new Users()
    };
  }

  accessToken: string;
  accessTokenExpires: number;
  options: BotOptions;
  speechToken: string;

  facilities: {
    attachments: Attachments,
    botState: BotState,
    conversations: ConversationSet,
    logger: ILogger,
    users: Users
  }

  mount(router: Restify.Server): Bot {
    const uses = [
      Restify.plugins.acceptParser(router.acceptable),
      stripEmptyBearerToken(),
      Restify.plugins.dateParser(),
      Restify.plugins.queryParser()
    ];

    registerAttachmentRoutes(this, router, uses);
    registerBotStateRoutes(this, router, uses);
    registerConversationRoutes(this, router, uses);
    registerDirectLineRoutes(this, router, uses);

    return this;
  }

  async fetchWithAuth(url, options: any = {}, forceRefresh: boolean = false) {
    if (this.msaAppId) {
      options.headers = {
        Authorization: `Bearer ${await this.getAccessToken(forceRefresh)}`
      };
    }

    const response = await this.options.fetch(url, options);

    if (
      (response.status === HttpStatus.UNAUTHORIZED || response.status === HttpStatus.FORBIDDEN)
      && (!forceRefresh && this.msaAppId)
    ) {
      return await this.fetchWithAuth(url, options, true);
    }

    return response;
  }

  private async getAccessToken(forceRefresh: boolean = false): Promise<string> {
    if (!forceRefresh && this.accessToken && Date.now() < this.accessTokenExpires - TIME_TO_REFRESH) {
      return this.accessToken;
    }

    // Refresh access token
    const resp = await this.options.fetch(authenticationEndpoint.tokenEndpoint, {
      method: 'POST',
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: this.msaAppId,
        client_secret: this.msaPassword,
        scope: `${this.msaAppId}/.default`,
        // flag to request a version 1.0 token
        ...this.options.use10Tokens ? { atver: 1 } : {}
      } as { [key: string]: string }).toString(),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    if (statusCodeFamily(resp.status, 200)) {
      // Subtract 5 minutes from expires_in so they'll we'll get a
      // new token before it expires.
      const oauthResponse = await resp.json();

      this.accessToken = oauthResponse.access_token;
      this.accessTokenExpires = Date.now() + oauthResponse.expires_in * 1000;

      return this.accessToken;
    } else {
      // this.facilities.logger.logError(this.conversationId, 'Error: The bot\'s MSA appId or password is incorrect.');
      // this.facilities.logger.logError(this.conversationId, makeBotSettingsLink('Edit your bot\'s MSA info'));

      throw new Error('Refresh access token failed with status code: ' + resp.status);
    }
  }

  public async getSpeechToken(duration: number, refresh: boolean = false) {
    if (this.speechToken && !refresh) {
      return this.speechToken;
    }

    if (!this.msaAppId || !this.msaPassword) {
      throw new Error('bot must have Microsoft App ID and password');
    }

    const query = new URLSearchParams({ goodForInMinutes: duration } as any);
    const res = this.fetchWithAuth(new URL(`?${query.toString()}`, speechEndpoint.tokenEndpoint).toString());

    if (statusCodeFamily(res.status, 200)) {
      const body = res.json() as ISpeechTokenInfo;

      this.speechToken = body.access_Token;

      return this.speechToken;
    } else if (res.status === 401) {
      throw new Error('not authorized to use Cognitive Services Speech API');
    } else {
      throw new Error('cannot retrieve speech token');
    }
  }
}
