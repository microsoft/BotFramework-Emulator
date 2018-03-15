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
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import TabBarTab from './tabBarTab';
import * as Colors from '../../styles/colors';
import * as EditorActions from '../../../data/action/editorActions';
import * as Constants from '../../../constants';
import { getOtherTabGroup } from '../../../data/editorHelpers';

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
    zIndex: 1, // So that the box-shadow will fall onto the document area (sibling div)
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
      marginRight: '16px',
      fontSize: '12px',

      '&:first-of-type': {
        marginLeft: '16px'
      }
    },

    '& > .split-widget': {
      background: "url('./external/media/ic_split.svg') no-repeat 50% 50%",
      backgroundSize: '16px',
      height: '32px',
      width: '32px'
    }
  }
});

export class TabBar extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.onSplitClick = this.onSplitClick.bind(this);

    this.onDragEnter = this.onDragEnter.bind(this);
    this.onDragOver = this.onDragOver.bind(this);
    this.onDragLeave = this.onDragLeave.bind(this);
    this.onDrop = this.onDrop.bind(this);

    this.state = {};
  }

  onSplitClick() {
    const owningEditor = this.props.editors[this.props.owningEditor];
    const docIdToSplit = owningEditor.activeDocumentId;
    const docToSplit = owningEditor.documents[docIdToSplit];
    const destEditorKey = getOtherTabGroup(this.props.owningEditor);
    this.props.dispatch(EditorActions.splitTab(docToSplit.contentType, docToSplit.documentId, this.props.owningEditor, destEditorKey));
  }

  onDragEnter(e) {
    e.preventDefault();
  }

  onDragOver(e) {
    this.setState(({ draggedOver: true }));
    e.preventDefault();
    e.stopPropagation();
  }

  onDragLeave(e) {
    this.setState(({ draggedOver: false }));
  }

  onDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    this.setState(({ draggedOver: false }));
    try {
      const tabData = JSON.parse(e.dataTransfer.getData('application/json'));
      const tabId = tabData.tabId;
      this.props.dispatch(EditorActions.appendTab(tabData.editorKey, this.props.owningEditor, tabId));
    } catch (e) { }
  }

  render() {
    const splitEnabled = Object.keys(this.props.documents).length > 1;

    const tabBarClassName = this.state.draggedOver ? ' dragged-over-tab-bar' : '';

    return (
      <div className={ CSS + tabBarClassName } onDragEnter={ this.onDragEnter } onDragOver={ this.onDragOver }
        onDragLeave={ this.onDragLeave } onDrop={ this.onDrop } >
        <ul>
          {
            React.Children.map(this.props.children, child =>
              <li>{child}</li>
            )
          }
        </ul>
        <div className="tab-bar-widgets">
          { splitEnabled ? <span className="split-widget" onClick={ this.onSplitClick }></span> : null }
        </div>
      </div>
    );
  }
}

export default connect((state, { owningEditor }) => ({
  activeEditor: state.editor.activeEditor,
  editors: state.editor.editors,
  documents: state.editor.editors[owningEditor].documents
}))(TabBar);

TabBar.propTypes = {
  activeEditor: PropTypes.oneOf([
    Constants.EditorKey_Primary,
    Constants.EditorKey_Secondary
  ]),
  editors: PropTypes.object,
  value: PropTypes.number,
  owningEditor: PropTypes.oneOf([
    Constants.EditorKey_Primary,
    Constants.EditorKey_Secondary
  ]),
  splitEnabled: PropTypes.bool
};
