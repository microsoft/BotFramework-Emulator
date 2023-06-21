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

import { EventEmitter } from 'events';

import { FrameworkSettings } from '@bfemulator/app-shared';
import {
  appSettingsItem,
  exceptionItem,
  externalLinkItem,
  isLocalHostUrl,
  LogItem,
  LogLevel,
  textItem,
} from '@bfemulator/sdk-shared';

import { Emulator } from './emulator';
import { emulatorApplication } from './main';
import { NgrokInstance } from './ngrok';
import { getSettings } from './state/store';

let ngrokServiceInstance: NgrokService;

export class NgrokService {
  // Pass ngrok path to create instance without adding path to
  // Ngrok Options for compatibility with Ngrok 3
  private ngrok = new NgrokInstance(getSettings().framework.ngrokPath);
  private ngrokPath: string;
  private serviceUrl: string;
  private inspectUrl: string;
  private spawnErr: any;
  private localhost = 'localhost';
  private triedToSpawn: boolean;
  private pendingRecycle: Promise<void>;
  private oauthNgrokInstance: NgrokInstance;

  constructor() {
    return ngrokServiceInstance || (ngrokServiceInstance = this); // Singleton
  }

  public async getServiceUrl(botUrl: string): Promise<string> {
    // Ngrok can show as "running" but not have an active session
    // with an assigned ngrok url. If a recycle is pending, await
    // on it before reporting the service url otherwise, it will
    // report the wrong one.
    if (this.pendingRecycle) {
      await this.pendingRecycle;
    }
    if (this.isUsingNgrok(botUrl)) {
      if (!this.ngrok.running()) {
        await this.startup();
      }

      return this.serviceUrl;
    }
    // Do not use ngrok
    return `http://${this.localhost}:${Emulator.getInstance().server.serverPort}`;
  }

  // OAuth sign-in flow must always use an ngrok url so that the BF token
  // service can deliver the token to the Emulator
  public async getServiceUrlForOAuth(): Promise<string> {
    // grab the service url from the current ngrok instance if it's running
    if (this.pendingRecycle) {
      await this.pendingRecycle;
    }
    if (this.ngrok.running()) {
      return this.serviceUrl;
    }
    // otherwise, we need to spin up an auxillary ngrok instance that we can tear down when the token response comes back
    this.oauthNgrokInstance = new NgrokInstance(getSettings().framework.ngrokPath);
    const port = Emulator.getInstance().server.serverPort;
    const inspectUrl = new Promise<string>(async (resolve, reject) => {
      try {
        const { url } = await this.oauthNgrokInstance.connect({
          addr: port,
        });
        resolve(url);
      } catch (e) {
        reject(new Error(`Failed to connect to ngrok instance for OAuth postback URL: ${e}`));
      }
    });

    return inspectUrl;
  }

  public shutDownOAuthNgrokInstance(): void {
    if (this.oauthNgrokInstance) {
      this.oauthNgrokInstance.kill();
    }
  }

  public getSpawnStatus = (): { triedToSpawn: boolean; err: any } => ({
    triedToSpawn: this.triedToSpawn,
    err: this.spawnErr,
  });

  public async updateNgrokFromSettings(framework: FrameworkSettings) {
    this.cacheSettings();
    if (this.ngrokPath !== framework.ngrokPath && this.ngrok.running()) {
      return this.recycle();
    }
  }

  public recycle(): Promise<void> {
    if (this.pendingRecycle) {
      return this.pendingRecycle;
    }

    this.ngrok.kill();
    const port = Emulator.getInstance().server.serverPort;

    this.ngrokPath = getSettings().framework.ngrokPath;
    this.serviceUrl = `http://${this.localhost}:${port}`;
    this.inspectUrl = null;
    this.spawnErr = null;
    this.triedToSpawn = false;

    if (this.ngrokPath && this.ngrokPath.length) {
      return (this.pendingRecycle = new Promise(async resolve => {
        try {
          this.triedToSpawn = true;
          const { inspectUrl, url } = await this.ngrok.connect({
            addr: port,
          });

          this.serviceUrl = url;
          this.inspectUrl = inspectUrl;
        } catch (err) {
          this.spawnErr = err;
          // eslint-disable-next-line no-console
          console.error('Failed to spawn ngrok', err);
        }
        this.pendingRecycle = null;
        resolve();
      }));
    }
    return Promise.resolve();
  }

  public kill(): void {
    if (this.ngrok) {
      this.ngrok.kill();
    }
  }

  public async pingTunnel(): Promise<void> {
    await this.ngrok.checkTunnelStatus();
  }

  public get ngrokEmitter(): EventEmitter {
    return this.ngrok.ngrokEmitter || undefined;
  }

