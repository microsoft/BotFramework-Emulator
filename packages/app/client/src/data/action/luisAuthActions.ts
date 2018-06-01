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

export const LUIS_LAUNCH_MODELS_VIEWER = 'LUIS_LAUNCH_MODELS_VIEWER';
export const LUIS_AUTHORING_DATA_CHANGED = 'LUIS_AUTHORING_DATA_CHANGED';
export const LUIS_AUTH_STATUS_CHANGED = 'LUIS_AUTH_STATUS_CHANGED';

export interface LuisAuthAction<T> extends Action {
  payload: T;
}

export interface LuisAuthData {
  luisAuthData: { key: string, BaseUrl: string };
}

export interface LuisAuthWorkflowStatus {
  luisAuthWorkflowStatus: 'inProgress' | 'ended' | 'notStarted' | 'canceled';
}

/*export interface LuisModelViewer {
  luisModelViewer: ComponentClass<any>;
}

export function launchLuisModelsViewer(luisModelViewer: ComponentClass<any>): LuisAuthAction<LuisModelViewer> {
  return {
    type: LUIS_LAUNCH_MODELS_VIEWER,
    payload: { luisModelViewer }
  };
}*/

export function luisAuthoringDataChanged(luisAuthData: { key: string, BaseUrl: string }): LuisAuthAction<LuisAuthData> {
  return {
    type: LUIS_AUTHORING_DATA_CHANGED,
    payload: { luisAuthData }
  };
}

export function luisAuthStatusChanged(luisAuthWorkflowStatus: 'inProgress' | 'ended' | 'notStarted' | 'canceled')
  : LuisAuthAction<LuisAuthWorkflowStatus> {
  return {
    type: LUIS_AUTH_STATUS_CHANGED,
    payload: { luisAuthWorkflowStatus }
  };
}
