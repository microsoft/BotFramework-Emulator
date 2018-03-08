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
import { ActivityOrID } from '@bfemulator/app-shared';
import ChatPanel from './chatPanel';
import DetailPanel from './detailPanel';
import LogPanel from './logPanel';
import Splitter from '../../layout/splitter-v2';
import ToolBar, { Button as ToolBarButton, Separator as ToolBarSeparator } from '../toolbar';
import * as BotChat from '@bfemulator/custom-botframework-webchat';
import { SettingsService } from '../../../platform/settings/settingsService';
import { CommandService } from '../../../platform/commands/commandService';
import { uniqueId } from '@bfemulator/sdk-shared';
import * as ChatActions from '../../../data/action/chatActions';
import { Subscription, BehaviorSubject } from 'rxjs';

const CSS = css({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  height: '100%',

  '& .vertical': {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },

  '& .header': {
    flexGrow: 0,
    flexShrink: 1,
    flexBasis: '0px',

  },

  '& .content': {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: '0px',
    height: '100%',
  },
});

class Emulator extends React.Component {

  constructor(props, context) {
    super(props, context)
    this.onPresentationClick = this.handlePresentationClick.bind(this);
    this.onStartOverClick = this.handleStartOverClick.bind(this);
    this.onExportClick = this.handleExportClick.bind(this);
    this.onImportClick = this.handleImportClick.bind(this);
  }

  shouldStartNewConversation(props) {
    props = props || this.props;
    return !props.document.directLine ||
      (props.document.conversationId != props.document.directLine.token);
  }

  componentWillMount() {
    if (this.shouldStartNewConversation()) {
      this.startNewConversation();
    }
  }

  componentWillReceiveProps(nextProps, nextContext) {
    if (this.shouldStartNewConversation(nextProps)) {
      this.startNewConversation(nextProps);
    }
  }

  componentWillUpdate(nextProps, nextState, nextContext) {
  }

  componentDidUpdate(prevProps, prevState, prevContext) {
  }

  handlePresentationClick() {
  }

  startNewConversation(props) {
    props = props || this.props;

    this.props.document.selectedActivity$ = new BehaviorSubject({});

    const conversationId = uniqueId();

    if (props.document.directLine) {
      props.document.directLine.end();
    }

    props.document.webChatStore = BotChat.createStore();

    props.document.directLine = new BotChat.DirectLine({
      secret: conversationId,
      token: conversationId,
      domain: `${SettingsService.emulator.url}/v3/directline`,
      webSocket: false
    });
    props.dispatch(ChatActions.newLiveChatConversation(props.documentId, conversationId));
  }

  handleStartOverClick() {
    this.startNewConversation();
  }

  handleExportClick() {
    if (this.props.document.directLine) {
      CommandService.remoteCall('emulator:save-transcript-to-file', this.props.document.directLine.token);
    }
  }

  handleImportClick() {
  }

  render() {
    return (
      <div className={ CSS } >
        <div className="header">
          <ToolBar>
            <ToolBarButton title="Presentation" onClick={ this.onPresentationClick } />
            <ToolBarSeparator />
            <ToolBarButton title="Start Over" onClick={ this.onStartOverClick } />
            <ToolBarButton title="Save As..." onClick={ this.onExportClick } />
            <ToolBarButton title="Load..." onClick={ this.onImportClick } />
          </ToolBar>
        </div>
        <div className="content vertical">
          <Splitter orientation={ 'vertical' } primaryPaneIndex={ 0 } minSizes={ { 0: 80, 1: 80 } }>
            <div className="content">
              <ChatPanel document={ this.props.document } onStartConversation={ this.onStartOverClick } />
            </div>
            <div className="content">
              <Splitter orientation={ 'horizontal' } primaryPaneIndex={ 0 } minSizes={ { 0: 80, 1: 80 } }>
                <DetailPanel document={ this.props.document } />
                <LogPanel document={ this.props.document } />
              </Splitter>
            </div>
          </Splitter>
        </div>
      </div>
    );
  }
}

export default connect((state, { documentId }) => ({
  document: state.chat.liveChats[documentId],
  conversationId: state.chat.liveChats[documentId].conversationId
}))(Emulator);


Emulator.propTypes = {
  documentId: PropTypes.string.isRequired,
  dirty: PropTypes.bool
};
