//
// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license.
//
// Microsoft Bot Framework: http://botframework.com
//
// Bot Framework Emulator Github:
// https://github.com/Microsoft/BotFramwork-Emulator
//
// Copyright (c) Microsoft Corporation
// All rights reserved.
//
// MIT License:
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//

import * as React from 'react';
import { connect } from 'react-redux';

import * as Constants from '../../../constants';
import * as EditorActions from '../../../data/action/editorActions';
import Tab from './tab';
import { getTabGroupForDocument } from '../../../data/editorHelpers';
import { IRootState } from '../../../data/store';

interface GenericTabProps {
  active?: boolean;
  dirty?: boolean;
  documentId?: string;
  title?: string;
  closeTab?: () => void;
}

class GenericTab extends React.Component<GenericTabProps> {
  constructor(props: GenericTabProps) {
    super(props);
  }

  private onCloseClick = (e) => {
    e.stopPropagation();
    this.props.closeTab();
  }

  render() {
    return (
      <Tab active={ this.props.active } title={ this.props.title } onCloseClick={ this.onCloseClick }
        documentId={ this.props.documentId } dirty={ this.props.dirty } />
    );
  }
}

const mapStateToProps = (state: IRootState, ownProps: GenericTabProps): GenericTabProps => ({
  active: state.editor.editors[state.editor.activeEditor].activeDocumentId === ownProps.documentId
});

const mapDispatchToProps = (dispatch, ownProps: GenericTabProps): GenericTabProps => ({
  closeTab: () => dispatch(EditorActions.close(getTabGroupForDocument(ownProps.documentId), ownProps.documentId))
});

export default connect(mapStateToProps, mapDispatchToProps)(GenericTab);
