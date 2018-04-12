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
}

interface IntentEditorProps {
  currentIntent: Intent;
  intentInfo?: IntentInfo[];
  intentReassigner: (newIntent: string) => Promise<void>;
}

class IntentEditor extends Component<IntentEditorProps, IntentEditorState> {

  static getDerivedStateFromProps(nextProps: IntentEditorProps, prevState: IntentEditorState) {
    return {
      currentIntent: nextProps.currentIntent.intent
    };
  }

  constructor(props: any, context: any) {
    super(props, context);
    this.state = {
      currentIntent: this.props.currentIntent.intent
    };
  }

  render() {
    if (!this.props.intentInfo) {
      return (<div />);
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
      currentIntent: newIntent
    });
    if (this.props.intentReassigner) {
      this.props.intentReassigner(newIntent);
    }
  }
}

export default IntentEditor;
