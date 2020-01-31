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
  azureArmTokenDataChanged,
  AzureAuthAction,
  AzureAuthState,
  AzureAuthWorkflow,
  SharedConstants,
  AZURE_BEGIN_AUTH_WORKFLOW,
} from '@bfemulator/app-shared';
import { call, ForkEffect, put, select, takeEvery } from 'redux-saga/effects';
import { CommandServiceImpl, CommandServiceInstance } from '@bfemulator/sdk-shared';

import { DialogService } from '../../ui/dialogs';
import { RootState } from '../store';

const getArmTokenFromState = (state: RootState) => state.azureAuth;

export class AzureAuthSaga {
  @CommandServiceInstance()
  private static commandService: CommandServiceImpl;

  public static *getArmToken(action: AzureAuthAction<AzureAuthWorkflow>): IterableIterator<any> {
    const { resolver } = action.payload;

    try {
      let azureAuth: AzureAuthState = yield select(getArmTokenFromState);
      if (azureAuth.access_token) {
        return azureAuth;
      }
      const result = yield DialogService.showDialog(action.payload.promptDialog, action.payload.promptDialogProps);
      if (result !== 1) {
        // Result must be 1 which is a confirmation to sign in to Azure
        return result;
      }
      const { RetrieveArmToken, PersistAzureLoginChanged } = SharedConstants.Commands.Azure;
      const { TrackEvent } = SharedConstants.Commands.Telemetry;
      azureAuth = yield call([AzureAuthSaga.commandService, AzureAuthSaga.commandService.remoteCall], RetrieveArmToken);
      if (azureAuth && !('error' in azureAuth)) {
        const persistLogin = yield DialogService.showDialog(action.payload.loginSuccessDialog, azureAuth);
        yield call(
          AzureAuthSaga.commandService.remoteCall.bind(AzureAuthSaga.commandService),
          PersistAzureLoginChanged,
          persistLogin
        );
        AzureAuthSaga.commandService
          .remoteCall(TrackEvent, 'azure_signIn', { persistLogin: !!persistLogin, success: true })
          .catch(_e => void 0);
      } else {
        yield DialogService.showDialog(action.payload.loginFailedDialog);
        AzureAuthSaga.commandService.remoteCall(TrackEvent, 'azure_signIn', { success: false }).catch(_e => void 0);
      }
      yield put(azureArmTokenDataChanged(azureAuth.access_token));
      return azureAuth;
    } finally {
      resolver && resolver();
    }
  }
}

export function* azureAuthSagas(): IterableIterator<ForkEffect> {
  yield takeEvery(AZURE_BEGIN_AUTH_WORKFLOW, AzureAuthSaga.getArmToken);
}
