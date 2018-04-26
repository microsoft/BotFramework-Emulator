import * as React from 'react';
import { Component } from 'react';
import { Intent } from '../Models/Intent';
import { IntentInfo } from '../Luis/IntentInfo';
import { css } from 'glamor';
import { Colors } from '@bfemulator/ui-react';

const TraceIntentStatesKey: string = Symbol('PersistedTraceIntentStates').toString();

const INTENT_EDITOR_CSS = css({
  color: 'white',
  fontFamily: 'Segoe UI, sans-serif',
  fontSize: '12px',
  userSelect: 'text',
  paddingTop: '16px',

  '& #selectorContainer': {
    paddingLeft: '16px'
  },

  '& #selector': {
    width: '190px',
    fontFamily: 'Segoe UI, sans-serif',
    fontSize: '12px'
  }
});

const INTENT_EDITOR_HIDDEN_CSS = css({
  display: 'none'
});

const INTENT_EDITOR_DISABLED_CSS = css({
  paddingTop: '10px',
  color: Colors.APP_HYPERLINK_DETAIL_DARK
});

enum IntentEditorMode {
  Enabled,
  Disabled,
  Hidden
}

interface TraceIntentState {
  originalIntent: string;
  currentIntent?: string;
}

interface IntentEditorState {
  traceIntentStates: { [key: string]: TraceIntentState };
}

interface IntentEditorProps {
  currentIntent: Intent;
  intentInfo?: IntentInfo[];
  mode: IntentEditorMode;
  traceId: string;
  intentReassigner: (newIntent: string, needsRetrain: boolean) => Promise<void>;
}

class IntentEditor extends Component<IntentEditorProps, IntentEditorState> {

  static getDerivedStateFromProps(nextProps: IntentEditorProps, prevState: IntentEditorState) {
    let currentTraceIntentStates = prevState.traceIntentStates;
    if (nextProps.traceId in currentTraceIntentStates) {
      currentTraceIntentStates[nextProps.traceId].originalIntent = nextProps.currentIntent.intent;  
    } else {
      currentTraceIntentStates[nextProps.traceId] = {
        originalIntent: nextProps.currentIntent.intent,
        currentIntent: ''
      };
    }
    
    return {
      traceIntentStates: currentTraceIntentStates
    };
  }

  constructor(props: any, context: any) {
    super(props, context);
    let persisted = localStorage.getItem(TraceIntentStatesKey);
    let traceIntentStates: { [key: string]: TraceIntentState } = {};
    if (persisted !== null) {
      traceIntentStates = JSON.parse(persisted);
    }
    this.state = {
      traceIntentStates: traceIntentStates
    };
  }

  render() {
    if (!this.props.intentInfo || this.props.mode === IntentEditorMode.Hidden) {
      return (<div id="hidden" {...INTENT_EDITOR_HIDDEN_CSS} />);
    } else if (this.props.mode === IntentEditorMode.Disabled) {
      return (
        <div id="disabled" {...INTENT_EDITOR_DISABLED_CSS}>
          Please add your LUIS service to enable reassigning.
        </div>
      );
    }
    let options = this.props.intentInfo.map(i => {
      return <option key={i.id} value={i.name} label={i.name}>{i.name}</option>;
    });

    let currentIntent = this.state.traceIntentStates[this.props.traceId].currentIntent || 
                        this.state.traceIntentStates[this.props.traceId].originalIntent;
    return (
      <div {...INTENT_EDITOR_CSS}>
        <form>
          <label>Reassign Intent</label>
          <span id="selectorContainer" >
            <select id="selector" value={currentIntent} onChange={this.handleChange}>
              {options}
            </select>
          </span>
        </form>
      </div>
    );
  }

  private handleChange = (event: React.FormEvent<HTMLSelectElement>) => {
    let newIntent: string = event.currentTarget.value;
    let currentTraceIntentStates = this.state.traceIntentStates;
    let currentIntentState = currentTraceIntentStates[this.props.traceId];
    let needsRetrain: boolean;
    if (newIntent === currentIntentState.originalIntent) {
      currentIntentState.currentIntent = undefined;
      needsRetrain = false;
    } else {
      currentIntentState.currentIntent = newIntent;
      needsRetrain = true;
    }
    
    this.setAndPersistTraceIntentStates(currentTraceIntentStates);
    if (this.props.intentReassigner) {
      this.props.intentReassigner(newIntent, needsRetrain);
    }
  }

  private setAndPersistTraceIntentStates(states: { [key: string]: TraceIntentState }) {
    this.setState({
      traceIntentStates: states
    });
    localStorage.setItem(TraceIntentStatesKey, JSON.stringify(states));
  }
}

export { IntentEditor, IntentEditorMode };
