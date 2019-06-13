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

// TODO: Revert import to `@bfemulator/sdk-shared` once issue #1333 (https://github.com/Microsoft/BotFramework-Emulator/issues/1333) is resolved.
import { Activity } from 'botframework-schema';
import { LuisAuthoringModels } from 'luis-apis';

import { AppState, PersistentAppState } from '../App';
import { ButtonSelected } from '../Controls/ControlBar/ControlBar';
import { AppInfo } from '../Luis/AppInfo';
import { LuisTraceInfo } from '../Models/LuisTraceInfo';

import { RecognizerResultAdapter } from './RecognizerResultAdapter';

const LuisTraceType = 'https://www.luis.ai/schemas/trace';

export default class AppStateAdapter implements AppState {
  public authoringKey: string;
  public persistentState: { [key: string]: PersistentAppState };
  public appInfo: AppInfo;
  public intentInfo: LuisAuthoringModels.IntentClassifier[];
  public traceInfo: LuisTraceInfo;
  public controlBarButtonSelected: ButtonSelected;
  public id: string;

  private static validate(obj: any): boolean {
    if (!obj) {
      return false;
    }
    const trace = obj as Activity;
    if (trace.type !== 'trace' || trace.valueType !== LuisTraceType) {
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
    const traceActivity = obj as Activity;
    this.traceInfo = traceActivity.value as LuisTraceInfo;
    this.controlBarButtonSelected = this.traceInfo.recognizerResult
      ? ButtonSelected.RecognizerResult
      : ButtonSelected.RawResponse;
    if (!this.traceInfo.recognizerResult) {
      // Polyfill the Recognizer Result object
      this.traceInfo.recognizerResult = new RecognizerResultAdapter(this.traceInfo.luisResult);
    }
    this.id = traceActivity.id || '';
  }
}
