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
import * as EditorActions from '../../../data/action/editorActions';
import { EditorFactory } from '../../editor';
import { Content as TabbedDocumentContent, MultiTabs, Tab as TabbedDocumentTab, TabbedDocument } from '../multiTabs';
import { TabFactory } from './tabFactory';
class MDIComponent extends React.Component {
    constructor(props) {
        super(props);
        this.handleTabChange = (tabValue) => {
            this.props.setActiveTab(this.props.tabOrder[tabValue]);
        };
    }
    render() {
        const activeIndex = this.props.tabOrder.findIndex(documentId => documentId === this.props.activeDocumentId);
        return (React.createElement(MultiTabs, { onChange: this.handleTabChange, value: activeIndex ? activeIndex : 0, owningEditor: this.props.owningEditor }, this.props.tabOrder.map(documentId => React.createElement(TabbedDocument, { key: documentId },
            React.createElement(TabbedDocumentTab, null,
                React.createElement(TabFactory, { document: this.props.documents[documentId] })),
            React.createElement(TabbedDocumentContent, { documentId: documentId },
                React.createElement(EditorFactory, { document: this.props.documents[documentId] }))))));
    }
}
const mapStateToProps = (state, ownProps) => ({
    activeDocumentId: state.editor.editors[ownProps.owningEditor].activeDocumentId,
    documents: state.editor.editors[ownProps.owningEditor].documents,
    tabOrder: state.editor.editors[ownProps.owningEditor].tabOrder,
    activeEditor: state.editor.activeEditor
});
const mapDispatchToProps = (dispatch) => ({
    setActiveTab: (tab) => dispatch(EditorActions.setActiveTab(tab))
});
export const MDI = connect(mapStateToProps, mapDispatchToProps)(MDIComponent);
//# sourceMappingURL=mdi.js.map