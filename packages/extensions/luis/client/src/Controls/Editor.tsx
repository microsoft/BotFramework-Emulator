import * as React from 'react';
import { Component } from 'react';
import { css } from 'glamor';
import IntentViewer from './IntentViewer';
import IntentEditor from './IntentEditor';
import { Intent } from '../Models/Intent';
import { RecognizerResult } from '../Models/RecognizerResults';

const NoneIntent: string = 'None';

interface EditorState {

}
  
interface EditorProps {
    recognizerResult: RecognizerResult;
}

const EDITOR_CSS = css({
    color: 'white',
    overflowY: 'auto',
    height: '100%'
});

class Editor extends Component<EditorProps, EditorState> {

    constructor(props: any, context: any) {
        super(props, context);
        this.getTopScoringIntent = this.getTopScoringIntent.bind(this);
      }

    getTopScoringIntent(): Intent {
        if (!this.props.recognizerResult || !this.props.recognizerResult.Intents) {
            return { intent: NoneIntent, score: 0.0 };
        }
        let intents = this.props.recognizerResult.Intents;
        let topIntent = Object.keys(intents).reduce((a, b, i, arr) => {
            return intents[a] > intents[b] ? a : b;
        });
        return { intent: topIntent, score: intents[topIntent]};
    }

    render() {
        return (
            <div {...EDITOR_CSS}>
                <IntentViewer topScoringIntent={this.getTopScoringIntent()}/>
                <IntentEditor currentIntent={this.getTopScoringIntent()}/>
            </div>
        );
    }
}

export default Editor;
