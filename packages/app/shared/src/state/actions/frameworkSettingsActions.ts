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

import { FrameworkSettings } from '../../types';

export enum FrameworkActionType {
  SET_FRAMEWORK = 'SET_FRAMEWORK',
  PUSH_CLIENT_AWARE_SETTINGS = 'PUSH_CLIENT_AWARE_SETTINGS',
  SAVE_FRAMEWORK_SETTINGS = 'SAVE_FRAMEWORK_SETTINGS',
}

export interface FrameworkAction<P> extends Action {
  type: FrameworkActionType;
  payload: P;
}

export function setFrameworkSettings(frameworkSettings: FrameworkSettings): FrameworkAction<FrameworkSettings> {
  return {
    type: FrameworkActionType.SET_FRAMEWORK,
    payload: frameworkSettings,
  };
}

export function pushClientAwareSettings(): FrameworkAction<undefined> {
  return {
    type: FrameworkActionType.PUSH_CLIENT_AWARE_SETTINGS,
    payload: undefined,
  };
}

export function saveFrameworkSettings(payload: FrameworkSettings): FrameworkAction<FrameworkSettings> {
  return {
    type: FrameworkActionType.SAVE_FRAMEWORK_SETTINGS,
    payload,
  };
}
