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

import { BotEmulator, Conversation } from '@bfemulator/emulator-core';
import * as CORS from 'restify-cors-middleware';
import * as Restify from 'restify';
import * as fetch from 'electron-fetch';

import { mainWindow } from './main';
import { emulator } from './emulator';
import { networkRequestItem, networkResponseItem, textItem } from '@bfemulator/emulator-core/lib/types/log/util';
import LogLevel from '@bfemulator/emulator-core/lib/types/log/level';

export class RestServer {
  private readonly _botEmulator: BotEmulator;
  private readonly _router: Restify.Server;

  public get botEmulator() {
    return this._botEmulator;
  }

  constructor() {
    const cors = CORS({
      origins: ['*'],
      allowHeaders: ['authorization', 'x-requested-with'],
      exposeHeaders: []
    });

    this._router = Restify.createServer({
      name: 'Emulator'
    });

    this._router.on('after', async (req: Restify.Request, res: Restify.Response,
                                    route: Restify.Route, error: Error) => {
      if (req.method === 'GET' && route.spec.path === '/v3/directline/conversations/:conversationId/activities') {
        // Don't log WebChat's polling GET operations
        return;
      }

      let conversationId;
      if ((req as any).conversation) {
        conversationId = (req as any).conversation.conversationId;
      } else if (req.params.conversationId) {
        conversationId = req.params.conversationId;
      }

      if (!conversationId || !conversationId.length || conversationId.includes('transcript')) {
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
        networkRequestItem(
          facility,
          (req as any)._body,
          req.headers,
          req.method,
          req.url
        ),
        networkResponseItem(
          (res as any)._data,
          res.headers,
          res.statusCode,
          res.statusMessage,
          req.url
        ),
        textItem(
          level,
          `${facility}.${routeName}`
        ),
      );
    });

    this._router.pre(cors.preflight);
    this._router.use(cors.actual);

    this._botEmulator = new BotEmulator(
      botUrl => emulator.ngrok.getServiceUrl(botUrl),
      {
        fetch: (fetch as any).default,
        loggerOrLogService: mainWindow.logService,
        tunnelingServiceUrl: () => emulator.ngrok.getNgrokServiceUrl()
      }
    );

    this._botEmulator.facilities.conversations.on('new', (conversation: Conversation) => {
      if (!conversation ||
        !conversation.conversationId ||
        !conversation.conversationId.length ||
        conversation.conversationId.includes('transcript')) {
        return;
      }
      emulator.report(conversation.conversationId);
    });
  }

  public listen(port?: number): Promise<{ url: string, port: number }> {
    return new Promise((resolve, reject) => {
      this._router.once('error', err => reject(err));

      this._router.listen(port, () => {
        this.botEmulator.mount(this._router as any);
        resolve({ url: this._router.url, port: this._router.address().port });
      });
    });
  }

  public close() {
    return new Promise(resolve => {
      if (this._router) {
        this._router.close(() => resolve());
      } else {
        resolve();
      }
    });
  }
}
