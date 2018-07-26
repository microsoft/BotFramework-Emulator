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
import { Component } from 'react';
import { connect } from 'react-redux';
import * as styles from './contentWrapper.scss';
import * as EditorActions from '../../../../../data/action/editorActions';
import { ContentOverlay, LeftContentOverlay, RightContentOverlay } from '../index';
import * as Constants from '../../../../../constants';
import { getTabGroupForDocument, tabGroupHasDocuments } from '../../../../../data/editorHelpers';
class TabbedDocumentContentWrapperComponent extends Component {
    constructor(props) {
        super(props);
        this.onClick = () => {
            if (this.state.owningEditor !== this.props.activeEditor) {
                this.props.setActiveEditor(this.state.owningEditor);
            }
        };
        this.state = {
            owningEditor: getTabGroupForDocument(props.documentId)
        };
    }
    render() {
        const onlyOneEditorActive = tabGroupHasDocuments(this.props.primaryEditor) &&
            !tabGroupHasDocuments(this.props.secondaryEditor);
        const splittingEnabled = onlyOneEditorActive &&
            this.props.primaryEditor.documents &&
            Object.keys(this.props.primaryEditor.documents).length > 1;
        return (React.createElement("div", { className: styles.contentWrapper, hidden: this.props.hidden, onClickCapture: this.onClick },
            this.props.children,
            React.createElement(ContentOverlay, { documentId: this.props.documentId }),
            splittingEnabled ?
                React.createElement(React.Fragment, null,
                    React.createElement(LeftContentOverlay, null),
                    React.createElement(RightContentOverlay, null))
                :
                    null));
    }
    componentWillReceiveProps(newProps) {
        const { documentId: newDocumentId } = newProps;
        if (this.props.documentId && this.props.documentId !== newDocumentId) {
            this.setState({ owningEditor: getTabGroupForDocument(newDocumentId) });
        }
    }
}
const mapStateToProps = (state) => ({
    activeEditor: state.editor.activeEditor,
    primaryEditor: state.editor.editors[Constants.EDITOR_KEY_PRIMARY],
    secondaryEditor: state.editor.editors[Constants.EDITOR_KEY_SECONDARY]
});
const mapDispatchToProps = (dispatch) => ({
    setActiveEditor: (editor) => dispatch(EditorActions.setActiveEditor(editor))
});
export const TabbedDocumentContentWrapper = connect(mapStateToProps, mapDispatchToProps)(TabbedDocumentContentWrapperComponent);
//# sourceMappingURL=contentWrapper.js.map