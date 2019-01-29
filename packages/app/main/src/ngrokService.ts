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

import { FrameworkSettings } from '@bfemulator/app-shared';
import { ILogItem } from '@bfemulator/sdk-shared';
import { LogLevel } from '@bfemulator/sdk-shared';
import { isLocalHostUrl } from '@bfemulator/sdk-shared';
import {
  appSettingsItem,
  exceptionItem,
  externalLinkItem,
  ngrokExpirationItem,
  textItem,
} from '@bfemulator/sdk-shared';

import { emulator } from './emulator';
import { mainWindow } from './main';
import * as ngrok from './ngrok';
import { getStore } from './settingsData/store';

let ngrokInstance: NgrokService;

export class NgrokService {
  private _ngrokPath: string;
  private _serviceUrl: string;
  private _inspectUrl: string;
  private _spawnErr: any;
  private _localhost = 'localhost';
  private _triedToSpawn: boolean;
  private _recycle: Promise<void>;

  constructor() {
    return ngrokInstance || (ngrokInstance = this); // Singleton
  }

  public async getServiceUrl(botUrl: string): Promise<string> {
    if (ngrok.running()) {
      return this._serviceUrl;
    }
    const { bypassNgrokLocalhost, runNgrokAtStartup } = getStore().getState().framework;
    // Use ngrok
    if ((!isLocalHostUrl(botUrl || '') && !bypassNgrokLocalhost) || runNgrokAtStartup) {
      if (!ngrok.running()) {
        await this.startup();
      }

      return this._serviceUrl;
    }
    // Do not use ngrok
    return `http://${this._localhost}:${emulator.framework.serverPort}`;
  }

  public getSpawnStatus = (): { triedToSpawn: boolean; err: any } => ({
    triedToSpawn: this._triedToSpawn,
    err: this._spawnErr,
  });

  public async updateNgrokFromSettings(framework: FrameworkSettings) {
    this.cacheSettings();
    if (this._ngrokPath !== framework.ngrokPath && ngrok.running()) {
      return this.recycle();
    }
  }

  public recycle(): Promise<void> {
    if (this._recycle) {
      return this._recycle;
    }
    this._recycle = new Promise(async resolve => {
      try {
        await killNgrok();
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to kill ngrok', err);
      }

      const port = emulator.framework.serverPort;

      this._ngrokPath = getStore().getState().framework.ngrokPath;
      this._serviceUrl = `http://${this._localhost}:${port}`;
      this._inspectUrl = null;
      this._spawnErr = null;
      this._triedToSpawn = false;

      if (this._ngrokPath && this._ngrokPath.length) {
        try {
          this._triedToSpawn = true;
          const { inspectUrl, url } = await ngrokConnect({
            port,
            path: this._ngrokPath,
          });

          this._serviceUrl = url;
          this._inspectUrl = inspectUrl;
        } catch (err) {
          this._spawnErr = err;
          // eslint-disable-next-line no-console
          console.error('Failed to spawn ngrok', err);
        }
      }
      this._recycle = null;
      resolve();
    });
    return this._recycle;
  }

  /** Logs a message in all active conversations that ngrok has expired */
  public broadcastNgrokExpired(): void {
    this.broadcast(ngrokExpirationItem('ngrok tunnel has expired.'));
  }

  /** Logs messages signifying that ngrok has reconnected in all active conversations */
  public broadcastNgrokReconnected(): void {
    const bypassNgrokLocalhost = getStore().getState().framework.bypassNgrokLocalhost;
    const { broadcast } = this;
    broadcast(textItem(LogLevel.Debug, 'ngrok reconnected.'));
    broadcast(textItem(LogLevel.Debug, `ngrok listening on ${this._serviceUrl}`));
    broadcast(
      textItem(LogLevel.Debug, 'ngrok traffic inspector:'),
      externalLinkItem(this._inspectUrl, this._inspectUrl)
    );
    if (bypassNgrokLocalhost) {
      broadcast(textItem(LogLevel.Debug, 'Will bypass ngrok for local addresses'));
    } else {
      broadcast(textItem(LogLevel.Debug, 'Will use ngrok for local addresses'));
    }
  }

