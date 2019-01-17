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

import * as path from 'path';
import { clearTimeout, setTimeout } from 'timers';

import got from 'got';

const spawn = require('child_process').spawn;
const Emitter = require('events').EventEmitter;
const platform = require('os').platform();

const lock = require('lock')();
/* eslint-disable typescript/no-var-requires */
const async = require('async');
const uuid = require('node-uuid');
const xtend = require('xtend');
/* eslint-enable typescript/no-var-requires */

const bin = 'ngrok' + (platform === 'win32' ? '.exe' : '');
const ready = /starting web service.*addr=(\d+\.\d+\.\d+\.\d+:\d+)/;

const NGROK_EXPIRATION_TIME = 1000 * 60 * 60 * 8; // 8 hours in ms
const NGROK_EXPIRATION_POLLING_INTERVAL = 1000 * 60 * 5; // 5 minutes

let ngrokStartTime: number;
let ngrokExpirationTimer: NodeJS.Timer;

const noop = function() {
  return null;
};
export const ngrokEmitter = new Emitter().on('error', noop);
let api: (opts: any) => Promise<any>;
let ngrok;
let tunnels = {};
let inspectUrl = '';

export function running() {
  return ngrok && ngrok.pid;
}

export function connect(opts: any, cb: any) {
  if (typeof opts === 'function') {
    cb = opts;
  }

  cb = cb || noop;
  opts = defaults(opts);

  if (api) {
    return runTunnel(opts, cb);
  }

  lock('ngrok', function(release: any) {
    function run(err: any) {
      if (err) {
        ngrokEmitter.emit('error', err);
        return cb(err);
      }
      runNgrok(
        opts,
        release(function(err1: any) {
          if (err1) {
            ngrokEmitter.emit('error', err1);
            return cb(err1);
          }
          runTunnel(opts, cb);
        })
      );
    }

    opts.authtoken ? authtoken(opts.authtoken, run) : run(null);
  });
}

function defaults(opts: any) {
  opts = opts || { proto: 'http', addr: 80 };

  if (typeof opts === 'function') {
    opts = { proto: 'http', addr: 80 };
  }

  if (typeof opts !== 'object') {
    opts = { proto: 'http', addr: opts };
  }

  if (!opts.proto) {
    opts.proto = 'http';
  }

  if (!opts.addr) {
    opts.addr = opts.port || opts.host || 80;
  }

  if (opts.httpauth) {
    opts.auth = opts.httpauth;
  }

  if (['us', 'eu', 'au', 'ap'].indexOf(opts.region) === -1) {
    opts.region = 'us';
  }

  return opts;
}

function runNgrok(opts: any, cb: any) {
  if (api) {
    return cb();
  }
  const filename = `${opts.path ? path.basename(opts.path) : bin}`;
  const folder = opts.path
    ? path.dirname(opts.path)
    : path.join(__dirname, 'bin');

  ngrok = spawn(
    path.join(folder, filename),
    ['start', '--none', '--log=stdout', '--region=' + opts.region],
    { cwd: folder }
  ).on('error', err => {
    cb(err);
  });

  ngrok.stdout.on('data', function(data: any) {
    const addr = data.toString().match(ready);
    if (addr) {
      inspectUrl = `http://${addr[1]}`;
      api = options => {
        const urlCombined = `${inspectUrl}/${options.url}`;
        options = {
          ...options,
          json: true,
          url: urlCombined,
          useElectronNet: true,
        };
        return got(options);
      };

      cb();
    }
  });

  ngrok.stderr.on('data', function(data: any) {
    const info = data.toString().substring(0, 10000);
    return cb(new Error(info));
  });

  ngrok.on('exit', function() {
    api = null;
    tunnels = {};
    cleanUpNgrokExpirationTimer();
    ngrokEmitter.emit('disconnect');
  });

  ngrok.on('close', function() {
    cleanUpNgrokExpirationTimer();
    return ngrokEmitter.emit('close');
  });
  (process as NodeJS.EventEmitter).on('exit', function() {
    kill(null);
  });
}

