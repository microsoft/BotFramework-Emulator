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
import delay from '@redux-saga/delay-p';
import { takeLatest, select, put, call, all } from 'redux-saga/effects';
import { CommandServiceImpl, CommandServiceInstance } from '@bfemulator/sdk-shared';
import {
  NgrokTunnelActions,
  NgrokTunnelAction,
  SharedConstants,
  StatusCheckOnTunnel,
  TunnelCheckTimeInterval,
  setTimeIntervalSinceLastPing,
} from '@bfemulator/app-shared';

import { fetchWithTimeout } from '../../utils/fetchWithTimeout';
import { RootState } from '../store';

export const intervalForEachPing = 60000;
export const intervalForRefreshedStatus = 20000;
export const tunnelPingTimeout = 59000;

const getPublicUrl = (state: RootState): string => state.ngrokTunnel.publicUrl;

const getStaleNotificationIds = (state: RootState): string[] => state.ngrokTunnel.ngrokNotificationIds;

const pingTunnel = async (
  publicUrl: string
): Promise<{ text: string; status: number; cancelPingInterval: boolean }> => {
  let cancelPingInterval = false;
  try {
    //Make sure the request times out before the next ping which happens every minute. Cannot stop the heart beat as the tunnel might pick back up next minute
    const response: Response = await fetchWithTimeout(
      publicUrl,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
      tunnelPingTimeout
    );
    const isErrorResponse =
      response.status === 429 || response.status === 402 || response.status === 500 || !response.headers.get('Server');
    if (response.status === 402) {
      cancelPingInterval = true;
    }
    if (isErrorResponse) {
      return {
        text: await response.text(),
        status: response.status,
        cancelPingInterval,
      };
    }
    return undefined;
  } catch (ex) {
    return {
      text: 'Tunnel ping has surpassed the acceptable time limit. Looks like it does not exist anymore.',
      status: 404,
      cancelPingInterval,
    };
  }
};

export class NgrokSagas {
  @CommandServiceInstance()
  private static commandService: CommandServiceImpl;

  public static *runTunnelStatusHealthCheck(action: NgrokTunnelAction<StatusCheckOnTunnel>): IterableIterator<any> {
    try {
      const publicUrl: string = yield select(getPublicUrl);
      const errorOnResponse = yield pingTunnel(publicUrl);
      if (errorOnResponse) {
        action.payload.onTunnelPingError(errorOnResponse);
      } else {
        const { commandService } = NgrokSagas;
        const { Remove } = SharedConstants.Commands.Notifications;
        const ids: string[] = yield select(getStaleNotificationIds);
        if (ids.length > 0) {
          yield all(ids.map((id: string) => call([commandService, commandService.remoteCall], Remove, id)));
        }
        action.payload.onTunnelPingSuccess();
      }
      yield put(setTimeIntervalSinceLastPing(TunnelCheckTimeInterval.Now));
      yield delay(intervalForRefreshedStatus);
      yield put(setTimeIntervalSinceLastPing(TunnelCheckTimeInterval.FirstInterval));
      yield delay(intervalForRefreshedStatus);
      yield put(setTimeIntervalSinceLastPing(TunnelCheckTimeInterval.SecondInterval));
    } catch (ex) {
      action.payload.onTunnelPingError(ex);
    }
  }
}

export function* ngrokSagas(): IterableIterator<any> {
  yield takeLatest(NgrokTunnelActions.checkOnTunnel, NgrokSagas.runTunnelStatusHealthCheck);
}
