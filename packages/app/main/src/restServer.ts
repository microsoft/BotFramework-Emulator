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

import { Bot as BotEmulator } from '@bfemulator/emulator-core';
import { getFirstBotEndpoint } from '@BFEmulator/app-shared';
import { IBotConfig, IEndpointService } from '@bfemulator/sdk-shared';
import * as CORS from 'restify-cors-middleware';
import * as Restify from 'restify';

import { createBotEmulatorFromBotConfig } from './utils';
import { mainWindow } from './main';
import * as log from './log';

export class RestServer {
  public botEmulator: BotEmulator;

  endpoint: IEndpointService;
  router: Restify.Server;

  constructor(public botConfig: IBotConfig, public serviceUrl: string) {
    this.endpoint = getFirstBotEndpoint(botConfig);

    const cors = CORS({
      origins: ['*'],
      allowHeaders: ['authorization', 'x-requested-with'],
      exposeHeaders: []
    });

    this.router = Restify.createServer({
      name: this.botConfig.name || 'Emulator'
    });

    this.router.pre(cors.preflight);
    this.router.use(cors.actual);
  }

  public listen(port?: number): Promise<{ url: string }> {
    return new Promise((resolve, reject) => {
      this.router.once('error', err => reject(err));

      this.router.listen(port, () => {
        log.debug(`${ this.router.name } listening on ${ this.router.url }`);

        const { port } = this.router.address();

        // Because serviceUrl depends on the host:port, we cannot mount the routes when we create the router, but only here
        this.botEmulator = createBotEmulatorFromBotConfig(this.botConfig, this.serviceUrl);

        // TODO: Fix "inflightRequests" type not found
        this.botEmulator.mount(this.router as any);

        resolve({ url: this.router.url });
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
}
