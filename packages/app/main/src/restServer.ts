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

import { SharedConstants } from '@bfemulator/app-shared';
import { BotEmulator, Conversation, ConversationSet } from '@bfemulator/emulator-core';
import { LogLevel, networkRequestItem, networkResponseItem, textItem } from '@bfemulator/sdk-shared';
import { IEndpointService } from 'botframework-config';
import { createServer, Request, Response, Route, Server } from 'restify';
import CORS from 'restify-cors-middleware';

import { emulator } from './emulator';
import { mainWindow } from './main';

interface ConversationAwareRequest extends Request {
  conversation?: { conversationId?: string };
  params?: { conversationId?: string };
}

export class RestServer {
  private readonly router: Server;

  // Late binding
  private _botEmulator: BotEmulator;
  public get botEmulator(): BotEmulator {
    if (!this._botEmulator) {
      this._botEmulator = new BotEmulator(botUrl => emulator.ngrok.getServiceUrl(botUrl), {
        fetch,
        loggerOrLogService: mainWindow.logService,
      });
      this._botEmulator.facilities.conversations.on('new', this.onNewConversation);
    }
    return this._botEmulator;
  }

  constructor() {
    const cors = CORS({
      origins: ['*'],
      allowHeaders: [
        'authorization',
        'x-requested-with',
        'x-ms-bot-agent',
        'x-emulator-botendpoint',
        'x-emulator-appid',
        'x-emulator-apppassword',
      ],
      exposeHeaders: [],
    });

    const router = createServer({
      name: 'Emulator',
    });

    router.on('after', this.onRouterAfter);
    router.pre(cors.preflight);
    router.use(cors.actual);

    this.router = router;
  }

  public listen(port?: number): Promise<{ url: string; port: number }> {
    return new Promise((resolve, reject) => {
      this.router.once('error', err => reject(err));
      this.router.listen(port, () => {
        this.botEmulator.mount(this.router as any);
        resolve({ url: this.router.url, port: this.router.address().port });
      });
    });
  }

  public close() {
    return new Promise(resolve => {
      if (this.router) {
        this.router.close(() => resolve());
      } else {
        resolve();
      }
    });
  }

  private onRouterAfter = async (req: Request, res: Response, route: Route) => {
    const conversationId = getConversationId(req as ConversationAwareRequest);
    if (!shouldPostToChat(conversationId, req.method, route)) {
      return;
    }

    const facility = (req as any).facility || 'network';
    const routeName = (req as any).routeName || '';

    let level = LogLevel.Debug;
    if (!/2\d\d/.test(res.statusCode.toString())) {
      level = LogLevel.Error;
    }

    mainWindow.logService.logToChat(
      conversationId,
      networkRequestItem(facility, (req as any)._body, req.headers, req.method, req.url),
      networkResponseItem((res as any)._data, res.headers, res.statusCode, res.statusMessage, req.url),
      textItem(level, `${facility}.${routeName}`)
    );
  };

  private onNewConversation = async (conversation: Conversation = {} as Conversation) => {
    const { conversationId = '' } = conversation;
    if (!conversationId || conversationId.includes('transcript')) {
      return;
    }
    // Check for an existing livechat window
    // before creating a new one since "new"
    // can also mean "restart".
    const {
      botEndpoint: { id, botUrl },
    } = conversation;

    await mainWindow.commandService.remoteCall(
      SharedConstants.Commands.Emulator.NewLiveChat,
      {
        id,
        endpoint: botUrl,
      } as IEndpointService,
      hasLiveChat(conversationId, this.botEmulator.facilities.conversations),
      conversationId
    );
    await emulator.report(conversationId, botUrl);
  };
}

function shouldPostToChat(conversationId: string, method: string, route: Route): boolean {
  const isDLine = method === 'GET' && route.spec.path === '/v3/directline/conversations/:conversationId/activities';
  return !isDLine && !!conversationId && !conversationId.includes('transcript');
}

function getConversationId(req: ConversationAwareRequest): string {
  return req.conversation ? req.conversation.conversationId : req.params.conversationId;
}

function hasLiveChat(conversationId: string, conversationSet: ConversationSet): boolean {
  if (conversationId.endsWith('|livechat')) {
    return !!conversationSet.conversationById(conversationId);
  }
  return !!conversationSet.conversationById(conversationId + '|livechat');
}
