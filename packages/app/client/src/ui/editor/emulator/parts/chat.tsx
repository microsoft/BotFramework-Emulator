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

import { Colors } from '@bfemulator/ui-react';
import { connect } from 'react-redux';
import { css } from 'glamor';
import { IConnectedService, IEndpointService } from 'msbot/bin/schema';
import { SpeechTokenInfo } from '@bfemulator/app-shared';
import * as React from 'react';
import * as WebChat from 'botframework-webchat';

import { CommandServiceImpl } from '../../../../platform/commands/commandServiceImpl';
import { EmulatorMode } from '..';
import memoize from '../../../helpers/memoize';

const CognitiveServices = require('botframework-webchat/CognitiveServices');
const AdaptiveCardsHostConfig = require('botframework-webchat/adaptivecards-hostconfig.json');

const CSS = css({
  backgroundColor: 'white',
  height: '100%',
  display: 'flex',

  '& .wc-chatview-panel': {
    flex: 1,
    position: 'relative',

    '&::-webkit-scrollbar-thumb': {
      backgroundColor: 'blue',
      color: 'red',
    },

    '& p': {
      marginBottom: 0,
      marginTop: 0,
    },

    '& h1, & h2, & h3, & h4': {
      marginTop: '8px',
      marginBottom: '4px',
    },

    '& br': {
      content: ' ',
      display: 'block',
      fontSize: '50%',
    },

    '& ol, & ul': {
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

    '& .clickable:hover': {
      cursor: 'pointer'
    },
  }
});

const DISCONNECTED_CSS = css({
  padding: '16px',
  backgroundColor: 'white',
  height: '100%',
  display: 'flex',
  alignItems: 'flex-start',
  flexAlign: 'center',

  '& .start-button': {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: '0px',
  },
});

export interface Props {
  document: any;
  endpoint: IEndpointService;
  mode: EmulatorMode;
  onStartConversation: any;
}

function createWebChatProps(botId, userId, directLine, selectedActivity$, endpoint: IEndpointService, mode: string): WebChat.ChatProps {
  return {
    adaptiveCardsHostConfig: AdaptiveCardsHostConfig,
    bot: {
      id: botId || 'bot',
      name: 'Bot'
    },
    botConnection: directLine,
    formatOptions: {
      showHeader: false
    },
    selectedActivity: selectedActivity$,
    showShell: mode === 'livechat',
    speechOptions:
      (endpoint && endpoint.appId && endpoint.appPassword) ? {
        speechRecognizer: new CognitiveServices.SpeechRecognizer({
          fetchCallback: this.fetchSpeechToken.bind(this),
          fetchOnExpiryCallback: this.fetchSpeechTokenOnExpiry.bind(this)
        }),
        speechSynthesizer: new WebChat.Speech.BrowserSpeechSynthesizer()
      } : null,
    user: {
      id: userId || 'default-user',
      name: 'User'
    }
  };
}

class Chat extends React.Component<Props> {
  constructor(props: Props, context: {}) {
    super(props, context);

    this.createWebChatPropsMemoized = memoize(createWebChatProps);
  }

  createWebChatPropsMemoized: (...args) => any;

  render() {
    const { document, endpoint } = this.props;

    if (document.directLine) {
      const webChatProps = this.createWebChatPropsMemoized(
        document.botId,
        document.userId,
        document.directLine,
        document.selectedActivity$,
        endpoint,
        this.props.mode
      );

      return (
        <div id="webchat-container" className="wc-app" { ...CSS }>
          <WebChat.Chat
            key={ document.directLine.token }
            { ...webChatProps }
          />
        </div>
      );
    } else {
      return (
        <div { ...DISCONNECTED_CSS }>
          Not Connected
        </div>
      );
    }
  }

  private fetchSpeechToken(authIdEvent: string): Promise<string | void> {
    return this.getSpeechToken(authIdEvent, false);
  }

  private fetchSpeechTokenOnExpiry(authIdEvent: string): Promise<string | void> {
    return this.getSpeechToken(authIdEvent, true);
  }

  private async getSpeechToken(_authIdEvent: string, refresh: boolean): Promise<string | void> {
    const { endpoint } = this.props;

    if (!endpoint) {
      console.warn('No endpoint for this chat, cannot fetch speech token.');
      return;
    }

    let command = refresh ? 'speech-token:refresh' : 'speech-token:get';

    try {
      const speechToken: SpeechTokenInfo = await CommandServiceImpl.remoteCall(command, endpoint.endpoint);

      if (!speechToken) {
        console.error('Could not retrieve Cognitive Services speech token.');
      } else if (!speechToken.access_Token) {
        console.warn('Could not retrieve Cognitive Services speech token');

        if (typeof speechToken.error === 'string') {
          console.warn('Error: ' + speechToken.error);
        }

        if (typeof speechToken.error_Description === 'string') {
          console.warn('Details: ' + speechToken.error_Description);
        }
      } else {
        return speechToken.access_Token;
      }

      return;
    } catch (err) {
      console.error(err);
    }
  }
}

export default connect((state, { document }) => ({
  endpoint: ((state.bot.activeBot && state.bot.activeBot.services) || []).find(s => s.id === document.endpointId) as IEndpointService
}))(Chat as any) as any;
