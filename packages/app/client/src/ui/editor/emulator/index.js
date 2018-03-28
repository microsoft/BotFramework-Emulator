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
import { Splitter } from '../../layout';
import ToolBar, { Button as ToolBarButton, Separator as ToolBarSeparator } from '../toolbar';
import * as BotChat from '@bfemulator/custom-botframework-webchat';
import { SettingsService } from '../../../platform/settings/settingsService';
import { CommandService } from '../../../platform/commands/commandService';
import { uniqueId } from '@bfemulator/sdk-shared';
import * as ChatActions from '../../../data/action/chatActions';
import { Subscription, BehaviorSubject } from 'rxjs';
import store from '../../../data/store';
import * as _ from 'lodash';

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

    this.onVerticalSizeChange = _.debounce(this.onVerticalSizeChange.bind(this), 500);
    this.onHorizontalSizeChange = _.debounce(this.onHorizontalSizeChange.bind(this), 500);

    this.getVerticalSplitterSizes = this.getVerticalSplitterSizes.bind(this);
    this.getHorizontalSplitterSizes = this.getHorizontalSplitterSizes.bind(this);
  }

  getVerticalSplitterSizes() {
    return {
      0: `${this.props.document.ui.verticalSplitter[0].percentage}`
    }
  }

  getHorizontalSplitterSizes() {
    return {
      0: `${this.props.document.ui.horizontalSplitter[0].percentage}`
    }
  }

  onVerticalSizeChange(sizes) {
    this.props.document.ui = {
      ...this.props.document.ui,
      verticalSplitter: sizes
    };
  }

  onHorizontalSizeChange(sizes) {
    this.props.document.ui = {
      ...this.props.document.ui,
      horizontalSplitter: sizes
    };
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
    for (; ;) {
      if (nextProps.document.directLine || this.props.document.documentId === nextProps.document.documentId) {
        break;
      }
      this.startNewConversation(nextProps);
      break;
    }
    if (this.props.document.documentId !== nextProps.document.documentId) {
      store.dispatch(ChatActions.pingDocument(nextProps.document.documentId));
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

    store.dispatch(ChatActions.clearLog(this.props.document.documentId));

    if (props.document.subscription) {
      props.document.subscription.unsubscribe();
    }
    const selectedActivity$ = new BehaviorSubject({});
    const subscription = selectedActivity$.subscribe((obj) => {
      store.dispatch(ChatActions.setInspectorObjects(props.document.documentId, obj));
    });

    const conversationId = `${uniqueId()}|${props.mode}`;

    if (props.document.directLine) {
      props.document.directLine.end();
    }

    if (props.mode === 'transcript') {
      CommandService.remoteCall('conversation:new', props.mode)
        .then(conversation => {
          if (props.document && props.document.deepLink && props.document.activities) {
            // transcript was deep linked via protocol, and should just be fed its own activities attached to the document
            CommandService.remoteCall('emulator:feed-transcript:deep-link', conversation.conversationId, props.document.activities)
              .then(() => {
                this.initConversation(props, conversation.conversationId, selectedActivity$, subscription)
              })
              .catch(err => { throw new Error(`Error while feeding deep-linked transcript to conversation: ${err}`) });
          } else {
            // the transcript is on disk, so its activities need to be read on the main side and fed in
            CommandService.remoteCall('emulator:feed-transcript:disk', conversation.conversationId, props.document.documentId)
              .then(() => {
                this.initConversation(props, conversation.conversationId, selectedActivity$, subscription)
              })
              .catch(err => { throw new Error(`Error while feeding transcript on disk to conversation: ${err}`) });
          }
        })
        .catch(err => {
          // TODO: surface error somewhere
          console.error('Error creating a new conversation for transcript mode: ', err)
        });
    } else {
      this.initConversation(props, conversationId, selectedActivity$, subscription);
    }
  }

  initConversation(props, conversationId, selectedActivity$, subscription) {
    const webChatStore = BotChat.createStore();

    const directLine = new BotChat.DirectLine({
      secret: conversationId,
      token: conversationId,
      domain: `${SettingsService.emulator.url}/v3/directline`,
      webSocket: false
    });

    props.dispatch(
      ChatActions.newConversation(props.documentId, {
        conversationId,
        webChatStore,
        directLine,
        selectedActivity$,
        subscription
      }));
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
      <div className={ CSS } key={ this.props.pingId }>
        <div className="header">
          <ToolBar>
            <ToolBarButton visible={ true } title="Presentation" onClick={ this.onPresentationClick } />
            <ToolBarSeparator visible={ true } />
            <ToolBarButton visible={ this.props.mode === "livechat" } title="Start Over" onClick={ this.onStartOverClick } />
            <ToolBarButton visible={ true } title="Save Transcript As..." onClick={ this.onExportClick } />
          </ToolBar>
        </div>
        <div className="content vertical">
          <Splitter orientation={ 'vertical' } primaryPaneIndex={ 0 } minSizes={ { 0: 80, 1: 80 } } initialSizes={ this.getVerticalSplitterSizes } onSizeChange={ this.onVerticalSizeChange } key={ this.props.pingId }>
            <div className="content">
              <ChatPanel mode={ this.props.mode } document={ this.props.document } onStartConversation={ this.onStartOverClick } />
            </div>
            <div className="content">
              <Splitter orientation={ 'horizontal' } primaryPaneIndex={ 0 } minSizes={ { 0: 80, 1: 80 } } initialSizes={ this.getHorizontalSplitterSizes } onSizeChange={ this.onHorizontalSizeChange } key={ this.props.pingId }>
                <DetailPanel document={ this.props.document } key={ this.props.pingId }/>
                <LogPanel document={ this.props.document } key={ this.props.pingId }/>
              </Splitter>
            </div>
          </Splitter>
        </div>
      </div>
    );
  }
}

export default connect((state, { documentId }) => ({
  document: state.chat.chats[documentId],
  conversationId: state.chat.chats[documentId].conversationId,
  pingId: state.chat.chats[documentId].pingId
}))(Emulator);


Emulator.propTypes = {
  mode: PropTypes.string.isRequired,
  documentId: PropTypes.string.isRequired,
  dirty: PropTypes.bool,
};
