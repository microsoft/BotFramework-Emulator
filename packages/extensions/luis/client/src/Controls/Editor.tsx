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
