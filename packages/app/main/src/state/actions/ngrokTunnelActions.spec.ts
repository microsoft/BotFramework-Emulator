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
  updateNewTunnelInfo,
  updateTunnelError,
  updateTunnelStatus,
  NgrokTunnelActions,
  TunnelInfo,
  TunnelError,
  TunnelStatus,
  checkOnTunnel,
  setTimeIntervalSinceLastPing,
  TunnelCheckTimeInterval,
  clearAllNotifications,
  addNotification,
} from './ngrokTunnelActions';

describe('Ngrok Tunnel Actions', () => {
  it('should create an update tunnel info action', () => {
    const payload: TunnelInfo = {
      publicUrl: 'https://d1a2bf16.ngrok.io',
      inspectUrl: 'http://127.0.0.1:4041',
      logPath: 'ngrok.log',
      postmanCollectionPath: 'postman.json',
    };
    const action = updateNewTunnelInfo(payload);
    expect(action.type).toBe(NgrokTunnelActions.setDetails);
    expect(action.payload).toEqual(payload);
  });

  it('should create a update tunnel error action', () => {
    const payload: TunnelError = {
      statusCode: 402,
      errorMessage: 'Tunnel has expired',
    };
    const action = updateTunnelError(payload);
    expect(action.type).toBe(NgrokTunnelActions.updateOnError);
    expect(action.payload).toEqual(payload);
  });

  it('should create a tunnel status update action', () => {
    const mockDate = new Date(1466424490000);
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);
    const expectedStatus: TunnelStatus = TunnelStatus.Active;
    const action = updateTunnelStatus({
      tunnelStatus: expectedStatus,
    });
    expect(action.type).toBe(NgrokTunnelActions.setStatus);
    expect(action.payload.timestamp).toBe(new Date().getTime());
    expect(action.payload.status).toBe(expectedStatus);
  });

  it('should create a tunnel status update action on TunnelError', () => {
    const mockDate = new Date(1466424490000);
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);
    const expectedStatus: TunnelStatus = TunnelStatus.Error;
    const action = updateTunnelStatus({
      tunnelStatus: expectedStatus,
    });
    expect(action.type).toBe(NgrokTunnelActions.setStatus);
    expect(action.payload.timestamp).toBe(new Date().getTime());
    expect(action.payload.status).toBe(expectedStatus);
  });

  it('should create a checkOnTunnel action', () => {
    const action = checkOnTunnel({
      onTunnelPingError: jest.fn(),
      onTunnelPingSuccess: jest.fn(),
    });
    expect(action.type).toBe(NgrokTunnelActions.checkOnTunnel);
  });

  it('should create a setTimeIntervalSinceLastPing action', () => {
    const action = setTimeIntervalSinceLastPing(TunnelCheckTimeInterval.SecondInterval);
    expect(action.type).toBe(NgrokTunnelActions.setTimeIntervalSinceLastPing);
    expect(action.payload).toBe(TunnelCheckTimeInterval.SecondInterval);
  });

  it('should create a clear notifications action', () => {
    const action = clearAllNotifications();
    expect(action.type).toBe(NgrokTunnelActions.clearAllNotifications);
    expect(action.payload).toBeNull;
  });

  it('should create add notification action', () => {
    const notificationId = 'notification-1';
    const action = addNotification(notificationId);
    expect(action.type).toBe(NgrokTunnelActions.addNotification);
    expect(action.payload).toBe(notificationId);
  });
});
