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

import {
  TunnelStatus,
  NgrokTunnelAction,
  TunnelInfo,
  NgrokTunnelPayloadTypes,
  NgrokTunnelActions,
  TunnelError,
  TunnelStatusAndTs,
} from '../actions/ngrokTunnelActions';

import { ngrokTunnel, NgrokTunnelState } from './ngrokTunnel';

describe('Ngrok Tunnel reducer', () => {
  const DEFAULT_STATE: NgrokTunnelState = {
    inspectUrl: 'http://127.0.0.1:4040',
    publicUrl: '',
    logPath: '',
    postmanCollectionPath: '',
    errors: {} as TunnelError,
    tunnelStatus: TunnelStatus.Inactive,
    lastTunnelStatusCheckTS: '',
  };

  afterEach(() => {
    const emptyAction: NgrokTunnelAction<NgrokTunnelPayloadTypes> = {
      type: null,
      payload: null,
    };
    ngrokTunnel({ ...DEFAULT_STATE }, emptyAction);
  });

  it('Tunnel info should be set from payload', () => {
    const payload: TunnelInfo = {
      publicUrl: 'https://abc.io/',
      inspectUrl: 'http://127.0.0.1:4003',
      logPath: 'logger.txt',
      postmanCollectionPath: 'postman.json',
    };
    const setDetailsAction: NgrokTunnelAction<NgrokTunnelPayloadTypes> = {
      type: NgrokTunnelActions.setDetails,
      payload,
    };
    const startingState = { ...DEFAULT_STATE };
    const endingState = ngrokTunnel(startingState, setDetailsAction);

    expect(endingState.publicUrl).toBe(payload.publicUrl);
    expect(endingState.logPath).toBe(payload.logPath);
    expect(endingState.postmanCollectionPath).toBe(payload.postmanCollectionPath);
    expect(endingState.inspectUrl).toBe(payload.inspectUrl);
  });

  it('Tunnel errors should be set from payload', () => {
    const payload: TunnelError = {
      statusCode: 422,
      errorMessage: '<h1>Too many connections<h1>',
    };
    const updateErrorAction: NgrokTunnelAction<NgrokTunnelPayloadTypes> = {
      type: NgrokTunnelActions.updateOnError,
      payload,
    };
    const startingState = { ...DEFAULT_STATE };
    const endingState = ngrokTunnel(startingState, updateErrorAction);

    expect(endingState.publicUrl).toBe(DEFAULT_STATE.publicUrl);
    expect(endingState.errors.statusCode).toBe(payload.statusCode);
    expect(endingState.errors.errorMessage).toBe(payload.errorMessage);
  });

  it('Tunnel status should be set from payload', () => {
    const payload: TunnelStatusAndTs = {
      status: TunnelStatus.Active,
      ts: '12/27/2019, 1:30:00 PM',
    };
    const nextPayload: TunnelStatusAndTs = {
      status: TunnelStatus.Error,
      ts: '12/27/2019, 1:33:00 PM',
    };
    const actions: NgrokTunnelAction<NgrokTunnelPayloadTypes>[] = [
      {
        type: NgrokTunnelActions.setStatus,
        payload,
      },
      {
        type: NgrokTunnelActions.setStatus,
        payload: nextPayload,
      },
    ];
    const startingState = { ...DEFAULT_STATE };
    const transientState = ngrokTunnel(startingState, actions[0]);
    expect(transientState.tunnelStatus).toBe(payload.status);

    const finalState = ngrokTunnel(startingState, actions[1]);
    expect(finalState.tunnelStatus).toBe(nextPayload.status);
  });
});
