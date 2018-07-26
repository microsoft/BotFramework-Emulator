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
import * as styles from './tab.scss';
import * as EditorActions from '../../../../data/action/editorActions';
import { getTabGroupForDocument } from '../../../../data/editorHelpers';
import { TruncateText } from '../../../../../../../sdk/ui-react/built/index';
class TabComponent extends React.Component {
    constructor(props) {
        super(props);
        this.onCloseButtonKeyPress = (event) => {
            if (event.key === ' ' || event.keyCode === 13) {
                this.props.onCloseClick(event);
            }
        };
        this.onDragStart = (e) => {
            const dragData = {
                tabId: this.props.documentId,
                editorKey: this.state.owningEditor
            };
            e.dataTransfer.setData('application/json', JSON.stringify(dragData));
            this.props.toggleDraggingTab(true);
        };
        this.onDragEnd = () => {
            this.props.toggleDraggingTab(false);
        };
        this.onDragOver = (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.setState(({ draggedOver: true }));
        };
        this.onDragEnter = (e) => {
            e.preventDefault();
        };
        this.onDragLeave = () => {
            this.setState(({ draggedOver: false }));
        };
        this.onDrop = (e) => {
            const tabData = JSON.parse(e.dataTransfer.getData('application/json'));
            // only swap the tabs if they are different
            if (tabData.tabId !== this.props.documentId) {
                this.props.swapTabs(tabData.editorKey, this.state.owningEditor, tabData.tabId);
            }
            this.setState(({ draggedOver: false }));
            e.preventDefault();
            e.stopPropagation();
        };
        this.state = {
            draggedOver: false,
            owningEditor: getTabGroupForDocument(props.documentId)
        };
    }
    render() {
        const activeClassName = this.props.active ? styles.activeEditorTab : '';
        const draggedOverClassName = this.state.draggedOver ? styles.draggedOverEditorTab : '';
        return (React.createElement("div", { className: `${styles.tab} ${activeClassName} ${draggedOverClassName}`, draggable: true, onDragOver: this.onDragOver, onDragEnter: this.onDragEnter, onDragStart: this.onDragStart, onDrop: this.onDrop, onDragLeave: this.onDragLeave, onDragEnd: this.onDragEnd },
            React.createElement("span", { className: styles.editorTabIcon }, " "),
            React.createElement(TruncateText, { className: styles.truncatedTabText }, this.props.title),
            this.props.dirty ? React.createElement("span", null, "*") : null,
            React.createElement("a", { href: "javascript:void(0)", className: styles.editorTabClose, onKeyPress: this.onCloseButtonKeyPress, onClick: this.props.onCloseClick })));
    }
}
const mapDispatchToProps = (dispatch, ownProps) => ({
    toggleDraggingTab: (toggle) => dispatch(EditorActions.toggleDraggingTab(toggle)),
    swapTabs: (editorKey, owningEditor, tabId) => dispatch(EditorActions.swapTabs(editorKey, owningEditor, tabId, ownProps.documentId))
});
export const Tab = connect(null, mapDispatchToProps)(TabComponent);
//# sourceMappingURL=tab.js.map