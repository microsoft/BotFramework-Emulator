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

import '../../fetchProxy';

import { applyMiddleware, createStore, Store, combineReducers } from 'redux';
import sagaMiddlewareFactory from 'redux-saga';
import { put } from 'redux-saga/effects';
import {
  checkOnTunnel,
  ngrokTunnel,
  setTimeIntervalSinceLastPing,
  updateNewTunnelInfo,
  NgrokTunnelAction,
  NgrokTunnelActions,
  SharedConstants,
  StatusCheckOnTunnel,
  TunnelError,
  TunnelCheckTimeInterval,
} from '@bfemulator/app-shared';

import { RootState } from '../store';

import { ngrokSagas, NgrokSagas, intervalForEachPing, tunnelPingTimeout } from './ngrokSagas';

const { Remove } = SharedConstants.Commands.Notifications;
const headersMap: Map<string, string> = new Map();
headersMap.set('Server', 'Emulator');
const tunnelResponseGeneric = (status: number, errorBody: string, headers = headersMap) => {
  return {
    text: async () => errorBody,
    status,
    headers,
  };
};

const mockTunnelStatusResponse = jest.fn(() => Promise.resolve(tunnelResponseGeneric(200, 'success')));

jest.mock('node-fetch', () => {
  return async (input, params) => mockTunnelStatusResponse();
});

let mockStore: Store<RootState>;

jest.mock('../store', () => ({
  get store() {
    return mockStore;
  },
}));

const sagaMiddleWare = sagaMiddlewareFactory();

