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
import { Action } from 'redux';

export enum NgrokTunnelActions {
  setDetails = 'NgrokTunnel/SET_DETAILS',
  updateOnError = 'NgrokTunnel/TUNNEL_ERROR',
  setStatus = 'NgrokTunnel/SET_STATUS',
  checkOnTunnel = 'NgrokTunnel/CHECK_ON_TUNNEL',
  setTimeIntervalSinceLastPing = 'NgrokTunnel/TIME_INTERVAL_SINCE_LAST_PING',
  clearAllNotifications = 'NgrokTunnel/CLEAR_NOTIFICATIONS',
  addNotification = 'NgrokTunnel/ADD_NOTIFICATION',
}

export enum TunnelCheckTimeInterval {
  // 0 - 20 seconds
  Now,
  // 20 - 40 seconds
  FirstInterval,
  // 40 - 60 seconds
  SecondInterval,
}

export enum TunnelStatus {
  Active,
  Inactive,
  Error,
}

export interface TunnelInfo {
  publicUrl: string;
  inspectUrl: string;
  logPath: string;
  postmanCollectionPath: string;
}

export interface TunnelError {
  statusCode: number;
  errorMessage: string;
}

export interface TunnelStatusAndTimestamp {
  status: TunnelStatus;
  timestamp: number;
}

export interface StatusCheckOnTunnel {
  onTunnelPingSuccess: Function;
  onTunnelPingError: Function;
}

export interface NgrokTunnelAction<T> extends Action {
  type: NgrokTunnelActions;
  payload: T;
}

export type NgrokTunnelPayloadTypes =
  | TunnelError
  | TunnelInfo
  | TunnelStatusAndTimestamp
  | StatusCheckOnTunnel
  | TunnelCheckTimeInterval
  | string;

export function updateNewTunnelInfo(payload: TunnelInfo): NgrokTunnelAction<TunnelInfo> {
  return {
    type: NgrokTunnelActions.setDetails,
    payload,
  };
}

export function updateTunnelStatus(payload: {
  tunnelStatus: TunnelStatus;
}): NgrokTunnelAction<TunnelStatusAndTimestamp> {
  return {
    type: NgrokTunnelActions.setStatus,
    payload: {
      status: payload.tunnelStatus,
      timestamp: new Date().getTime(),
    },
  };
}

export function updateTunnelError(payload: TunnelError): NgrokTunnelAction<TunnelError> {
  return {
    type: NgrokTunnelActions.updateOnError,
    payload,
  };
}

export function checkOnTunnel(payload: StatusCheckOnTunnel): NgrokTunnelAction<StatusCheckOnTunnel> {
  return {
    type: NgrokTunnelActions.checkOnTunnel,
    payload,
  };
}

export function setTimeIntervalSinceLastPing(
  payload: TunnelCheckTimeInterval
): NgrokTunnelAction<TunnelCheckTimeInterval> {
  return {
    type: NgrokTunnelActions.setTimeIntervalSinceLastPing,
    payload,
  };
}

export function clearAllNotifications(): NgrokTunnelAction<void> {
  return {
    type: NgrokTunnelActions.clearAllNotifications,
    payload: null,
  };
}

export function addNotification(payload: string): NgrokTunnelAction<string> {
  return {
    type: NgrokTunnelActions.addNotification,
    payload,
  };
}
