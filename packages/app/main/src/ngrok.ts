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
import { ChildProcess, spawn } from 'child_process';
import { EventEmitter } from 'events';
import { platform } from 'os';
import * as path from 'path';
import { ensureStoragePath, writeFile } from './utils';
import { existsSync } from 'fs';
import { clearTimeout, setTimeout } from 'timers';

import { uniqueId } from '@bfemulator/sdk-shared';

/* eslint-enable typescript/no-var-requires */
export interface NgrokOptions {
  addr: number;
  name: string;
  path: string;
  port: number;
  proto: 'http' | 'https' | 'tcp' | 'tls';
  region: 'us' | 'eu' | 'au' | 'ap';
  inspect: boolean;
  host_header?: string;
  bind_tls?: boolean | 'both';
  subdomain?: string;
  hostname?: string;
  crt?: string;
  key?: string;
  client_cas?: string;
  remote_addr?: string;
}

const defaultOptions: Partial<NgrokOptions> = {
  addr: 80,
  name: uniqueId(),
  proto: 'http',
  region: 'us',
  inspect: true,
};

const bin = 'ngrok' + (platform() === 'win32' ? '.exe' : '');
const addrRegExp = /starting web service.*addr=(\d+\.\d+\.\d+\.\d+:\d+)/;

export const intervals = { retry: 200, expirationPoll: 1000 * 60 * 5, expirationTime: 1000 * 60 * 60 * 8 };

export class NgrokInstance {
  // Errors should result in the immediate termination of ngrok
  // since we have no visibility into the internal state of
  // ngrok after the error is received.
  public ngrokEmitter = new EventEmitter().on('error', this.kill);
  private pendingConnection: Promise<{ url; inspectUrl }>;
  private ngrokProcess: ChildProcess;
  private tunnels = {};
  private inspectUrl = '';
  private ngrokStartTime: number;
  private ngrokExpirationTimer: NodeJS.Timer;

  public running(): boolean {
    return this.ngrokProcess && !!this.ngrokProcess.pid;
  }

  public async connect(opts: Partial<NgrokOptions>): Promise<{ url; inspectUrl }> {
    const options = { ...defaultOptions, ...opts } as NgrokOptions;
    if (this.pendingConnection) {
      return this.pendingConnection;
    }
    await this.getNgrokInspectUrl(options);
    const tunnelInfo: { url; inspectUrl } = await this.runTunnel(options);
    setInterval(() => this.checkTunnelStatus.bind(this)(tunnelInfo.url), 60000);
    return tunnelInfo;
  }

