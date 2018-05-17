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
import { css } from 'glamor';

import * as EditorActions from '../../../../data/action/editorActions';
import { Colors, InsetShadow } from '@bfemulator/ui-react';
import ContentOverlay from './contentOverlay';
import LeftContentOverlay from './leftContentOverlay';
import RightContentOverlay from './rightContentOverlay';
import * as Constants from '../../../../constants';
import { getTabGroupForDocument, tabGroupHasDocuments } from '../../../../data/editorHelpers';
import { IEditor } from '../../../../data/reducer/editor';
import { IRootState } from '../../../../data/store';

const CSS = css({
  position: 'relative',
  height: '100%',
  width: '100%',
  overflow: 'auto'
});

interface TabbedDocumentContentWrapperProps {
  documentId?: string;
  activeEditor?: string;
  primaryEditor?: IEditor;
  secondaryEditor?: IEditor;
  setActiveEditor?: (editor: string) => any;
}

interface TabbedDocumentContentWrapperState {
  owningEditor: string;
}

class TabbedDocumentContentWrapper extends React.Component<TabbedDocumentContentWrapperProps, TabbedDocumentContentWrapperState> {
  constructor(props: TabbedDocumentContentWrapperProps) {
    super(props);

    this.state = {
      owningEditor: getTabGroupForDocument(props.documentId)
    };
  }

  componentWillReceiveProps(newProps) {
    const { documentId: newDocumentId } = newProps;
    if (this.props.documentId && this.props.documentId !== newDocumentId) {
      this.setState({ owningEditor: getTabGroupForDocument(newDocumentId) });
    }
  }

  private onClick = (e) => {
    if (this.state.owningEditor !== this.props.activeEditor) {
      this.props.setActiveEditor(this.state.owningEditor);
    }
  }

  render() {
    const onlyOneEditorActive = tabGroupHasDocuments(this.props.primaryEditor) && !tabGroupHasDocuments(this.props.secondaryEditor);
    const splittingEnabled = onlyOneEditorActive && this.props.primaryEditor.documents && Object.keys(this.props.primaryEditor.documents).length > 1;

    return (
      <div { ...CSS } onClickCapture={ this.onClick }>
        { this.props.children }
        <ContentOverlay documentId={ this.props.documentId } />
        {
          splittingEnabled ?
            <>
              <LeftContentOverlay />
              <RightContentOverlay />
            </>
          :
            null
        }
        <InsetShadow top={ true } />
      </div>
    );
  }
}

const mapStateToProps = (state: IRootState): TabbedDocumentContentWrapperProps => ({
  activeEditor: state.editor.activeEditor,
  primaryEditor: state.editor.editors[Constants.EditorKey_Primary],
  secondaryEditor: state.editor.editors[Constants.EditorKey_Secondary]
});

const mapDispatchToProps = (dispatch): TabbedDocumentContentWrapperProps => ({
  setActiveEditor: (editor: string) => dispatch(EditorActions.setActiveEditor(editor))
});

export default connect(mapStateToProps, mapDispatchToProps)(TabbedDocumentContentWrapper);
