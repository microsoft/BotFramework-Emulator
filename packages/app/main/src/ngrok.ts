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
const ready = /starting web service.*addr=(\d+\.\d+\.\d+\.\d+:\d+)/;

let ngrokStartTime: number;
let ngrokExpirationTimer: NodeJS.Timer;
let pendingConnection: Promise<{ url; inspectUrl }>;
export const intervals = { retry: 200, expirationPoll: 1000 * 60 * 5, expirationTime: 1000 * 60 * 60 * 8 };

// Errors should result in the immediate termination of ngrok
// since we have no visibility into the internal state of
// ngrok after the error is received.
export const ngrokEmitter = new EventEmitter().on('error', kill);
let ngrok: ChildProcess;
let tunnels = {};
let inspectUrl = '';

export function running(): boolean {
  return ngrok && !!ngrok.pid;
}

export async function connect(opts: Partial<NgrokOptions>): Promise<{ url; inspectUrl }> {
  const options = { ...defaultOptions, ...opts } as NgrokOptions;
  if (pendingConnection) {
    return pendingConnection;
  }
  await getNgrokInspectUrl(options);
  pendingConnection = runTunnel(options);

  return pendingConnection;
}

async function getNgrokInspectUrl(opts: NgrokOptions): Promise<{ inspectUrl: string }> {
  if (running()) {
    return { inspectUrl };
  }
  ngrok = spawnNgrok(opts);
  // If we do not receive a ready state from ngrok within 3 seconds, emit and reject
  inspectUrl = await new Promise<string>((resolve, reject) => {
    const timeout = setTimeout(() => {
      const message = 'Failed to receive a ready state from ngrok within 3 seconds.';
      ngrokEmitter.emit('error', message);
      reject(message);
    }, 3000);

    ngrok.stdout.on('data', (data: Buffer) => {
      const addr = data.toString().match(ready);
      if (!addr) {
        return;
      }
      clearTimeout(timeout);
      resolve(`http://${addr[1]}`);
    });
  });
  return { inspectUrl };
}

/** Checks if the ngrok tunnel is due for expiration */
function checkForNgrokExpiration(): void {
  const currentTime = Date.now();
  const timeElapsed = currentTime - ngrokStartTime;
  if (timeElapsed >= intervals.expirationTime) {
    cleanUpNgrokExpirationTimer();
    ngrokEmitter.emit('expired');
  } else {
    ngrokExpirationTimer = setTimeout(checkForNgrokExpiration, intervals.expirationPoll);
  }
}

/** Clears the ngrok expiration timer and resets the tunnel start time */
function cleanUpNgrokExpirationTimer(): void {
  ngrokStartTime = null;
  clearTimeout(ngrokExpirationTimer);
}

async function runTunnel(opts: NgrokOptions): Promise<{ url; inspectUrl }> {
  let retries = 100;
  const url = `${inspectUrl}/api/tunnels`;
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
    tunnels[publicUrl] = uri;
    if (opts.proto === 'http' && opts.bind_tls) {
      tunnels[publicUrl.replace('https', 'http')] = uri + ' (http)';
    }
    ngrokStartTime = Date.now();
    ngrokExpirationTimer = setTimeout(checkForNgrokExpiration, intervals.expirationPoll);

    ngrokEmitter.emit('connect', publicUrl, inspectUrl);
    pendingConnection = null;
    return { url: publicUrl, inspectUrl };
  }
}

export async function disconnect(url?: string) {
  const tunnelsToDisconnect = url ? [tunnels[url]] : Object.keys(tunnels);
  const requests = tunnelsToDisconnect.map(tunnel => fetch(tunnel, { method: 'DELETE' }));
  const responses: Response[] = await Promise.all(requests);
  responses.forEach(response => {
    if (!response.ok || response.status === 204) {
      // Not sure why a 204 is a failure
      return;
    }
    delete tunnels[response.url];
    ngrokEmitter.emit('disconnect', response.url);
  });
}

export function kill() {
  if (!ngrok) {
    return;
  }
  ngrok.kill();
  ngrok = null;
  tunnels = {};
  cleanUpNgrokExpirationTimer();
}

function spawnNgrok(opts: NgrokOptions): ChildProcess {
  const filename = `${opts.path ? path.basename(opts.path) : bin}`;
  const folder = opts.path ? path.dirname(opts.path) : path.join(__dirname, 'bin');
  const args = ['start', '--none', '--log=stdout', `--region=${opts.region}`];
  const ngrokPath = path.join(folder, filename);
  const ngrok = spawn(ngrokPath, args, { cwd: folder });
  // Errors are emitted instead of throwing since ngrok is a long running process
  ngrok.on('error', e => ngrokEmitter.emit('error', e));

  ngrok.on('exit', () => {
    tunnels = {};
    cleanUpNgrokExpirationTimer();
    ngrokEmitter.emit('disconnect');
  });

  ngrok.on('close', () => {
    cleanUpNgrokExpirationTimer();
    ngrokEmitter.emit('close');
  });

  ngrok.stderr.on('data', (data: Buffer) => ngrokEmitter.emit('error', data.toString()));
  return ngrok;
}