describe('The Ngrok Sagas', () => {
  beforeEach(() => {
    jest.useRealTimers();
    mockStore = createStore(
      combineReducers({
        ngrokTunnel,
      }),
      applyMiddleware(sagaMiddleWare)
    );
    sagaMiddleWare.run(ngrokSagas);
    mockStore.dispatch(
      updateNewTunnelInfo({
        inspectUrl: 'http://127.0.0.1:4040',
        publicUrl: 'https://d1a2bf16.ngrok.io',
        logPath: '',
        postmanCollectionPath: '',
      })
    );
  });

  it('should call onTunnelPingSuccess', () => {
    const onSuccessMock = jest.fn();
    const onFailureMock = jest.fn();
    const action: NgrokTunnelAction<StatusCheckOnTunnel> = {
      payload: {
        onTunnelPingSuccess: onSuccessMock,
        onTunnelPingError: onFailureMock,
      },
      type: NgrokTunnelActions.checkOnTunnel,
    };
    const gen = NgrokSagas.runTunnelStatusHealthCheck(action);
    const notificationIds: string[] = ['notification-1', 'notification-2', 'notification-3'];
    let result = gen.next();
    result = gen.next('https://d1a2bf16.ngrok.io');
    result = gen.next();
    result = gen.next(notificationIds);
    result.value.ALL.forEach((val, index) => {
      expect(val.CALL.args[0]).toEqual(Remove);
      expect(val.CALL.args[1]).toEqual(notificationIds[index]);
    });
    result = gen.next();
    expect(result.value).toEqual(put(setTimeIntervalSinceLastPing(TunnelCheckTimeInterval.Now)));
    result = gen.next();
    result = gen.next();
    expect(result.value).toEqual(put(setTimeIntervalSinceLastPing(TunnelCheckTimeInterval.FirstInterval)));
    result = gen.next();
    result = gen.next();
    expect(result.value).toEqual(put(setTimeIntervalSinceLastPing(TunnelCheckTimeInterval.SecondInterval)));
    expect(onSuccessMock).toHaveBeenCalled();
    expect(onFailureMock).not.toHaveBeenCalled();
  });

  it('should emit ngrok error - Too many connections.', async () => {
    const tunnelError: TunnelError = {
      statusCode: 429,
      errorMessage: 'The tunnel session has violated the rate-limit policy of 20 connections per minute.',
    };
    mockTunnelStatusResponse.mockReturnValueOnce(
      Promise.resolve(tunnelResponseGeneric(tunnelError.statusCode, tunnelError.errorMessage))
    );
    return new Promise<void>(resolve => {
      mockStore.dispatch(
        checkOnTunnel({
          onTunnelPingSuccess: jest.fn(),
          onTunnelPingError: err => {
            expect(err.status).toBe(tunnelError.statusCode);
            resolve();
          },
        })
      );
    });
  });

  it('should emit ngrok error - No server header present in the response headers.', async () => {
    const tunnelError: TunnelError = {
      statusCode: 404,
      errorMessage: 'Tunnel not found.',
    };
    mockTunnelStatusResponse.mockReturnValueOnce(
      Promise.resolve(tunnelResponseGeneric(tunnelError.statusCode, tunnelError.errorMessage, new Map()))
    );
    return new Promise<void>(resolve => {
      mockStore.dispatch(
        checkOnTunnel({
          onTunnelPingSuccess: jest.fn(),
          onTunnelPingError: err => {
            expect(err.status).toBe(tunnelError.statusCode);
            resolve();
          },
        })
      );
    });
  });

  it('should emit ngrok error - Tunnel Expired.', async () => {
    const tunnelError: TunnelError = {
      statusCode: 402,
      errorMessage: 'Other generic tunnel errors.',
    };
    mockTunnelStatusResponse.mockReturnValueOnce(
      Promise.resolve(tunnelResponseGeneric(tunnelError.statusCode, tunnelError.errorMessage, new Map()))
    );
    return new Promise<void>(resolve => {
      mockStore.dispatch(
        checkOnTunnel({
          onTunnelPingSuccess: jest.fn(),
          onTunnelPingError: err => {
            expect(err.status).toBe(tunnelError.statusCode);
            resolve();
          },
        })
      );
    });
  });

  it('should emit ngrok generic error 500.', async () => {
    const tunnelError: TunnelError = {
      statusCode: 500,
      errorMessage: 'Other generic tunnel errors.',
    };
    mockTunnelStatusResponse.mockReturnValueOnce(
      Promise.resolve(tunnelResponseGeneric(tunnelError.statusCode, tunnelError.errorMessage))
    );
    return new Promise<void>(resolve => {
      mockStore.dispatch(
        checkOnTunnel({
          onTunnelPingSuccess: jest.fn(),
          onTunnelPingError: err => {
            expect(err.status).toBe(tunnelError.statusCode);
            resolve();
          },
        })
      );
    });
  });

  it('take the latest dispatched tunnel ping action always', async () => {
    const tunnelError: TunnelError = {
      statusCode: 500,
      errorMessage: 'Other generic tunnel errors.',
    };
    mockTunnelStatusResponse.mockReturnValueOnce(
      Promise.resolve(tunnelResponseGeneric(tunnelError.statusCode, tunnelError.errorMessage))
    );
    const onErrorFake = jest.fn();
    mockStore.dispatch(
      checkOnTunnel({
        onTunnelPingSuccess: jest.fn(),
        onTunnelPingError: onErrorFake,
      })
    );

    mockTunnelStatusResponse.mockReturnValueOnce(
      Promise.resolve(tunnelResponseGeneric(tunnelError.statusCode, tunnelError.errorMessage))
    );
    mockStore.dispatch(
      checkOnTunnel({
        onTunnelPingSuccess: jest.fn(),
        onTunnelPingError: onErrorFake,
      })
    );

    return new Promise<void>(resolve => {
      mockStore.dispatch(
        checkOnTunnel({
          onTunnelPingSuccess: () => {
            expect(onErrorFake).not.toHaveBeenCalled();
            resolve();
          },
          onTunnelPingError: jest.fn(),
        })
      );
    });
  });

  it('should throw onTunnelPing error if the request times out with a status 404', async () => {
    jest.useFakeTimers();
    mockTunnelStatusResponse.mockImplementationOnce(
      () =>
        new Promise(resolve => {
          //Never resolve this promise forcing the timeout race condition to win in fetchWithTimeout.ts}));
          setTimeout(() => {
            resolve();
          }, intervalForEachPing);
        })
    );

    const ret = new Promise<void>(resolve => {
      mockStore.dispatch(
        checkOnTunnel({
          onTunnelPingSuccess: jest.fn(),
          onTunnelPingError: (err: Response) => {
            expect(err.status).toBe(404);
            resolve();
          },
        })
      );
    });
    jest.advanceTimersByTime(tunnelPingTimeout);
    return ret;
  });
});
