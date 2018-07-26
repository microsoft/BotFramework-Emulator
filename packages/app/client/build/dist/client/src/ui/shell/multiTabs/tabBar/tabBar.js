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
import * as styles from './tabBar.scss';
import { connect } from 'react-redux';
import * as EditorActions from '../../../../data/action/editorActions';
import * as Constants from '../../../../constants';
import { getOtherTabGroup } from '../../../../data/editorHelpers';
import * as PresentationActions from '../../../../data/action/presentationActions';
class TabBarComponent extends React.Component {
    constructor(props) {
        super(props);
        this.onPresentationModeClick = () => this.props.enablePresentationMode();
        this.onSplitClick = () => {
            const owningEditor = this.props.editors[this.props.owningEditor];
            const docIdToSplit = owningEditor.activeDocumentId;
            const docToSplit = owningEditor.documents[docIdToSplit];
            const destEditorKey = getOtherTabGroup(this.props.owningEditor);
            this.props.splitTab(docToSplit.contentType, docToSplit.documentId, this.props.owningEditor, destEditorKey);
        };
        this.onDragEnter = (e) => {
            e.preventDefault();
        };
        this.onDragOver = (e) => {
            this.setState(({ draggedOver: true }));
            e.preventDefault();
            e.stopPropagation();
        };
        this.onDragLeave = (_e) => {
            this.setState(({ draggedOver: false }));
        };
        this.onDrop = (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.setState(({ draggedOver: false }));
            try {
                const tabData = JSON.parse(e.dataTransfer.getData('application/json'));
                const tabId = tabData.tabId;
                this.props.appendTab(tabData.editorKey, this.props.owningEditor, tabId);
            }
            catch (_a) {
                // Do nothing
            }
        };
        this.saveScrollable = (ref) => {
            this._scrollable = ref;
        };
        this.state = {
            draggedOver: false
        };
    }
    componentDidUpdate(prevProps) {
        let scrollable = this._scrollable;
        if (scrollable) {
            if (this.props.children.length > prevProps.children.length &&
                scrollable.scrollWidth > scrollable.clientWidth) {
                let leftOffset = 0;
                for (let i = 0; i <= this.props.activeIndex; i++) {
                    let ref = this.props.childRefs[i];
                    leftOffset += ref ? this.props.childRefs[i].offsetWidth : 0;
                }
                if (leftOffset >= scrollable.clientWidth) {
                    scrollable.scrollLeft = leftOffset;
                }
            }
        }
    }
    render() {
        const tabBarClassName = this.state.draggedOver ? styles.draggedOver : '';
        return (React.createElement("div", { className: `${styles.tabBar} ${tabBarClassName}`, onDragEnter: this.onDragEnter, onDragOver: this.onDragOver, onDragLeave: this.onDragLeave, onDrop: this.onDrop },
            React.createElement("ul", { ref: this.saveScrollable }, React.Children.map(this.props.children, (child, index) => React.createElement("li", { key: index }, child))),
            React.createElement("div", { className: styles.tabBarWidgets }, this.widgets)));
    }
    get widgets() {
        const activeDoc = this.props.documents[this.props.activeDocumentId];
        const presentationEnabled = activeDoc
            && (activeDoc.contentType === Constants.CONTENT_TYPE_TRANSCRIPT ||
                activeDoc.contentType === Constants.CONTENT_TYPE_LIVE_CHAT);
        const splitEnabled = Object.keys(this.props.documents).length > 1;
        let widgets = [];
        if (presentationEnabled) {
            widgets.push(React.createElement("span", { key: 0, className: `${styles.widget} ${styles.presentationWidget}`, title: "Presentation Mode", onClick: () => this.onPresentationModeClick() }));
        }
        else if (splitEnabled) {
            widgets.push(React.createElement("span", { key: 0, className: `${styles.widget} ${styles.splitWidget}`, title: "Split Editor", onClick: this.onSplitClick }));
        }
        return widgets;
    }
}
const mapStateToProps = (state, ownProps) => ({
    activeDocumentId: state.editor.editors[ownProps.owningEditor].activeDocumentId,
    activeEditor: state.editor.activeEditor,
    editors: state.editor.editors,
    documents: state.editor.editors[ownProps.owningEditor].documents
});
const mapDispatchToProps = (dispatch) => ({
    splitTab: (contentType, documentId, srcEditorKey, destEditorKey) => dispatch(EditorActions.splitTab(contentType, documentId, srcEditorKey, destEditorKey)),
    appendTab: (srcEditorKey, destEditorKey, tabId) => dispatch(EditorActions.appendTab(srcEditorKey, destEditorKey, tabId)),
    enablePresentationMode: () => dispatch(PresentationActions.enable())
});
export const TabBar = connect(mapStateToProps, mapDispatchToProps)(TabBarComponent);
//# sourceMappingURL=tabBar.js.map