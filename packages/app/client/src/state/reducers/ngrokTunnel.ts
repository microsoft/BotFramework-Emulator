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
  NgrokTunnelActions,
  NgrokTunnelAction,
  NgrokTunnelPayloadTypes,
  TunnelError,
  TunnelStatus,
  TunnelStatusAndTimestamp,
  TunnelInfo,
  TunnelCheckTimeInterval,
} from '../actions/ngrokTunnelActions';

export interface NgrokTunnelState {
  errors: TunnelError;
  publicUrl: string;
  inspectUrl: string;
  logPath: string;
  postmanCollectionPath: string;
  tunnelStatus: TunnelStatus;
  lastPingedTimestamp: number;
  timeIntervalSinceLastPing: TunnelCheckTimeInterval;
  ngrokNotificationIds: string[];
}

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

export const ngrokTunnel = (
  state: NgrokTunnelState = DEFAULT_STATE,
  action: NgrokTunnelAction<NgrokTunnelPayloadTypes>
): NgrokTunnelState => {
  switch (action.type) {
    case NgrokTunnelActions.setDetails: {
      const payload: TunnelInfo = action.payload as TunnelInfo;
      state = {
        ...state,
        ...payload,
      };
      break;
    }

    case NgrokTunnelActions.updateOnError:
      state = {
        ...state,
        errors: action.payload as TunnelError,
      };
      break;

    case NgrokTunnelActions.setStatus:
      state = {
        ...state,
        tunnelStatus: (action.payload as TunnelStatusAndTimestamp).status,
        lastPingedTimestamp: (action.payload as TunnelStatusAndTimestamp).timestamp,
      };
      if (state.tunnelStatus !== TunnelStatus.Error && state.errors) {
        state.errors = {} as TunnelError;
      }
      break;

    case NgrokTunnelActions.setTimeIntervalSinceLastPing:
      state = {
        ...state,
        timeIntervalSinceLastPing: action.payload as TunnelCheckTimeInterval,
      };
      break;

    case NgrokTunnelActions.clearAllNotifications:
      state = {
        ...state,
        ngrokNotificationIds: [],
      };
      break;

    case NgrokTunnelActions.addNotification:
      state = {
        ...state,
        ngrokNotificationIds: [...state.ngrokNotificationIds, action.payload as string],
      };
      break;
  }
  return state;
};
