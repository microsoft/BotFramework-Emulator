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
  TunnelStatusAndTimestamp,
  TunnelCheckTimeInterval,
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
    lastPingedTimestamp: Date.now(),
    timeIntervalSinceLastPing: TunnelCheckTimeInterval.Now,
    ngrokNotificationIds: [],
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

  it('Last Ping time interval should be set from payload', () => {
    const action = {
      type: NgrokTunnelActions.setTimeIntervalSinceLastPing,
      payload: TunnelCheckTimeInterval.SecondInterval,
    };
    const startingState = { ...DEFAULT_STATE };
    const transientState = ngrokTunnel(startingState, action);
    expect(transientState.timeIntervalSinceLastPing).toBe(action.payload);
  });

  it('should add notifications with add notification and clear should remove all ngrok notifications', () => {
    const getNotificationAction = payload => ({
      type: NgrokTunnelActions.addNotification,
      payload,
    });
    const startingState = { ...DEFAULT_STATE };
    const notifications: string[] = ['notification-1', 'notification-2', 'notification-3', 'notification-4'];
    let transientState = ngrokTunnel(startingState, getNotificationAction(notifications[0]));
    transientState = ngrokTunnel(transientState, getNotificationAction(notifications[1]));
    transientState = ngrokTunnel(transientState, getNotificationAction(notifications[2]));
    transientState = ngrokTunnel(transientState, getNotificationAction(notifications[3]));
    expect(transientState.ngrokNotificationIds).toEqual(notifications);
    transientState = ngrokTunnel(transientState, {
      type: NgrokTunnelActions.clearAllNotifications,
      payload: null,
    });
    expect(transientState.ngrokNotificationIds.length).toBe(0);
    transientState = ngrokTunnel(transientState, getNotificationAction(notifications[3]));
    expect(transientState.ngrokNotificationIds.length).toBe(1);
    const finalState = ngrokTunnel(transientState, {
      type: NgrokTunnelActions.clearAllNotifications,
      payload: null,
    });
    expect(finalState.ngrokNotificationIds.length).toBe(0);
  });

  it('Tunnel status should be set from payload', () => {
    const payload: TunnelStatusAndTimestamp = {
      status: TunnelStatus.Active,
      timestamp: Date.now(),
    };
    const nextPayload: TunnelStatusAndTimestamp = {
      status: TunnelStatus.Error,
      timestamp: Date.now(),
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
    let transientState = ngrokTunnel(startingState, actions[0]);
    expect(transientState.tunnelStatus).toBe(payload.status);

    transientState = ngrokTunnel(transientState, actions[1]);
    expect(transientState.tunnelStatus).toBe(nextPayload.status);

    transientState = ngrokTunnel(transientState, {
      type: NgrokTunnelActions.updateOnError,
      payload: {
        statusCode: 422,
        errorMessage: 'Tunnel has too many connections',
      },
    });
    expect(transientState.errors.statusCode).toBe(422);
    transientState = ngrokTunnel(transientState, actions[0]);
    expect(transientState.tunnelStatus).toEqual(TunnelStatus.Active);
    expect(transientState.errors).toEqual({});
  });
});