  public get running(): boolean {
    return this.ngrok.running() || false;
  }

  /** Logs messages signifying that ngrok has reconnected in all active conversations */
  public broadcastNgrokReconnected(): void {
    const bypassNgrokLocalhost = getSettings().framework.bypassNgrokLocalhost;
    const { broadcast } = this;
    broadcast(textItem(LogLevel.Debug, 'ngrok reconnected.'));
    broadcast(textItem(LogLevel.Debug, `ngrok listening on ${this.serviceUrl}`));
    broadcast(textItem(LogLevel.Debug, 'ngrok traffic inspector:'), externalLinkItem(this.inspectUrl, this.inspectUrl));
    if (bypassNgrokLocalhost) {
      broadcast(textItem(LogLevel.Debug, 'Will bypass ngrok for local addresses'));
    } else {
      broadcast(textItem(LogLevel.Debug, 'Will use ngrok for local addresses'));
    }
  }

  /** Logs messages signifying that ngrok has reconnected in all active conversations */
  public broadcastNgrokError(errorMessage: string): void {
    const { broadcast } = this;
    broadcast(textItem(LogLevel.Error, errorMessage));
  }

  /** Logs an item to all open conversations */
  public broadcast(...logItems: LogItem[]): void {
    const { conversations } = Emulator.getInstance().server.state;
    const conversationIds: string[] = conversations.getConversationIds();
    conversationIds.forEach(id => {
      emulatorApplication.mainWindow.logService.logToChat(id, ...logItems);
    });
  }

  /** Logs items to a single conversation based on current ngrok status */
  public async report(conversationId: string, botUrl: string): Promise<void> {
    // TODO - localization
    await this.getServiceUrl(botUrl);
    if (this.spawnErr) {
      emulatorApplication.mainWindow.logService.logToChat(
        conversationId,
        textItem(
          LogLevel.Error,
          'Failed to spawn ngrok. Please go to the Ngrok Status Viewer and download the log file for a more detailed view of the error.'
        ),
        exceptionItem(this.spawnErr)
      );
    } else if (!this.ngrokPath) {
      this.reportNotConfigured(conversationId);
    } else if (this.isUsingNgrok(botUrl)) {
      this.reportRunning(conversationId);
    } else {
      emulatorApplication.mainWindow.logService.logToChat(
        conversationId,
        textItem(LogLevel.Debug, 'ngrok configured but not running')
      );
    }
  }

  private async startup() {
    this.cacheSettings();
    await this.recycle();
  }

  /** Logs messages that tell the user that ngrok isn't configured */
  private reportNotConfigured(conversationId: string): void {
    emulatorApplication.mainWindow.logService.logToChat(
      conversationId,
      textItem(LogLevel.Debug, 'ngrok not configured (only needed when connecting to remotely hosted bots)')
    );
    emulatorApplication.mainWindow.logService.logToChat(
      conversationId,
      externalLinkItem('Connecting to bots hosted remotely', 'https://aka.ms/cnjvpo')
    );
    emulatorApplication.mainWindow.logService.logToChat(conversationId, appSettingsItem('Edit ngrok settings'));
  }

  /** Logs messages that tell the user about ngrok's current running status */
  private reportRunning(conversationId: string): void {
    const bypassNgrokLocalhost = getSettings().framework.bypassNgrokLocalhost;
    emulatorApplication.mainWindow.logService.logToChat(
      conversationId,
      textItem(LogLevel.Debug, `ngrok listening on ${this.serviceUrl}`)
    );
    emulatorApplication.mainWindow.logService.logToChat(
      conversationId,
      textItem(LogLevel.Debug, 'ngrok traffic inspector:'),
      externalLinkItem(this.inspectUrl, this.inspectUrl)
    );
    if (bypassNgrokLocalhost) {
      emulatorApplication.mainWindow.logService.logToChat(
        conversationId,
        textItem(LogLevel.Debug, 'Will bypass ngrok for local addresses')
      );
    } else {
      emulatorApplication.mainWindow.logService.logToChat(
        conversationId,
        textItem(LogLevel.Debug, 'Will use ngrok for local addresses')
      );
    }
  }

  private cacheSettings() {
    // Get framework from state
    const framework = getSettings().framework;

    // ensure that a path to ngrok gets set initially
    if (!this.ngrokPath && framework.ngrokPath) {
      this.ngrokPath = framework.ngrokPath;
    }

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
    this.localhost = hostname;
  }

  private isUsingNgrok(botUrl: string) {
    const { bypassNgrokLocalhost, runNgrokAtStartup } = getSettings().framework;
    const local = !botUrl || isLocalHostUrl(botUrl);
    return runNgrokAtStartup || !local || (local && !bypassNgrokLocalhost);
  }
}
