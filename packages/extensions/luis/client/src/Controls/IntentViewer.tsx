import * as React from 'react';
import { Component } from 'react';
import { Intent } from '../Models/Intent';

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
      <div>
        <div>Top-Scoring Intent</div>
        <div>{this.props.topScoringIntent.intent} ({this.props.topScoringIntent.score})</div>
      </div>
    );
  }
}

export default IntentViewer;
