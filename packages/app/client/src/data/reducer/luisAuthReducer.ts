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
  LUIS_AUTH_STATUS_CHANGED,
  LUIS_AUTHORING_DATA_CHANGED,
  LuisAuthAction,
  LuisAuthData,
  LuisAuthWorkflowStatus
} from '../action/luisAuthActions';

export interface LuisAuthState {
  /**
   * The current status of the luis auth frame
   */
  luisAuthWorkflowStatus: 'notStarted' | 'inProgress' | 'ended' | 'canceled';
  /**
   * The luis authoring key for
   * communicating with the LUIS api
   */
  luisAuthData: { key: string, BaseUrl: string };
}

const initialState: LuisAuthState = {
  luisAuthWorkflowStatus: 'notStarted',
  luisAuthData: null
};

export default function luisAuth(state: LuisAuthState = initialState,
                                 action: LuisAuthAction<LuisAuthData> | LuisAuthAction<LuisAuthWorkflowStatus>)
  : LuisAuthState {
  const { payload = {}, type } = action;
  const { luisAuthData: luisAuthoringKey } = payload as LuisAuthData;
  const { luisAuthWorkflowStatus } = payload as LuisAuthWorkflowStatus;

  switch (type) {
    /*case LUIS_LAUNCH_MODELS_VIEWER:
      return { ...state, luisAuthWorkflowStatus: 'notStarted' };*/

    case LUIS_AUTH_STATUS_CHANGED:
      return { ...state, luisAuthWorkflowStatus };

    case LUIS_AUTHORING_DATA_CHANGED:
      return { ...state, luisAuthData: luisAuthoringKey };

    default:
      return state;
  }
}
