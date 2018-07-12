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

export const AZURE_ARM_TOKEN_DATA_CHANGED = 'AZURE_ARM_TOKEN_DATA_CHANGED';
export const AZURE_AUTH_STATUS_CHANGED = 'AZURE_AUTH_STATUS_CHANGED';
export const AZURE_BEGIN_AUTH_WORKFLOW = 'AZURE_BEGIN_AUTH_WORKFLOW';

export interface AzureAuthAction<T> extends Action {
  payload: T;
}

export interface ArmTokenData {
  armToken: string;
}

export interface AzureAuthWorkflowStatus {
  azureAuthWorkflowStatus: 'inProgress' | 'ended' | 'notStarted' | 'canceled';
}

export function beginAzureAuthWorkflow(): AzureAuthAction<any> {
  return {
    type: AZURE_BEGIN_AUTH_WORKFLOW,
    payload: {}
  };
}

export function azureArmTokenDataChanged(armToken: string): AzureAuthAction<ArmTokenData> {
  return {
    type: AZURE_ARM_TOKEN_DATA_CHANGED,
    payload: { armToken }
  };
}

export function azureAuthStatusChanged(azureAuthWorkflowStatus: 'inProgress' | 'ended' | 'notStarted' | 'canceled')
  : AzureAuthAction<AzureAuthWorkflowStatus> {
  return {
    type: AZURE_AUTH_STATUS_CHANGED,
    payload: { azureAuthWorkflowStatus }
  };
}
