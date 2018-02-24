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
import * as WebChat from 'custom-botframework-webchat';
import { BehaviorSubject } from 'rxjs';
import { ActivityOrID } from 'botframework-emulator-shared';
import state from '../state';
import store from '../../../../data/store';
import * as ChatActions from '../../../../data/action/chatActions';
import * as Colors from '../../../styles/colors';

const CSS = css({
  backgroundColor: 'white',
  height: '90%',
  maxHeight: '100%',
  display: 'flex',

  '& .wc-chatview-panel': {
    flex: 1,
    position: 'relative',

    '&::-webkit-scrollbar-thumb': {
      backgroundColor: 'blue',
      color: 'red',
    },

    '& .format-markdown>p': {
      marginBottom: 0,
      marginTop: 0,
    },

    '& .wc-message-content *': {
      userSelect: 'text',
    },

    '& .wc-message-content.selected': {
      color: 'black',
      backgroundColor: Colors.WEBCHAT_SELECTED_BACKGROUND_DARK,
      boxShadow: '0px 1px 1px 0px rgba(0,0,0,0.2)',
    },

    '& .wc-message-content.selected>svg.wc-message-callout>path': {
      fill: Colors.WEBCHAT_SELECTED_BACKGROUND_DARK,
    },

    '& .wc-card': {
      color: '#000',
    },

    '& .wc-card button': {
      border: '1px solid #ccc',
      borderRadius: '1px',
      cursor: 'pointer',
      outline: 'none',
      transition: 'color .2s ease, background-color .2s ease',
      backgroundColor: 'transparent',
      color: '#0078D7',
      minHeight: '32px',
      width: '100%',
      padding: '0 16px',
    },

    '& .wc-list ul': {
      padding: 0,
    },
  }
});

const DISCONNECTED_CSS = css({
  padding: '16px',
  backgroundColor: 'lightgray',
  color: 'black',
  height: '100%'
});

// TODO: Fill this out
export interface ChatProps {
  document: any;
};

export default class Chat extends React.Component<ChatProps> {

  selectedActivity$: BehaviorSubject<ActivityOrID>;

  constructor(props, context) {
    super(props, context);
    this.selectedActivity$ = new BehaviorSubject<ActivityOrID>({});
    this.selectedActivity$.subscribe((obj) => {
      store.dispatch(ChatActions.setInspectorObjects(this.props.document.conversationId, obj));
    });
  }

  render() {
    if (this.props.document.directLine) {
      const props: WebChat.ChatProps = {
        adaptiveCardsHostConfig: null,
        user: {
          id: "1234",
          name: "User"
        },
        bot: {
          id: "WXYZ",
          name: "Bot"
        },
        formatOptions: {
          showHeader: false
        },
        selectedActivity: (this.selectedActivity$ as any),
        botConnection: this.props.document.directLine,
        store: this.props.document.webChatStore
      };
      return (
        <div {...CSS}>
          {<WebChat.Chat {...props} />}
        </div>
      );
    } else {
      return (
        <div {...DISCONNECTED_CSS}>
          <span>Not connected. Press the 'Start Over' button.</span>
        </div>
      );
    }
  }
}
