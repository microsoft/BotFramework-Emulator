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

import { join } from 'path';

import {
  ngrokTunnel,
  updateTunnelError,
  NgrokTunnelAction,
  StatusCheckOnTunnel,
  TunnelStatus,
} from '@bfemulator/app-shared';
import { createStore, combineReducers } from 'redux';

import './fetchProxy';

import { intervals, NgrokInstance } from './ngrok';
import { intervalForEachPing } from './state/sagas/ngrokSagas';

const mockExistsSync = jest.fn(() => true);
const mockDispatch = jest.fn();
let mockStore;

jest.mock('./state', () => ({
  get dispatch() {
    return mockDispatch;
  },
  get store() {
    return mockStore;
  },
}));

jest.mock('fs-extra', () => ({}));

jest.mock('@microsoft/bf-chatdown', () => ({}));

const headersMap: Map<string, string> = new Map();
headersMap.set('Server', 'Emulator');
const tunnelResponseGeneric = (status: number, errorBody: string, headers = headersMap) => {
  return {
    text: async () => errorBody,
    status,
    headers,
  };
};

const mockTunnelStatusResponse = jest.fn(() => tunnelResponseGeneric(200, 'success'));

const connectToNgrokInstance = async (ngrok: NgrokInstance) => {
  try {
    const result = await ngrok.connect({
      addr: 61914,
      path: 'Applications/ngrok',
      name: 'c87d3e60-266e-11e9-9528-5798e92fee89',
      proto: 'http',
    });
    return result;
  } catch (e) {
    throw e;
  }
};
const mockSpawn = {
  on: () => void 0,
  stdin: { on: () => void 0 },
  stdout: {
    pause: () => void 0,
    on: (type, cb) => {
      if (type === 'data') {
        cb('t=2019-02-01T14:10:08-0800 lvl=info msg="starting web service" obj=web addr=127.0.0.1:4041');
      }
    },
    removeListener: () => void 0,
  },
  stderr: { on: () => void 0, pause: () => void 0 },
  kill: () => void 0,
};

let mockOk = 0;
jest.mock('child_process', () => ({
  spawn: () => mockSpawn,
}));

jest.mock('fs', () => ({
  existsSync: () => mockExistsSync(),
  mkdirSync: jest.fn(),
  writeFileSync: jest.fn(),
  createWriteStream: () => ({
    write: jest.fn(),
    end: jest.fn(),
  }),
}));

jest.mock('./utils/ensureStoragePath', () => ({ ensureStoragePath: () => '' }));
jest.mock('node-fetch', () => {
  const ngrokPublicUrl = 'https://d1a2bf16.ngrok.io';
  const mockJson = {
    name: 'e2cfb800-266f-11e9-bc59-e5847cdee2d1',
    uri: '/api/tunnels/e2cfb800-266f-11e9-bc59-e5847cdee2d1',
    proto: 'https',
  };
  Object.defineProperty(mockJson, 'public_url', {
    value: ngrokPublicUrl,
  });
  return async (input, params) => {
    switch (input) {
      case ngrokPublicUrl:
        if (params.method === 'DELETE') {
          return {
            ok: ++mockOk > 0,
            json: async () => mockJson,
            text: async () => 'oh noes!',
          };
        }
        return mockTunnelStatusResponse();

      default:
        return {
          ok: ++mockOk > 0,
          json: async () => mockJson,
          text: async () => 'oh noes!',
        };
    }
  };
});

