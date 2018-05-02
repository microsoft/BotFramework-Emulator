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

import { AppState, PersistentAppState } from '../App';
import { RecognizerResult } from '../Models/RecognizerResults';
import { LuisAppInfo } from '../Models/LuisAppInfo';
import { LuisTraceInfo } from '../Models/LuisTraceInfo';
import { AppInfo } from '../Luis/AppInfo';
import { IntentInfo } from '../Luis/IntentInfo';
import { ITraceActivity } from '@bfemulator/sdk-shared';
import { ButtonSelected } from '../Controls/ControlBar';
import { RecognizerResultAdapter } from '../Adapters/RecognizerResultAdapter';

const TraceActivity = 'trace';
const LuisTraceType = 'https://www.luis.ai/schemas/trace';

interface LuisModel {
  ModelID: string;
  SubscriptionKey: string;
}

export default class AppStateAdapter implements AppState {
  authoringKey: string;
  persistentState: { [key: string]: PersistentAppState; };
  appInfo: AppInfo;
  intentInfo: IntentInfo[];
  traceInfo: LuisTraceInfo;
  controlBarButtonSelected: ButtonSelected;
  id: string;

  private static validate(obj: any): boolean {
    if (!obj) {
      return false;
    }
    const trace = obj as ITraceActivity;
    if (trace.type !== TraceActivity || trace.valueType !== LuisTraceType) {
      return false;
    }
    if (!trace.value) {
      return false;
    }
    if (!AppStateAdapter.isALuisTraceInfo(trace.value)) {
      return false;
    }
    return true;
  }

  private static isALuisTraceInfo(obj: any): obj is LuisTraceInfo {
    return obj.luisOptions && obj.luisModel && obj.luisResult;
  }

  constructor(obj: any) {
    if (!AppStateAdapter.validate(obj)) {
      return;
    }
    let traceActivity = (obj as ITraceActivity);
    this.traceInfo = traceActivity.value as LuisTraceInfo;
    this.controlBarButtonSelected = this.traceInfo.recognizerResult ?
                                      ButtonSelected.RecognizerResult :
                                      ButtonSelected.RawResponse;
    if (!this.traceInfo.recognizerResult) {
      // Polyfill the Recognizer Result object
      this.traceInfo.recognizerResult = new RecognizerResultAdapter(this.traceInfo.luisResult);
    }
    this.id = traceActivity.id || '';
  }
}
