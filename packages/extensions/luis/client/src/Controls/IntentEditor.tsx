import * as React from 'react';
import { Component } from 'react';
import { Intent } from '../Models/Intent';
import { IntentInfo } from '../Luis/IntentInfo';

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
      <div>
        <form>
          <label>Reassign Intent</label>
          <select value={this.state.currentIntent} onChange={this.handleChange}>
            {options}
          </select>
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