describe('the ngrok ', () => {
  let ngrok: NgrokInstance;

  beforeEach(() => {
    jest.useRealTimers();
    mockDispatch.mockImplementation((args: NgrokTunnelAction<StatusCheckOnTunnel>) =>
      args.payload.onTunnelPingSuccess()
    );
    mockStore = createStore(combineReducers({ ngrokTunnel }));
    ngrok = new NgrokInstance();
    ngrok.ngrokEmitter.removeAllListeners();
    mockOk = 0;
  });

  afterEach(() => {
    ngrok.kill();
    jest.useRealTimers();
  });

  describe('ngrok connect/disconnect operations', () => {
    it('should spawn ngrok successfully when the happy path is followed', async () => {
      const result = await connectToNgrokInstance(ngrok);
      expect(result).toEqual({
        inspectUrl: 'http://127.0.0.1:4041',
        url: 'https://d1a2bf16.ngrok.io',
      });
    });

    it('should retry if the request to retrieve the ngrok url fails the first time', async () => {
      mockOk = -5;
      await connectToNgrokInstance(ngrok);
      expect(mockOk).toBe(1);
    });

    it('should disconnect', async () => {
      let disconnected = false;
      const ret = new Promise<void>(resolve => {
        ngrok.ngrokEmitter.on('disconnect', () => {
          disconnected = true;
          expect(disconnected).toBe(true);
          resolve();
        });
      });

      await connectToNgrokInstance(ngrok);
      await ngrok.disconnect();
      return ret;
    });

    it('should throw when the number of reties to retrieve the ngrok url are exhausted.', async () => {
      mockOk = -101;
      let threw = false;
      intervals.retry = 1;
      try {
        await connectToNgrokInstance(ngrok);
      } catch (e) {
        threw = e;
      }
      expect(threw.toString()).toBe('Error: oh noes!');
    });

    it('should throw if it failed to find an ngrok executable at the specified path.', async () => {
      mockExistsSync.mockReturnValueOnce(false);

      let thrown;
      try {
        await connectToNgrokInstance(ngrok);
      } catch (e) {
        thrown = e;
      }
      expect(thrown).toBeDefined();
    });
  });

  describe('ngrok tunnel heath status check operations', () => {
    it('should check tunnel status every minute and report success if tunnel ping was a success.', async () => {
      jest.useFakeTimers();
      await connectToNgrokInstance(ngrok);
      ngrok.ngrokEmitter.on('onTunnelStatusPing', (msg: TunnelStatus) => {
        expect(msg).toEqual(TunnelStatus.Active);
      });
      jest.advanceTimersByTime(intervalForEachPing + 1);
    });

    // First minute generates a Too many connections error. Second minute the tunnel resets back to an active state
    it('Should not emit onTunnel error if ngrok tunnel error state has not changed to prevent notification flooding.', async () => {
      //Situation where ngrok saga does the ping and calls onTunnelPingError with status 400. Before the next ping happens dispatching an action to set the state to reflect the same. Hence, no notificaiton flooding.
      jest.useFakeTimers();
      const tunnelErrorMock = jest.fn();
      ngrok.ngrokEmitter.on('onTunnelError', tunnelErrorMock);

      mockDispatch.mockImplementation((args: NgrokTunnelAction<StatusCheckOnTunnel>) => {
        args.payload.onTunnelPingError({
          status: 400,
          text: 'Tunnel does not exist',
        });
      });
      await connectToNgrokInstance(ngrok);
      mockStore.dispatch(
        updateTunnelError({
          statusCode: 400,
          errorMessage: 'Tunnel does not exist',
        })
      );
      jest.advanceTimersByTime(intervalForEachPing + 1);
      expect(tunnelErrorMock).toBeCalledTimes(1);
    });

    // // First minute generates a Too many connections error for first minute. Second minute the tunnel resets back to an active state
    it('Should dynamically check for status change every minute. ', async () => {
      jest.useFakeTimers();
      mockDispatch.mockImplementationOnce((args: NgrokTunnelAction<StatusCheckOnTunnel>) => {
        args.payload.onTunnelPingError({
          text: 'Tunnel has too many connections',
          status: 422,
        });
      });
      ngrok.ngrokEmitter.on('onTunnelError', err => {
        expect(err.statusCode).toEqual(422);
        expect(err.errorMessage).toBe('Tunnel has too many connections');
      });
      await connectToNgrokInstance(ngrok);
      const ret = new Promise<void>(resolve => {
        ngrok.ngrokEmitter.on('onTunnelStatusPing', (status: TunnelStatus) => {
          expect(status).toBe(TunnelStatus.Active);
          resolve();
        });
      });
      jest.advanceTimersByTime(60001);
      return ret;
    });
  });
});
