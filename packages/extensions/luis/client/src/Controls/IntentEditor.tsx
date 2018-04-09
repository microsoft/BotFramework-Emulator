import * as React from 'react';
import { Component } from 'react';
import { Intent } from '../Models/Intent';

interface IntentEditorState {

}
  
interface IntentEditorProps {
    currentIntent: Intent;
}

class IntentEditor extends Component<IntentEditorProps, IntentEditorState> {

    constructor(props: any, context: any) {
        super(props, context);
        this.state = {};
      }

    render() {
        return (
            <div>
                <div>Reassign Intent</div>
            </div>
        );
    }
}

export default IntentEditor;
