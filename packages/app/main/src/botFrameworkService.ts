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

import { promisify } from 'util';
import { Settings, getFirstBotEndpoint } from '@bfemulator/app-shared';
import { IBotConfig } from '@bfemulator/sdk-shared';
import * as CORS from 'restify-cors-middleware';
import * as Restify from 'restify';
import * as getPort from 'get-port';

import { getActiveBot } from './botHelpers';
import { getStore, addSettingsListener, getSettings } from './settings';
import { isLocalhostUrl } from './utils';
import { RestServer } from './restServer';
import * as log from './log';
import * as ngrok from './ngrok';

function ngrokConnect({ path, port }: { path: string, port: number }): Promise<{ inspectUrl: string, url: string }> {
  return new Promise((resolve, reject) => {
    ngrok.connect({ path, port }, (err, url, inspectUrl) => {
      err ? reject(err) : resolve({ inspectUrl, url });
    });
  });
}

/**
 * Communicates with the bot.
 */
export class BotFrameworkService {
  bot: IBotConfig;
  bypassNgrokLocalhost: boolean;
  ngrokPath: string;
  server: RestServer;
  serverUrl: string;

  startup() {
    addSettingsListener(({ framework: { bypassNgrokLocalhost, ngrokPath } }) => {
      const bot = getActiveBot();

      if (
        this.bot !== bot
        || this.ngrokPath !== ngrokPath
        || this.bypassNgrokLocalhost !== bypassNgrokLocalhost
      ) {
        this.recycle();
      }
    });
  }

  async restartNgrokIfNeeded(ngrokPath: string, bypassNgrokLocalhost: boolean, port: number): Promise<{ ngrokServiceUrl: string }> {
    // TODO: Currently, it will always resolve, we should revisit and reject if needed
    let ngrokServiceUrl;

    // if we have an ngrok path
    if (!ngrokPath) {
      log.debug('ngrok not configured (only needed when connecting to remotely hosted bots)');
      log.error(log.makeLinkMessage('Connecting to bots hosted remotely', 'https://aka.ms/cnjvpo'));
      log.error(log.ngrokConfigurationLink('Edit ngrok settings'));
    } else {
      // then make it so

      try {
        const { inspectUrl, url } = await ngrokConnect({ port, path: ngrokPath });

        ngrokServiceUrl = url;

        log.debug(`ngrok listening on ${url}`);
        log.debug('ngrok traffic inspector:', log.makeLinkMessage(inspectUrl, inspectUrl));
      } catch (err) {
        log.error(`Failed to start ngrok: ${ err.message || err.msg }`);

        if (err.code && err.code === 'ENOENT') {
          log.debug('The path to ngrok may be incorrect.');
          log.error(log.ngrokConfigurationLink('Edit ngrok settings'));
        } else {
          log.debug('ngrok may already be running in a different process. ngrok\'s free tier allows only one instance at a time per host.');
        }
      }

      // TODO: Before refactoring, this code will always run even Ngrok is failed to start
      // Sync settings to client
      getStore().dispatch({
        type: 'Framework_Set',
        state: {
          bypassNgrokLocalhost: this.bypassNgrokLocalhost,
          ngrokPath: this.ngrokPath
        }
      });
    }

    if (
      // If (ngrok is running) and (bypass or path changed)
      ngrokServiceUrl
      && (this.bypassNgrokLocalhost !== bypassNgrokLocalhost || this.ngrokPath !== ngrokPath)
    ) {
      if (this.bypassNgrokLocalhost) {
        log.debug(`Will bypass ngrok for local addresses`);
      } else {
        log.debug(`Will use ngrok for local addresses`);
      }
    }

    return { ngrokServiceUrl };
  }

  /**
   * Applies configuration changes.
   */
  public async recycle() {
    const { framework: { bypassNgrokLocalhost, ngrokPath } } = getSettings();
    const bot = getActiveBot();

    this.bot = bot;
    this.bypassNgrokLocalhost = bypassNgrokLocalhost;
    this.ngrokPath = ngrokPath;

    await killNgrok();

    const endpoint = bot && getFirstBotEndpoint(bot);

    if (endpoint) {
      const port = await getPort();
      const { ngrokServiceUrl } = await this.restartNgrokIfNeeded(ngrokPath, bypassNgrokLocalhost, port);
      let serviceUrl = getLocalhostServiceUrl(port);

      if (
        (!this.bypassNgrokLocalhost || !isLocalhostUrl(endpoint.endpoint))
        && ngrokServiceUrl
      ) {
        serviceUrl = ngrokServiceUrl;
      }

      this.server && this.server.close();
      this.server = new RestServer(bot, serviceUrl);

      const { url } = await this.server.listen(port);

      this.serverUrl = url;
    }
  }
}

function getLocalhostServiceUrl(port: number): string {
  let hostname = getStore().getState().framework.localhost || 'localhost';
  const parts = hostname.split(':');

  if (parts.length === 2) {
    hostname = parts[0];
  }

  // Ignore user-specified port, for now.
  return `http://${ hostname }:${ port }`;
}

async function killNgrok() {
    const killNgrok = (cb) => {
    ngrok.kill(wasRunning => {
      cb(null, wasRunning);
    });
  }
  const wasRunning = await promisify(killNgrok)();

  if (wasRunning) {
    log.debug('ngrok stopped');
  }
}
