import * as React from 'react';
import { Component } from 'react';
import { Intent } from '../Models/Intent';
import { css } from 'glamor';

const INTENT_VIEWER_CSS = css({
  color: 'white',
  fontFamily: 'Segoe UI, sans-serif',
  fontSize: '12px',
  userSelect: 'text',

  '& #topScoreIntentLabel': {
    fontWeight: 'bold',
    paddingBottom: '5px'
  }
});

interface IntentViewerState {

}

interface IntentViewerProps {
  topScoringIntent: Intent;
}

class IntentViewer extends Component<IntentViewerProps, IntentViewerState> {

  constructor(props: any, context: any) {
    super(props, context);
    this.state = {};
  }

  render() {
    return (
      <div {...INTENT_VIEWER_CSS}>
        <div id="topScoreIntentLabel">Top-Scoring Intent</div>
        <div>{this.props.topScoringIntent.intent} ({this.props.topScoringIntent.score})</div>
      </div>
    );
  }
}

export default IntentViewer;
