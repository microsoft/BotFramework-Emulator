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

import { ReactComponentClass } from '../../types';

export const AZURE_ARM_TOKEN_DATA_CHANGED = 'AZURE_ARM_TOKEN_DATA_CHANGED';
export const AZURE_BEGIN_AUTH_WORKFLOW = 'AZURE_BEGIN_AUTH_WORKFLOW';
export const AZURE_INVALIDATE_ARM_TOKEN = 'AZURE_INVALIDATE_ARM_TOKEN';
export const AZURE_LOGGED_IN_USER_CHANGED = 'AZURE_LOGGED_IN_USER_CHANGED';
export const AZURE_PERSIST_LOGIN_CHANGED = 'AZURE_PERSIST_LOGIN_CHANGED';

export interface AzureAuthAction<T> extends Action {
  payload: T;
}

export interface ArmTokenData {
  access_token: string;
}

export interface AzureAuthWorkflow {
  promptDialog: ReactComponentClass<any>;
  promptDialogProps: { [propName: string]: any };
  loginSuccessDialog: ReactComponentClass<any>;
  loginFailedDialog: ReactComponentClass<any>;
  resolver?: Function;
}

export function beginAzureAuthWorkflow(
  promptDialog: ReactComponentClass<any>,
  promptDialogProps: { [propName: string]: any },
  loginSuccessDialog: ReactComponentClass<any>,
  loginFailedDialog: ReactComponentClass<any>,
  resolver?: Function
): AzureAuthAction<AzureAuthWorkflow> {
  return {
    type: AZURE_BEGIN_AUTH_WORKFLOW,
    payload: {
      promptDialog,
      promptDialogProps,
      loginSuccessDialog,
      loginFailedDialog,
      resolver,
    },
  };
}

export function azureArmTokenDataChanged(armToken: string): AzureAuthAction<ArmTokenData> {
  return {
    type: AZURE_ARM_TOKEN_DATA_CHANGED,
    // eslint-disable-next-line typescript/camelcase
    payload: { access_token: armToken },
  };
}

export function invalidateArmToken(): AzureAuthAction<void> {
  return {
    type: AZURE_INVALIDATE_ARM_TOKEN,
    payload: undefined,
  };
}

export function azurePersistLoginChanged(persistLogin: boolean): AzureAuthAction<boolean> {
  return {
    type: AZURE_PERSIST_LOGIN_CHANGED,
    payload: persistLogin,
  };
}

export function azureLoggedInUserChanged(signedInUser: string): AzureAuthAction<string> {
  return {
    type: AZURE_LOGGED_IN_USER_CHANGED,
    payload: signedInUser,
  };
}
