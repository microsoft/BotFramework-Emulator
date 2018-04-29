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

import { BotEmulator } from '@bfemulator/emulator-core';
import { IBotConfig, IEndpointService } from '@bfemulator/sdk-shared';
import * as CORS from 'restify-cors-middleware';
import * as Restify from 'restify';
import * as fetch from 'electron-fetch';

import { mainWindow } from './main';
import * as log from './log';
import { getActiveBot } from './botHelpers';
import { emulator } from './emulator';

export class RestServer {
  private _botEmulator: BotEmulator;
  private _router: Restify.Server;

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

    this._router.pre(cors.preflight);
    this._router.use(cors.actual);

    this._botEmulator = new BotEmulator(
      botUrl => emulator.ngrok.getServiceUrl(botUrl),
      {
        fetch,
        loggerOrLogService: mainWindow.logService
      }
    );
  }

  public listen(port?: number): Promise<{ url: string, port: number }> {
    return new Promise((resolve, reject) => {
      this._router.once('error', err => reject(err));

      this._router.listen(port, () => {
        log.debug(`${this._router.name} listening on ${this._router.url}`);

        // TODO: Fix "inflightRequests" type not found
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
