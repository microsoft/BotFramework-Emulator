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

import * as React from 'react';
import { Component } from 'react';
import { css } from 'glamor';
import IntentViewer from './IntentViewer';
import { IntentEditor, IntentEditorMode } from './IntentEditor';
import { Intent } from '../Models/Intent';
import { RecognizerResult, RecognizerResultIntent } from '../Models/RecognizerResults';
import { IntentInfo } from '../Luis/IntentInfo';
import EntitiesViewer from './EntitiesViewer';
import { AppInfo } from '../Luis/AppInfo';

const NoneIntent: string = 'None';

interface EditorState {

}

interface EditorProps {
  recognizerResult: RecognizerResult;
  intentInfo?: IntentInfo[];
  intentReassigner: (newIntent: string, needsRetrain: boolean) => Promise<void>;
  appInfo: AppInfo;
  traceId: string;
}

const EDITOR_CSS = css({
  color: 'white',
  overflowY: 'auto',
  height: '100%',
  padding: '8px 16px'
});

class Editor extends Component<EditorProps, EditorState> {

  constructor(props: any, context: any) {
    super(props, context);
  }

  getTopScoringIntent(): Intent {
    if (!this.props.recognizerResult || !this.props.recognizerResult.intents) {
      return { intent: NoneIntent, score: 0.0 };
    }
    let intents: {[key: string]: RecognizerResultIntent } = this.props.recognizerResult.intents;
    let topIntent = Object.keys(intents).reduce((a, b, i, arr) => {
      return intents[a].score > intents[b].score ? a : b;
    });
    return { intent: topIntent, score: intents[topIntent].score };
  }

  render() {
    let topScoringIntent = this.getTopScoringIntent();
    let mode: IntentEditorMode;
    if (this.props.appInfo.authorized) {
      mode = IntentEditorMode.Enabled;
    } else if (this.props.appInfo.isDispatchApp) {
      mode = IntentEditorMode.Hidden;
    } else {
      mode = IntentEditorMode.Disabled;
    }
    return (
      <div {...EDITOR_CSS}>
        <IntentViewer topScoringIntent={topScoringIntent} />
        <IntentEditor
          currentIntent={topScoringIntent}
          intentInfo={this.props.intentInfo}
          intentReassigner={this.props.intentReassigner}
          mode={mode}
          traceId={this.props.traceId}
        />
        <EntitiesViewer entities={this.props.recognizerResult.entities} />
      </div>
    );
  }
}

export default Editor;