  private async checkTunnelStatus(inspectUrl: string): Promise<void> {
    const response: Response = await fetch(inspectUrl, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const isErrorResponse = response.status === 429 || response.status === 402 || response.status === 500;
    if (isErrorResponse) {
      this.ngrokEmitter.emit('tunnelError', response);
    }
  }

  public async disconnect(url?: string) {
    const tunnelsToDisconnect = url ? [this.tunnels[url]] : Object.keys(this.tunnels);
    const requests = tunnelsToDisconnect.map(tunnel => fetch(tunnel, { method: 'DELETE' }));
    const responses: Response[] = await Promise.all(requests);
    responses.forEach(response => {
      if (!response.ok || response.status === 204) {
        // Not sure why a 204 is a failure
        return;
      }
      delete this.tunnels[response.url];
      this.ngrokEmitter.emit('disconnect', response.url);
    });
  }

  public kill() {
    if (!this.ngrokProcess) {
      return;
    }
    this.ngrokProcess.stdout.pause();
    this.ngrokProcess.stderr.pause();

    this.ngrokProcess.kill();
    this.ngrokProcess = null;
    this.tunnels = {};
    this.cleanUpNgrokExpirationTimer();
  }

  private async getNgrokInspectUrl(opts: NgrokOptions): Promise<{ inspectUrl: string }> {
    if (this.running()) {
      return { inspectUrl: this.inspectUrl };
    }
    this.ngrokProcess = this.spawnNgrok(opts);
    // If we do not receive a ready state from ngrok within 15 seconds, emit and reject
    this.inspectUrl = await new Promise<string>((resolve, reject) => {
      const timeout = setTimeout(() => {
        const message = 'Failed to receive a ready state from ngrok within 15 seconds.';
        this.ngrokEmitter.emit('error', message);
        reject(message);
      }, 15000);

      /**
       * Look for an address in the many messages
       * sent by ngrok or fail if one does not arrive
       * in 15 seconds.
       */
      const onNgrokData = (data: Buffer) => {
        const addr = data.toString().match(addrRegExp);
        if (!addr) {
          return;
        }
        clearTimeout(timeout);
        this.ngrokProcess.stdout.removeListener('data', onNgrokData);
        resolve(`http://${addr[1]}`);
      };

      this.ngrokProcess.stdout.on('data', onNgrokData);
      process.on('exit', this.kill);
    });
    return { inspectUrl: this.inspectUrl };
  }

  /** Checks if the ngrok tunnel is due for expiration */
  private checkForNgrokExpiration(): void {
    const currentTime = Date.now();
    const timeElapsed = currentTime - this.ngrokStartTime;
    if (timeElapsed >= intervals.expirationTime) {
      this.cleanUpNgrokExpirationTimer();
      this.ngrokEmitter.emit('expired');
    } else {
      this.ngrokExpirationTimer = setTimeout(this.checkForNgrokExpiration.bind(this), intervals.expirationPoll);
    }
  }

  /** Clears the ngrok expiration timer and resets the tunnel start time */
  private cleanUpNgrokExpirationTimer(): void {
    this.ngrokStartTime = null;
    clearTimeout(this.ngrokExpirationTimer);
  }

  private async runTunnel(opts: NgrokOptions): Promise<{ url; inspectUrl }> {
    let retries = 100;
    const url = `${this.inspectUrl}/api/tunnels`;
    const body = JSON.stringify(opts);
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const resp = await fetch(url, {
        method: 'POST',
        body,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!resp.ok) {
        const error = await resp.text();
        await new Promise(resolve => setTimeout(resolve, ~~intervals.retry));
        if (!retries) {
          throw new Error(error);
        }
        retries--;
        continue;
      }

      const result = await resp.json();
      const { public_url: publicUrl, uri, msg } = result;
      if (!publicUrl) {
        throw Object.assign(new Error(msg || 'failed to start tunnel'), result);
      }
      this.tunnels[publicUrl] = uri;
      if (opts.proto === 'http' && opts.bind_tls) {
        this.tunnels[publicUrl.replace('https', 'http')] = uri + ' (http)';
      }
      this.ngrokStartTime = Date.now();
      this.ngrokExpirationTimer = setTimeout(this.checkForNgrokExpiration.bind(this), intervals.expirationPoll);

      this.ngrokEmitter.emit('connect', publicUrl, this.inspectUrl);
      this.pendingConnection = null;
      return { url: publicUrl, inspectUrl: this.inspectUrl };
    }
  }

  private spawnNgrok(opts: NgrokOptions): ChildProcess {
    const filename = `${opts.path ? path.basename(opts.path) : bin}`;
    const folder = opts.path ? path.dirname(opts.path) : path.join(__dirname, 'bin');
    const ngrokLoggerPath = path.join(ensureStoragePath(), 'ngrok.log');
    try {
      writeFile(ngrokLoggerPath, 'Ngrok Logger starting');
      console.log('Ngrok Logger starts', ngrokLoggerPath);
      const args = ['start', '--none', `--log=stdout`, `--region=${opts.region}`];
      const ngrokPath = path.join(folder, filename);
      if (!existsSync(ngrokPath)) {
        throw new Error(
          `Could not find ngrok executable at path: ${ngrokPath}. ` +
            `Make sure that the correct path to ngrok is configured in the Emulator app settings. ` +
            `Ngrok is required to receive a token from the Bot Framework token service.`
        );
      }
      const ngrok = spawn(ngrokPath, args, { cwd: folder });
      // Errors are emitted instead of throwing since ngrok is a long running process
      ngrok.on('error', e => this.ngrokEmitter.emit('error', e));

      ngrok.on('exit', () => {
        console.log('Inside exit');
        this.tunnels = {};
        this.cleanUpNgrokExpirationTimer();
        this.ngrokEmitter.emit('disconnect');
      });

      ngrok.on('close', () => {
        console.log('Inside close');
        this.cleanUpNgrokExpirationTimer();
        this.ngrokEmitter.emit('close');
      });

      ngrok.stdout.on('data', data => {
        writeFile(ngrokLoggerPath, data.toString() + '\n');
      });

      ngrok.stderr.on('data', (data: Buffer) => this.ngrokEmitter.emit('error', data.toString()));
      console.log(ngrok.pid);
      return ngrok;
    } catch (e) {
      throw new Error(`Ngrok spawning failed`);
    }
  }
}