/** Checks if the ngrok tunnel is due for expiration */
function checkForNgrokExpiration(): void {
  const currentTime = Date.now();
  const timeElapsed = currentTime - ngrokStartTime;
  if (timeElapsed >= NGROK_EXPIRATION_TIME) {
    cleanUpNgrokExpirationTimer();
    ngrokEmitter.emit('expired');
  } else {
    ngrokExpirationTimer = setTimeout(
      checkForNgrokExpiration,
      NGROK_EXPIRATION_POLLING_INTERVAL
    );
  }
}

/** Clears the ngrok expiration timer and resets the tunnel start time */
function cleanUpNgrokExpirationTimer(): void {
  ngrokStartTime = null;
  clearTimeout(ngrokExpirationTimer);
}

function runTunnel(opts: any, cb: any) {
  _runTunnel(opts, function(err: any, url: any, inspectPort: any) {
    if (err) {
      ngrokEmitter.emit('error', err);
      return cb(err);
    }

    // start polling for ngrok expiration
    ngrokStartTime = Date.now();
    ngrokExpirationTimer = setTimeout(
      checkForNgrokExpiration,
      NGROK_EXPIRATION_POLLING_INTERVAL
    );

    ngrokEmitter.emit('connect', url, inspectPort);
    return cb(null, url, inspectPort);
  });
}

function _runTunnel(opts: any, cb: any) {
  let retries = 100;
  opts.name = String(opts.name || uuid.v4());
  const retry = function() {
    const options = {
      method: 'POST',
      url: 'api/tunnels',
      body: opts,
    };
    api(options)
      .then(resp => {
        const url = resp.body && resp.body.public_url;
        if (!url) {
          return cb(
            xtend(
              new Error(resp.body.msg || 'failed to start tunnel'),
              resp.body
            )
          );
        }
        tunnels[url] = resp.body.uri;
        if (opts.proto === 'http' && opts.bind_tls !== false) {
          tunnels[url.replace('https', 'http')] = resp.body.uri + ' (http)';
        }
        return cb(null, url, inspectUrl);
      })
      .catch(err => {
        const notReady =
          (err.statusCode === 500 && /panic/.test(err.response.body)) ||
          (err.statusCode === 502 &&
            err.response.body.details &&
            err.response.body.details.err === 'tunnel session not ready yet');
        if (notReady) {
          return retries--
            ? setTimeout(retry, 200)
            : cb(new Error(err.response.body));
        }
        return cb(err);
      });
  };

  retry();
}

export function authtoken(_token: any, _cb: any) {
  // 	cb = cb || noop;
  // 	const a = spawn(
  // 		opts.path || bin,
  // 		['authtoken', token],
  // 		{cwd: __dirname + '/bin'});
  // 	a.stdout.once('data', done.bind(null, null, token));
  // 	a.stderr.once('data', done.bind(null, new Error('cant set authtoken')));
  // 	function done(err, token) {
  // 		cb(err, token);
  // 		a.kill();
  // 	}
}

export function disconnect(url: any, cb: any) {
  cb = cb || noop;
  if (typeof url === 'function') {
    cb = url;
    url = null;
  }
  if (!api) {
    return cb();
  }
  if (url) {
    const options = {
      method: 'DELETE',
      url: tunnels[url],
    };
    return api(options)
      .then(resp => {
        if (resp.statusCode !== 204) {
          return cb(new Error(resp.body));
        }
        delete tunnels[url];
        ngrokEmitter.emit('disconnect', url);
        return cb();
      })
      .catch(err => {
        return cb(err);
      });
  }

  return async.each(Object.keys(tunnels), disconnect, function(err: any) {
    if (err) {
      ngrokEmitter.emit('error', err);
      return cb(err);
    }
    ngrokEmitter.emit('disconnect');
    return cb();
  });
}

export function kill(cb: any) {
  cb = cb || noop;
  if (!ngrok) {
    cb(false);
    return;
  }
  ngrok.on('exit', function() {
    // api = null;
    // tunnels = {};
    // ngrokEmitter.emit('disconnect');
    cb(true);
  });
  try {
    if (!ngrok.kill()) {
      throw new Error('err-cleanup');
    }
  } catch (e) {
    api = null;
    ngrok = null;
    tunnels = {};
    cleanUpNgrokExpirationTimer();
    cb(false);
  }
}
