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
import { Subscription, BehaviorSubject } from 'rxjs';
import * as styles from './chatPanel.scss';

import { ChatContainer } from '../parts/chat/chatContainer';
import { EmulatorMode } from '../emulator';

interface ChatPanelProps {
  document: {
    endpointUrl: string;
    selectedActivity$?: BehaviorSubject<any>;
  };
  mode?: EmulatorMode;
  onStartConversation?: () => any;
  className?: string;
}

interface ChatPanelState {
  selectedActivity: any | null;
}

export default class ChatPanel extends React.Component<ChatPanelProps, ChatPanelState> {
  static defaultProps = {
    document: { endpointUrl: '' }
  };

  state = {
    selectedActivity: null
  };

  selectedActivitySub: Subscription;

  componentDidUpdate() {
    const { document } = this.props;

    if (document && document.selectedActivity$ && !this.selectedActivitySub) {
      this.selectedActivitySub = document.selectedActivity$.subscribe(obj => {
        this.setState({ selectedActivity: obj });
      });
    }
  }

  componentWillUnmount() {
    if (this.selectedActivitySub) {
      this.selectedActivitySub.unsubscribe();
    }
  }

  updateSelectedActivity = (activity) => {
    const { document } = this.props;

    if (document && document.selectedActivity$) {
      document.selectedActivity$.next({
        ...activity,
        showInInspector: true
      });
    }
  }

  render() {
    const { endpointUrl } = this.props.document;

    return (
      <div className={ `${styles.chatPanel} ${this.props.className || ''}` }>
        <header>{ endpointUrl }</header>
        <ChatContainer
          mode={ this.props.mode }
          document={ this.props.document }
          onStartConversation={ this.props.onStartConversation }
          selectedActivity={ this.state.selectedActivity }
          updateSelectedActivity={ this.updateSelectedActivity }
        />
      </div>
    );
  }
}
