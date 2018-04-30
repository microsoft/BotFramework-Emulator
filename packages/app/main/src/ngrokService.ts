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

import { emulator } from './emulator';
import { getStore, addSettingsListener, getSettings } from './settings';
import { isLocalhostUrl } from './utils';
import * as ngrok from './ngrok';

export class NgrokService {
  private _ngrokPath: string;
  private _serviceUrl: string;
  private _inspectUrl: string;
  private _spawnErr: any;
  private _localhost: string;
  private _bypass: boolean;

  getServiceUrl(botUrl: string): string {
    if (botUrl && isLocalhostUrl(botUrl) && this._bypass) {
      // Do not use ngrok
      const port = emulator.framework.serverPort;

      return `http://${ this._localhost }:${ port }`;
    } else {
      // Use ngrok if ngrok is up
      return this._serviceUrl;
    }
  }

  public getNgrokServiceUrl() : string {
    return this._serviceUrl;
  }

  public async startup() {
    this.cacheHostAndPortSettings();

    await this.recycle();

    addSettingsListener(async ({ framework: { bypassNgrokLocalhost, ngrokPath, localhost } }) => {
      this.cacheHostAndPortSettings();
      this._bypass = bypassNgrokLocalhost;

      if (this._ngrokPath !== ngrokPath) {
        await this.recycle();
      }
    });
  }

  public async recycle() {
    try {
      await killNgrok();
    } catch (err) {
      console.error('Failed to kill ngrok', err);
    }

    const port = emulator.framework.serverPort;

    this._ngrokPath = getStore().getState().framework.ngrokPath;
    this._serviceUrl = `http://${ this._localhost }:${ port }`;
    this._inspectUrl = null;
    this._spawnErr = null;

    if (this._ngrokPath && this._ngrokPath.length) {
      try {
        const { inspectUrl, url } = await ngrokConnect({ port, path: this._ngrokPath });

        this._serviceUrl = url;
        this._inspectUrl = inspectUrl;
      } catch (err) {
        this._spawnErr = err;
        console.error('Failed to spawn ngrok', err);
      }
    }
  }

  report(conversationId: string): void {
    // TODO: Report ngrok status to the conversation log when one is created (and when recycled?)
    /*
    if (this._spawnErr) {
    } else if (!this._ngrokPath || !this._ngrokPath.length) {
      log.debug('ngrok not configured (only needed when connecting to remotely hosted bots)');
      log.error(log.makeLinkMessage('Connecting to bots hosted remotely', 'https://aka.ms/cnjvpo'));
      log.error(log.ngrokConfigurationLink('Edit ngrok settings'));
    } else if (ngrok.running()) {
      const bypassNgrokLocalhost = getStore().getState().framework.bypassNgrokLocalhost;
      log.debug(`ngrok listening on ${this._serviceUrl}`);
      log.debug('ngrok traffic inspector:', log.makeLinkMessage(inspectUrl, this._inspectUrl));
      if (bypassNgrokLocalhost) {
        log.debug(`Will bypass ngrok for local addresses`);
      } else {
        log.debug(`Will use ngrok for local addresses`);
      }
    } else {
      // Ngrok configured but not runnin
    }
    */
  }

  private cacheHostAndPortSettings() {
    const localhost = getStore().getState().framework.localhost || 'localhost';
    const parts = localhost.split(':');
    let hostname = localhost;
    if (parts.length > 0) {
      hostname = parts[0].trim();
    }
    if (parts.length > 1) {
      // Ignore port, for now
      //port = +parts[1].trim();
    }
    this._localhost = hostname;
  }
}


function ngrokConnect({ path, port }: { path: string, port: number }): Promise<{ inspectUrl: string, url: string }> {
  return new Promise((resolve, reject) => {
    ngrok.connect({ path, port }, (err, url, inspectUrl) => {
      err ? reject(err) : resolve({ inspectUrl, url });
    });
  });
}

async function killNgrok() {
  const killNgrokInternal = (cb) => {
    ngrok.kill(wasRunning => {
      cb(null, wasRunning);
    });
  }

  const wasRunning = await promisify(killNgrokInternal)();

  if (wasRunning) {
    //log.debug('ngrok stopped');
  }
}
