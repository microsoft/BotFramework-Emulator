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

import { AppState, PersistentAppState } from './App';
import { QnAMakerTraceInfo, QueryResult } from './Models/QnAMakerTraceInfo';
import { Answer } from './Models/QnAMakerModels';
import { ITraceActivity } from '@bfemulator/sdk-shared';
import { IQnAService } from 'msbot/bin/schema' ;

const TraceActivity = 'trace';
const QnaMakerTracerType = 'https://www.qnamaker.ai/schemas/trace';

interface QnaMakerModel {
  ModelID: string;
  SubscriptionKey: string;
}

export default class AppStateAdapter implements AppState {
  id: string;
  qnaService: IQnAService | null;
  traceInfo: QnAMakerTraceInfo;
  persistentState: { [key: string]: PersistentAppState; };
  phrasings: string[];
  answers: Answer[];
  selectedAnswer: Answer | null;

  private static validate(obj: any): boolean {
    if (!obj) {
      return false;
    }
    const trace = obj as ITraceActivity;
    if (trace.type !== TraceActivity || trace.valueType !== QnaMakerTracerType) {
      return false;
    }
    if (!trace.value) {
      return false;
    }
    if (!AppStateAdapter.isAQnAMakerTraceInfo(trace.value)) {
      return false;
    }
    return true;
  }

  private static isAQnAMakerTraceInfo(obj: any): obj is QnAMakerTraceInfo {
    return obj.knowledgeBaseId !== undefined && obj.queryResults !== undefined;
  }

  constructor(obj: any) {
    if (!AppStateAdapter.validate(obj)) {
      return;
    }
    let traceActivity = (obj as ITraceActivity);
    this.traceInfo = traceActivity.value as QnAMakerTraceInfo;
    this.id = traceActivity.id || '';

    this.phrasings = [this.traceInfo.message.text || ''];

    this.answers = this.traceInfo.queryResults.map((result: QueryResult) => ({
      qnaId: result.qnaId,
      text: result.answer,
      score: result.score,
      filters: null
    }));
    this.selectedAnswer = this.answers.length > 0 ? this.answers[0] : null;
  }
}