  /** Logs an item to all open conversations */
  public broadcast(...logItems: ILogItem[]): void {
    const { conversations } = emulator.framework.server.botEmulator.facilities;
    const conversationIds: string[] = conversations.getConversationIds();
    conversationIds.forEach(id => {
      mainWindow.logService.logToChat(id, ...logItems);
    });
  }

  /** Logs items to a single conversation based on current ngrok status */
  public report(conversationId: string): void {
    // TODO - localization
    if (this._spawnErr) {
      mainWindow.logService.logToChat(
        conversationId,
        textItem(LogLevel.Error, 'Failed to spawn ngrok'),
        exceptionItem(this._spawnErr)
      );
    } else if (!this._ngrokPath || !this._ngrokPath.length) {
      this.reportNotConfigured(conversationId);
    } else if (ngrok.running()) {
      this.reportRunning(conversationId);
    } else {
      mainWindow.logService.logToChat(conversationId, textItem(LogLevel.Debug, 'ngrok configured but not running'));
    }
  }

  private async startup() {
    this.cacheSettings();
    await this.recycle();
  }

  /** Logs messages that tell the user that ngrok isn't configured */
  private reportNotConfigured(conversationId: string): void {
    mainWindow.logService.logToChat(
      conversationId,
      textItem(LogLevel.Debug, 'ngrok not configured (only needed when connecting to remotely hosted bots)')
    );
    mainWindow.logService.logToChat(
      conversationId,
      externalLinkItem('Connecting to bots hosted remotely', 'https://aka.ms/cnjvpo')
    );
    mainWindow.logService.logToChat(conversationId, appSettingsItem('Edit ngrok settings'));
  }

  /** Logs messages that tell the user about ngrok's current running status */
  private reportRunning(conversationId: string): void {
    const bypassNgrokLocalhost = getStore().getState().framework.bypassNgrokLocalhost;
    mainWindow.logService.logToChat(conversationId, textItem(LogLevel.Debug, `ngrok listening on ${this._serviceUrl}`));
    mainWindow.logService.logToChat(
      conversationId,
      textItem(LogLevel.Debug, 'ngrok traffic inspector:'),
      externalLinkItem(this._inspectUrl, this._inspectUrl)
    );
    if (bypassNgrokLocalhost) {
      mainWindow.logService.logToChat(
        conversationId,
        textItem(LogLevel.Debug, 'Will bypass ngrok for local addresses')
      );
    } else {
      mainWindow.logService.logToChat(conversationId, textItem(LogLevel.Debug, 'Will use ngrok for local addresses'));
    }
  }

  private cacheSettings() {
    // Get framework from state
    const framework = getStore().getState().framework;

    // Cache host and port
    const localhost = framework.localhost || 'localhost';
    const parts = localhost.split(':');
    let hostname = localhost;
    if (parts.length > 0) {
      hostname = parts[0].trim();
    }
    if (parts.length > 1) {
      // Ignore port, for now
      // port = +parts[1].trim();
    }
    this._localhost = hostname;
  }
}

function ngrokConnect({ path, port }: { path: string; port: number }): Promise<{ inspectUrl: string; url: string }> {
  return new Promise((resolve, reject) => {
    ngrok.connect(
      { path, port },
      (err, url, inspectUrl) => {
        err ? reject(err) : resolve({ inspectUrl, url });
      }
    );
  });
}

async function killNgrok() {
  const killNgrokInternal = cb => {
    ngrok.kill(wasRunning1 => {
      cb(null, wasRunning1);
    });
  };

  const wasRunning = await promisify(killNgrokInternal)();

  if (wasRunning) {
    // log.debug('ngrok stopped');
  }
}
