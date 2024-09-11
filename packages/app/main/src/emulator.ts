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

import { defaultRestServerOptions, EmulatorRestServer, EmulatorRestServerOptions } from './server/restServer';
import { getSettings } from './state/store';

let emulator: Emulator;
/**
 * Top-level state container for the Node process.
 */
export class Emulator {
  private _server: EmulatorRestServer;

  public static initialize(): void {
    if (!emulator) {
      emulator = new Emulator();
    }
  }

  public static getInstance(): Emulator {
    if (!emulator) {
      throw new Error(
        'Emulator has not been initialized yet. Please instantiate a new instance of Emulator before calling getInstance()'
      );
    }
    return emulator;
  }

  public get server(): EmulatorRestServer {
    if (!this._server) {
      throw new Error('Emulator rest server has not been initialized yet. Please call initServer().');
    }
    return this._server;
  }

  private async getServiceUrl(s: string) {
    if (s) return s;
    else return `http://localhost:${Emulator.getInstance().server.serverPort}`;
  }

  /** Initializes the emulator rest server. No-op if already called. */
  public initServer(options: EmulatorRestServerOptions = defaultRestServerOptions): void {
    if (!this._server) {
      this._server = new EmulatorRestServer({
        ...options,
        getServiceUrl: botUrl => this.getServiceUrl(getSettings().framework.tunnelUrl),
        getServiceUrlForOAuth: () => this.getServiceUrl(getSettings().framework.tunnelUrl),
      });
    }
  }

  /**
   * Starts the rest server and mounts all the routes.
   * @param port Explicit port that the server will listen on.
   * Omitting the port will automatically choose a free port.
   */
  public async startup(port?: number) {
    await this.server.start(port);
  }

  public async report(conversationId: string, botUrl: string): Promise<void> {
    this.server.report(conversationId);
  }
}
