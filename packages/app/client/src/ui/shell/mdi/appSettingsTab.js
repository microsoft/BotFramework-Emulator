import React from 'react';
import { connect } from 'react-redux';

import * as EditorActions from '../../../data/action/editorActions';
import GenericTab from './genericTab';
import { getTabGroupForDocument } from '../../../data/editorHelpers';

export class AppSettingsTab extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.onCloseClick = this.onCloseClick.bind(this);
  }

  onCloseClick(e) {
    e.stopPropagation();
    this.props.dispatch(EditorActions.close(getTabGroupForDocument(this.props.documentId), this.props.documentId));
  }

  render() {
    return(
      <GenericTab active={ this.props.active } title='App Settings' onCloseClick={ this.onCloseClick }
        documentId={ this.props.documentId } dirty={ this.props.dirty } />
    );
  }
}

export default connect((state, { documentId }) => ({
  active: state.editor.editors[state.editor.activeEditor].activeDocumentId === documentId
}))(AppSettingsTab);
