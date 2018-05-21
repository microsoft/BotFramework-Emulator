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

import { TAB_CSS } from './tabStyle';
import * as EditorActions from './../../../data/action/editorActions';
import { getTabGroupForDocument } from '../../../data/editorHelpers';
import { TruncateText } from '@bfemulator/ui-react';

interface TabProps {
  active?: boolean;
  dirty?: boolean;
  documentId?: string;
  title?: string;
  toggleDraggingTab?: (toggle: boolean) => any;
  onCloseClick?: (evt) => any;
  swapTabs?: (editorKey: string, owningEditor: string, tabId: string) => any;
}

interface TabState {
  draggedOver: boolean;
  owningEditor: string;
}

class TabComponent extends React.Component<TabProps, TabState> {
  constructor(props: TabProps) {
    super(props);

    this.state = {
      draggedOver: false,
      owningEditor: getTabGroupForDocument(props.documentId)
    };
  }

  private onDragStart = (e) => {
    const dragData = {
      tabId: this.props.documentId,
      editorKey: this.state.owningEditor
    };
    e.dataTransfer.setData('application/json', JSON.stringify(dragData));
    this.props.toggleDraggingTab(true);
  }

  private onDragEnd = (e) => {
    this.props.toggleDraggingTab(false);
  }

  private onDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    this.setState(({ draggedOver: true }));
  }

  private onDragEnter = (e) => {
    e.preventDefault();
  }

  private onDragLeave = (e) => {
    this.setState(({ draggedOver: false }));
  }

  private onDrop = (e) => {
    const tabData = JSON.parse(e.dataTransfer.getData('application/json'));

    // only swap the tabs if they are different
    if (tabData.tabId !== this.props.documentId) {
      this.props.swapTabs(tabData.editorKey, this.state.owningEditor, tabData.tabId);
    }

    this.setState(({ draggedOver: false }));
    e.preventDefault();
    e.stopPropagation();
  }

  render() {
    let tabClassName = '';
    if (this.props.active) {
      tabClassName += ' active-editor-tab';
    } else if (this.state.draggedOver) {
      tabClassName += ' dragged-over-editor-tab';
    }

    return (
      <div className={ TAB_CSS + tabClassName } draggable
           onDragOver={ this.onDragOver } onDragEnter={ this.onDragEnter } onDragStart={ this.onDragStart }
           onDrop={ this.onDrop } onDragLeave={ this.onDragLeave } onDragEnd={ this.onDragEnd }>
        <span className="editor-tab-icon"></span>
        <TruncateText className="truncated-tab-text">{ this.props.title }</TruncateText>
        { this.props.dirty ? <span>*</span> : null }
        <span className="editor-tab-close" onClick={ this.props.onCloseClick }></span>
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch, ownProps: TabProps): TabProps => ({
  toggleDraggingTab: (toggle: boolean) => dispatch(EditorActions.toggleDraggingTab(toggle)),
  swapTabs: (editorKey: string, owningEditor: string, tabId: string) => dispatch(EditorActions.swapTabs(editorKey, owningEditor, tabId, ownProps.documentId))
});

export const Tab = connect(null, mapDispatchToProps)(TabComponent);
