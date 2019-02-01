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
import './fetchProxy';
import { ngrokEmitter } from './ngrok';
import * as ngrok from './ngrok';

const mockSpawn = {
  on: () => {},
  stdin: { on: (type, cb) => void 0 },
  stdout: {
    on: (type, cb) => {
      if (type === 'data') {
        setTimeout(() =>
          cb('t=2019-02-01T14:10:08-0800 lvl=info msg="starting web service" obj=web addr=127.0.0.1:4041')
        );
      }
    },
  },
  stderr: { on: (type, cb) => void 0 },
  kill: () => void 0,
};

jest.mock('child_process', () => ({
  spawn: () => mockSpawn,
}));

let mockOk = 0;
jest.mock('node-fetch', () => {
  const mockJson = {
    name: 'e2cfb800-266f-11e9-bc59-e5847cdee2d1',
    uri: '/api/tunnels/e2cfb800-266f-11e9-bc59-e5847cdee2d1',
    proto: 'https',
  };
  Object.defineProperty(mockJson, 'public_url', {
    value: 'https://d1a2bf16.ngrok.io',
  });
  return async (input, init) => {
    return {
      ok: ++mockOk > 0,
      json: async () => mockJson,
      text: async () => 'oh noes!',
    };
  };
});

describe('the ngrok ', () => {
  afterEach(() => {
    ngrok.kill();
  });
  it('should spawn ngrok successfully when the happy path is followed', async () => {
    const result = await ngrok.connect({
      addr: 61914,
      path: '/Applications/ngrok',
      name: 'c87d3e60-266e-11e9-9528-5798e92fee89',
      proto: 'http',
    });
    expect(result).toEqual({
      inspectUrl: 'http://127.0.0.1:4041',
      url: 'https://d1a2bf16.ngrok.io',
    });
  });

  it('should retry if the request to retrieve the ngrok url fails the first time', async () => {
    mockOk = -5;
    await ngrok.connect({
      addr: 61914,
      path: '/Applications/ngrok',
      name: 'c87d3e60-266e-11e9-9528-5798e92fee89',
      proto: 'http',
    });

    expect(mockOk).toBe(1);
  });

  it('should emit when the ngrok session is expired', async () => {
    mockOk = 0;
    ngrok.intervals.retry = 100;
    ngrok.intervals.expirationPoll = 1;
    ngrok.intervals.expirationTime = -1;
    let emitted = false;
    ngrok.ngrokEmitter.on('expired', () => {
      emitted = true;
    });
    await ngrok.connect({
      addr: 61914,
      path: '/Applications/ngrok',
      name: 'c87d3e60-266e-11e9-9528-5798e92fee89',
      proto: 'http',
    });
    await new Promise(resolve => {
      setTimeout(resolve, 100);
    });
    expect(emitted).toBe(true);
  });

  it('should disconnect', async () => {
    let disconnected = false;
    ngrokEmitter.on('disconnect', url => {
      disconnected = true;
    });

    await ngrok.connect({
      addr: 61914,
      path: '/Applications/ngrok',
      name: 'c87d3e60-266e-11e9-9528-5798e92fee89',
      proto: 'http',
    });
    await ngrok.disconnect();
    expect(disconnected).toBe(true);
  });

  it('should throw when the number of reties to retrieve the ngrok url are exhausted', async () => {
    mockOk = -101;
    let threw = false;
    ngrok.intervals.retry = 1;
    try {
      await ngrok.connect({
        addr: 61914,
        path: '/Applications/ngrok',
        name: 'c87d3e60-266e-11e9-9528-5798e92fee89',
        proto: 'http',
      });
    } catch (e) {
      threw = e;
    }
    expect(threw.toString()).toBe('Error: oh noes!');
  });
});
