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
import React from 'react';
import { connect } from 'react-redux';

import * as constants from '../../../../constants';
import * as ChatActions from '../../../../data/action/chatActions';
import * as EditorActions from '../../../../data/action/editorActions';
import ExpandCollapse, { Controls as ExpandCollapseControls, Content as ExpandCollapseContent } from '../../../layout/expandCollapse';
import * as Colors from '../../../styles/colors';
import ExplorerItem from '../explorerItem';
import { CommandRegistry } from '@bfemulator/app-shared';
import { CommandService } from '../../../../platform/commands/commandService';
import store from '../../../../data/store';
import { EXPLORER_CSS } from '../explorerStyle';

//=============================================================================
// LIVE CHAT COMMANDS

CommandRegistry.registerCommand('livechat:new', (context) => {
  CommandService.remoteCall('livechat:new')
    .then(conversationId => {
      store.dispatch(ChatActions.newLiveChatDocument(conversationId));
      store.dispatch(EditorActions.open(
        constants.ContentType_LiveChat,
        conversationId,
        false
      ));
    })
    .catch(err => console.log(err));  // TODO: Show failure as a notification
});

//=============================================================================

const ACCESSORIES_CSS = css({
  '& .accessory-button': {
    width: '30px',
    height: '30px',
  },

  '& .create-button': {
    background: "url('./external/media/ic_new_file.svg') no-repeat 50% 50%",
    backgroundSize: '16px',
  },
});

const CONVO_CSS = css({
  display: 'flex',
  flexDirection: 'column',
  listStyleType: 'none',
  margin: 0,
  padding: 0,
  maxHeight: '100%',
  overflowY: 'auto',
  overflowX: 'hidden',
});

class LiveChatExplorer extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.onAddClick = this.handleAddClick.bind(this);
    this.onItemClick = this.handleItemClick.bind(this);
  }

  handleAddClick(e) {
    e.stopPropagation();
    CommandService.call('livechat:new');
  }

  handleItemClick(conversationId) {
    this.props.dispatch(EditorActions.setActiveTab(conversationId));
  }

  renderLiveChatList() {
    return (
      <ExpandCollapseContent key={ this.props.changeKey }>
        <ul className={ CONVO_CSS }>
          {
            Object.keys(this.props.liveChats).map(conversationId =>
              <ExplorerItem key={ conversationId } active={ this.props.activeDocumentId === conversationId } onClick={ () => this.onItemClick(conversationId) }>
                <span>{ `Live Chat` }</span>
              </ExplorerItem>
            )
          }
        </ul>
      </ExpandCollapseContent>
    );
  }

  renderEmptyLiveChatList() {
    return (
      <ExpandCollapseContent key={ this.props.changeKey }>
        <span className="empty-list">No live chats yet</span>
      </ExpandCollapseContent>
    );
  }

  render() {
    return (
      <div className={ EXPLORER_CSS }>
        <ExpandCollapse
          initialExpanded={ true }
          title="Live Chats"
        >
          <ExpandCollapseControls>
            <div className={ ACCESSORIES_CSS }>
              <div className="accessory-button create-button" role="button" onClick={ this.onAddClick } />
            </div>
          </ExpandCollapseControls>
          {
            Object.keys(this.props.liveChats).length
              ? this.renderLiveChatList()
              : this.renderEmptyLiveChatList()
          }
        </ExpandCollapse>
      </div>
    );
  }
}

export default connect(state => ({
  activeDocumentId: state.editor.editors[state.editor.activeEditor].activeDocumentId,
  liveChats: state.chat.liveChats,
  changeKey: state.chat.liveChatChangeKey
}))(LiveChatExplorer)
