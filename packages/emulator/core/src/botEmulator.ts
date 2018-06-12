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

import * as Restify from 'restify';
import fetch from 'node-fetch';
import Attachments from './facility/attachments';
import BotState from './facility/botState';
import ConsoleLogService from './facility/consoleLogService';
import ConversationSet from './facility/conversationSet';
import EndpointSet from './facility/endpointSet';
import BotEmulatorOptions from './types/botEmulatorOptions';
import Logger from './types/logger';
import LogService from './types/log/service';
import LoggerAdapter from './facility/loggerAdapter';
import registerAttachmentRoutes from './attachments/registerRoutes';
import registerBotStateRoutes from './botState/registerRoutes';
import registerConversationRoutes from './conversations/registerRoutes';
import registerDirectLineRoutes from './directLine/registerRoutes';
import registerSessionRoutes from './session/registerRoutes';
import registerUserTokenRoutes from './userToken/registerRoutes';
import stripEmptyBearerToken from './utils/stripEmptyBearerToken';
import registerEmulatorRoutes from './emulator/registerRoutes';

import Users from './facility/users';

const DEFAULT_OPTIONS: BotEmulatorOptions = {
  fetch,
  loggerOrLogService: new ConsoleLogService(),
  stateSizeLimitKB: 64
};

export interface ServiceUrlProvider {
  (botUrl: string): string;
}

export default class BotEmulator {
  // TODO: Instead of providing a getter for serviceUrl, we should let the upstream to set the serviceUrl
  //       Currently, the upstreamer doesn't really know when the serviceUrl change (ngrok), they need to do their job
  public getServiceUrl: ServiceUrlProvider;
  public options: BotEmulatorOptions;

  public facilities: {
    attachments: Attachments,
    botState: BotState,
    conversations: ConversationSet,
    endpoints: EndpointSet,
    logger: Logger,
    users: Users
  };

  constructor(
    public serviceUrlOrProvider: string | ServiceUrlProvider,
    options: BotEmulatorOptions = DEFAULT_OPTIONS
  ) {
    if (typeof serviceUrlOrProvider === 'string') {
      this.getServiceUrl = () => serviceUrlOrProvider;
    } else {
      this.getServiceUrl = serviceUrlOrProvider;
    }

    this.options = { ...DEFAULT_OPTIONS, ...options };

    const logService = this.options.loggerOrLogService as LogService;
    const logger: Logger = (logService && logService.logToChat) ? new LoggerAdapter(logService as LogService)
      : (this.options.loggerOrLogService as Logger);

    this.facilities = {
      attachments: new Attachments(),
      botState: new BotState(this, this.options.stateSizeLimitKB),
      conversations: new ConversationSet(),
      endpoints: new EndpointSet(this.options),
      logger,
      users: new Users()
    };
  }

  mount(router: Restify.Server): BotEmulator {
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
    registerSessionRoutes(this, router, uses);
    registerUserTokenRoutes(this, router, uses);
    registerEmulatorRoutes(this, router, uses);

    return this;
  }
}
