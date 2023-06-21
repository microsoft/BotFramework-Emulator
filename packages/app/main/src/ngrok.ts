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
import { clearTimeout, setTimeout } from 'timers';
import { platform } from 'os';
import * as path from 'path';
import { existsSync } from 'fs';

import { uniqueId } from '@bfemulator/sdk-shared';
import { checkOnTunnel, TunnelInfo, TunnelStatus } from '@bfemulator/app-shared';

import { intervalForEachPing } from './state/sagas/ngrokSagas';
import { ensureStoragePath, writeFile, writeStream, FileWriteStream } from './utils';
import { PostmanNgrokCollection } from './utils/postmanNgrokCollection';
import { dispatch, store } from './state';

/* eslint-enable @typescript-eslint/no-var-requires */
export interface NgrokOptions {
  addr: number;
  name: string;
  port: number;
  proto: 'http' | 'https' | 'tcp' | 'tls';
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
  inspect: true,
};

const bin = 'ngrok' + (platform() === 'win32' ? '.exe' : '');
const addrRegExp = /starting web service.*addr=(\d+\.\d+\.\d+\.\d+:\d+)/;
const logPath: string = path.join(ensureStoragePath(), 'ngrok.log');
const postmanCollectionPath: string = path.join(ensureStoragePath(), 'ngrokCollection.json');

export const intervals = { retry: 200, expirationPoll: 1000 * 60 * 5, expirationTime: 1000 * 60 * 60 * 8 };

export class NgrokInstance {
  // Errors should result in the immediate termination of ngrok
  // since we have no visibility into the internal state of
  // ngrok after the error is received.
  public ngrokEmitter = new EventEmitter().on('error', this.kill);
  private pendingConnection: Promise<{ url; inspectUrl }>;
  private ngrokProcess: ChildProcess;
  private ngrokFilePath = '';
  private tunnels = {};
  private inspectUrl = '';
  private intervalForHealthCheck: NodeJS.Timer = null;
  private ws: FileWriteStream = null;
  private boundCheckTunnelStatus = null;

  constructor(newNgrokPath) {
    this.boundCheckTunnelStatus = this.checkTunnelStatus.bind(this);
    this.ngrokFilePath = newNgrokPath;
  }

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
    this.checkTunnelStatus();
    this.intervalForHealthCheck = setInterval(() => this.boundCheckTunnelStatus(), intervalForEachPing);
    return tunnelInfo;
  }

  public async checkTunnelStatus(): Promise<void> {
    dispatch(
      checkOnTunnel({
        onTunnelPingSuccess: () => {
          this.ngrokEmitter.emit('onTunnelStatusPing', TunnelStatus.Active);
        },
        onTunnelPingError: async (response: { text: string; status: number; cancelPingInterval: boolean }) => {
          if (store.getState().ngrokTunnel.errors.statusCode === response.status) {
            return;
          }
          const errorMessage = response.text;
          if (this.ws) {
            this.ws.write('-- Tunnel Error Response --');
            this.ws.write(`Status Code: ${response.status}`);
            this.ws.write(errorMessage);
            this.ws.write('-- End Response --');
          }
          this.ngrokEmitter.emit('onTunnelError', {
            statusCode: response.status,
            errorMessage,
          });
          this.ngrokEmitter.emit('onTunnelStatusPing', TunnelStatus.Error);
          if (!response || !response.status || response.cancelPingInterval) {
            clearInterval(this.intervalForHealthCheck);
            return;
          }
        },
      })
    );
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
    clearInterval(this.intervalForHealthCheck);
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
    this.ws.end();
    clearInterval(this.intervalForHealthCheck);
  }

  private async getNgrokInspectUrl(opts: NgrokOptions): Promise<{ inspectUrl: string }> {
    this.ws = writeStream(logPath);
    if (this.running()) {
      return { inspectUrl: this.inspectUrl };
    }
    this.ngrokProcess = this.spawnNgrok(opts);
    // If we do not receive a ready state from ngrok within 40 seconds, emit and reject
    this.inspectUrl = await new Promise<string>((resolve, reject) => {
      const timeout = setTimeout(() => {
        const message = 'Failed to receive a ready state from ngrok within 40 seconds.';
        this.ngrokEmitter.emit('error', message);
        reject(message);
      }, 40000);

      /**
       * Look for an address in the many messages
       * sent by ngrok or fail if one does not arrive
       * in 40 seconds.
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
      process.on('exit', () => {
        this.kill();
      });
    });
    return { inspectUrl: this.inspectUrl };
  }

  private updatePostmanCollectionWithNewUrls(inspectUrl: string): void {
    const postmanCopy = JSON.stringify(PostmanNgrokCollection);
    const collectionWithUrlReplaced = postmanCopy.replace(/127.0.0.1:4040/g, inspectUrl.replace(/(^\w+:|^)\/\//, ''));
    writeFile(postmanCollectionPath, collectionWithUrlReplaced);
  }

  private async runTunnel(opts: NgrokOptions): Promise<{ url: string; inspectUrl: string }> {
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
        throw Object.assign(new Error(msg || 'failed to start tunnel.'), result);
      }
      this.tunnels[publicUrl] = uri;
      if (opts.proto === 'http' && opts.bind_tls) {
        this.tunnels[publicUrl.replace('https', 'http')] = uri + ' (http)';
      }
      this.ngrokEmitter.emit('connect', publicUrl, this.inspectUrl);
      this.updatePostmanCollectionWithNewUrls(this.inspectUrl);
      const tunnelDetails: TunnelInfo = {
        publicUrl,
        inspectUrl: this.inspectUrl,
        postmanCollectionPath,
        logPath,
      };
      this.ngrokEmitter.emit('onNewTunnelConnected', tunnelDetails);
      this.pendingConnection = null;
      return { url: publicUrl, inspectUrl: this.inspectUrl };
    }
  }

  private spawnNgrok(opts: NgrokOptions): ChildProcess {
    const filename = `${this.ngrokFilePath ? path.basename(this.ngrokFilePath) : bin}`;
    const folder = this.ngrokFilePath ? path.dirname(this.ngrokFilePath) : path.join(__dirname, 'bin');

    try {
      this.ws.write('Ngrok Logger starting');
      const args = ['start', '--none', `--log=stdout`];
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
        this.tunnels = {};
        clearInterval(this.intervalForHealthCheck);
        this.ngrokEmitter.emit('disconnect');
      });

      ngrok.on('close', () => {
        clearInterval(this.intervalForHealthCheck);
        this.ngrokEmitter.emit('close');
      });

      ngrok.stdout.on('data', data => {
        this.ws.write(data.toString() + '\n');
      });

      ngrok.stderr.on('data', (data: Buffer) =>
        this.ngrokEmitter.emit('error', () => {
          this.ws.write(data.toString());
        })
      );
      return ngrok;
    } catch (e) {
      throw e;
    }
  }
}
