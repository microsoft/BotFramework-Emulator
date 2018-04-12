import * as React from 'react';
import { Component } from 'react';
import { Intent } from '../Models/Intent';
import { IntentInfo } from '../Luis/IntentInfo';
import { css } from 'glamor';

const INTENT_VIEWER_CSS = css({
  color: 'white',
  fontFamily: 'Segoe UI, sans-serif',
  fontSize: '12px',
  userSelect: 'text',
  paddingTop: '16px',

  '& #selectorContainer': {
    paddingLeft: '16px'
  },

  '& #selector': {
    width: '190px'
  }
});

interface IntentEditorState {
  currentIntent: string;
  intentChanged: boolean;
}

interface IntentEditorProps {
  currentIntent: Intent;
  intentInfo?: IntentInfo[];
  intentReassigner: (newIntent: string) => Promise<void>;
  enabled: boolean;
}

class IntentEditor extends Component<IntentEditorProps, IntentEditorState> {

  static getDerivedStateFromProps(nextProps: IntentEditorProps, prevState: IntentEditorState) {
    if (prevState.intentChanged) {
      return {};
    }
    return {
      currentIntent: nextProps.currentIntent.intent
    };
  }

  constructor(props: any, context: any) {
    super(props, context);
    this.state = {
      currentIntent: this.props.currentIntent.intent,
      intentChanged: false
    };
  }

  render() {
    if (!this.props.intentInfo || !this.props.enabled) {
      return (<div id="no-intent-editor" style={{display: 'none'}} />);
    }
    let options = this.props.intentInfo.map(i => {
      return <option key={i.id} value={i.name} label={i.name}>{i.name}</option>;
    });
    return (
      <div {...INTENT_VIEWER_CSS}>
        <form>
          <label>Reassign Intent</label>
          <span id="selectorContainer" >
            <select id="selector" value={this.state.currentIntent} onChange={this.handleChange}>
              {options}
            </select>
          </span>
        </form>
      </div>
    );
  }

  private handleChange = (event: React.FormEvent<HTMLSelectElement>) => {
    let newIntent: string = event.currentTarget.value;
    this.setState({
      currentIntent: newIntent,
      intentChanged: true
    });
    if (this.props.intentReassigner) {
      this.props.intentReassigner(newIntent);
    }
  }
}

export default IntentEditor;
