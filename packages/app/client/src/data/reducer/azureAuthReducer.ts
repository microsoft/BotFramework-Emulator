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
  AZURE_AUTH_STATUS_CHANGED,
  AZURE_ARM_TOKEN_DATA_CHANGED,
  AzureAuthAction,
  ArmTokenData,
  AzureAuthWorkflowStatus
} from '../action/azureAuthActions';

export interface AzureAuthState {
  azureAuthWorkflowStatus: 'notStarted' | 'inProgress' | 'ended' | 'canceled';
  armToken: string;
}

const initialState: AzureAuthState = {
  azureAuthWorkflowStatus: 'notStarted',
  armToken: null
};

export default function azureAuth(state: AzureAuthState = initialState,
                                  action: AzureAuthAction<ArmTokenData> | AzureAuthAction<AzureAuthWorkflowStatus>)
  : AzureAuthState {
  const { payload = {}, type } = action;
  const { armToken } = payload as ArmTokenData;
  const { azureAuthWorkflowStatus } = payload as AzureAuthWorkflowStatus;

  switch (type) {
    case AZURE_AUTH_STATUS_CHANGED:
      return { ...state, azureAuthWorkflowStatus };

    case AZURE_ARM_TOKEN_DATA_CHANGED:
      return { ...state, armToken };

    default:
      return state;
  }
}
