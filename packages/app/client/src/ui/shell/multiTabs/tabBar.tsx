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

import { css } from 'glamor';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { connect } from 'react-redux';

import { TabBarTab } from './tabBarTab';
import { Colors } from '@bfemulator/ui-react';
import * as EditorActions from '../../../data/action/editorActions';
import * as Constants from '../../../constants';
import { getOtherTabGroup } from '../../../data/editorHelpers';
import * as PresentationActions from '../../../data/action/presentationActions';
import { IEditor, IDocument } from '../../../data/reducer/editor';
import { IRootState } from '../../../data/store';

const CSS = css({
  display: 'flex',
  backgroundColor: Colors.EDITOR_TAB_BACKGROUND_DARK,
  minHeight: '32px',

  '&.dragged-over-tab-bar': {
    backgroundColor: Colors.EDITOR_TAB_DRAGGED_OVER_BACKGROUND_DARK
  },

  '& > ul': {
    display: 'flex',
    backgroundColor: Colors.EDITOR_TAB_BACKGROUND_DARK,
    listStyleType: 'none',
    margin: 0,
    padding: 0,
    overflowX: 'auto',

    '&::-webkit-scrollbar': {
      height: '2px'
    },

    '&::-webkit-scrollbar-thumb': {
      background: Colors.SCROLLBAR_THUMB_BACKGROUND_DARK
    },

    '&::-webkit-scrollbar-track': {
      background: Colors.SCROLLBAR_TRACK_BACKGROUND_DARK
    }
  },

  '& > div.tab-bar-widgets': {
    display: 'flex',
    alignItems: 'center',
    width: 'auto',
    marginLeft: 'auto',
    flexShrink: 0,

    '& > span': {
      display: 'inline-block',
      cursor: 'pointer',
      height: '16px',
      marginRight: '12px',
      fontSize: '12px',

      '&:first-of-type': {
        marginLeft: '12px'
      }
    },

    '& > .widget': {
      backgroundSize: '16px',
      height: '32px',
      width: '22px'
    },

    '& > .split-widget': {
      background: "url('./external/media/ic_split.svg') no-repeat 50% 50%",
    },

    '& > .presentation-widget': {
      background: "url('./external/media/ic_presentation.svg') no-repeat 50% 50%",
    }
  }
});

interface TabBarProps {
  editors?: { [editorKey: string]: IEditor };
  owningEditor?: string;
  children?: any;
  documents?: { [documentId: string]: IDocument };
  activeIndex?: number;
  activeDocumentId?: string;
  childRefs?: HTMLElement[];
  activeEditor?: string;
  splitTab?: (contentType: string, documentId: string, srcEditorKey: string, destEditorKey: string) => void;
  appendTab?: (srcEditorKey: string, destEditorKey: string, tabId: string) => void;
  enablePresentationMode?: () => void;
}

interface TabBarState {
  draggedOver: boolean;
}

class TabBarComponent extends React.Component<TabBarProps, TabBarState> {
  private _scrollable: HTMLElement;

  constructor(props: TabBarProps) {
    super(props);

    this.state = {
      draggedOver: false
    };
  }

  private onSplitClick = () => {
    const owningEditor = this.props.editors[this.props.owningEditor];
    const docIdToSplit = owningEditor.activeDocumentId;
    const docToSplit = owningEditor.documents[docIdToSplit];
    const destEditorKey = getOtherTabGroup(this.props.owningEditor);
    this.props.splitTab(docToSplit.contentType, docToSplit.documentId, this.props.owningEditor, destEditorKey);
  }

  private onDragEnter = (e) => {
    e.preventDefault();
  }

  private onDragOver = (e) => {
    this.setState(({ draggedOver: true }));
    e.preventDefault();
    e.stopPropagation();
  }

  private onDragLeave = (e) => {
    this.setState(({ draggedOver: false }));
  }

  private onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    this.setState(({ draggedOver: false }));
    try {
      const tabData = JSON.parse(e.dataTransfer.getData('application/json'));
      const tabId = tabData.tabId;
      this.props.appendTab(tabData.editorKey, this.props.owningEditor, tabId);
    } catch (e) { }
  }

  private saveScrollable = (ref) => {
    this._scrollable = ref;
  }

  componentDidUpdate(prevProps) {
    let scrollable = this._scrollable;
  
    if (scrollable) {
      if (this.props.children.length > prevProps.children.length &&
        scrollable.scrollWidth > scrollable.clientWidth) {
          let leftOffset = 0;
          for (let i = 0; i <= this.props.activeIndex; i++) {
            let ref = this.props.childRefs[i];
            leftOffset += ref ?  this.props.childRefs[i].offsetWidth : 0;
          }
          if (leftOffset >= scrollable.clientWidth) {
            scrollable.scrollLeft = leftOffset;
          }
      }
    }
  }

  onPresentationModeClick = () =>
    this.props.enablePresentationMode();

  render() {
    const splitEnabled = Object.keys(this.props.documents).length > 1;
    const activeDoc = this.props.documents[this.props.activeDocumentId];
    const presentationEnabled = activeDoc
      && (activeDoc.contentType === Constants.ContentType_Transcript || activeDoc.contentType === Constants.ContentType_LiveChat);

    const tabBarClassName = this.state.draggedOver ? ' dragged-over-tab-bar' : '';
    return (
      <div className={ CSS + tabBarClassName } onDragEnter={ this.onDragEnter } onDragOver={ this.onDragOver }
        onDragLeave={ this.onDragLeave } onDrop={ this.onDrop } >
        <ul ref={ this.saveScrollable }>
          {
            React.Children.map(this.props.children, child =>
              <li>{child}</li>
            )
          }
        </ul>
        <div className="tab-bar-widgets">
          { presentationEnabled ? <span className="widget presentation-widget" title="Presentation Mode" onClick={ e => this.onPresentationModeClick() }></span> : null }
          { splitEnabled ? <span className="widget split-widget" title="Split Editor" onClick={ this.onSplitClick }></span> : null }
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state: IRootState, ownProps: TabBarProps): TabBarProps => ({
  activeDocumentId: state.editor.editors[ownProps.owningEditor].activeDocumentId,
  activeEditor: state.editor.activeEditor,
  editors: state.editor.editors,
  documents: state.editor.editors[ownProps.owningEditor].documents
});

const mapDispatchToProps = (dispatch): TabBarProps => ({
  splitTab: (contentType: string, documentId: string, srcEditorKey: string, destEditorKey: string) =>
    dispatch(EditorActions.splitTab(contentType, documentId, srcEditorKey, destEditorKey)),

  appendTab: (srcEditorKey: string, destEditorKey: string, tabId: string) =>
    dispatch(EditorActions.appendTab(srcEditorKey, destEditorKey, tabId)),

  enablePresentationMode: () => dispatch(PresentationActions.enable())
});

export const TabBar = connect(mapStateToProps, mapDispatchToProps)(TabBarComponent);
