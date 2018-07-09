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
import { IEndpointService } from 'msbot/bin/schema';
import { SpeechTokenInfo, SharedConstants } from '@bfemulator/app-shared';
import { Speech, Chat as WebChat } from 'botframework-webchat';
import { Component } from 'react';
import { CommandServiceImpl } from '../../../../../platform/commands/commandServiceImpl';
import { EmulatorMode } from '../../index';
import memoize from '../../../../helpers/memoize';
import * as styles from './chat.scss';

const CognitiveServices = require('botframework-webchat/CognitiveServices');
const AdaptiveCardsHostConfig = require('botframework-webchat/adaptivecards-hostconfig.json');

export interface Props {
  document: any;
  endpoint: IEndpointService;
  mode: EmulatorMode;
  onStartConversation: any;
}

function createWebChatProps(
  botId: string,
  userId: string,
  directLine: any,
  selectedActivity$: any,
  endpoint: IEndpointService,
  mode: string
): any {
  return {
    adaptiveCardsHostConfig: AdaptiveCardsHostConfig,
    bot: {
      id: botId || 'bot',
      name: 'Bot'
    },
    botConnection: directLine,
    chatTitle: false,
    selectedActivity: selectedActivity$,
    showShell: mode === 'livechat',
    speechOptions:
      (endpoint && endpoint.appId && endpoint.appPassword) ? {
        speechRecognizer: new CognitiveServices.SpeechRecognizer({
          fetchCallback: getSpeechToken.bind(null, endpoint, false),
          fetchOnExpiryCallback: getSpeechToken.bind(null, endpoint, true)
        }),
        speechSynthesizer: new Speech.BrowserSpeechSynthesizer()
      } : null,
    user: {
      id: userId || 'default-user',
      name: 'User'
    }
  };
}

async function getSpeechToken(endpoint: IEndpointService, refresh: boolean): Promise<string | void> {
  if (!endpoint) {
    console.warn('No endpoint for this chat, cannot fetch speech token.');
    return;
  }

  let command = refresh ? 'speech-token:refresh' : SharedConstants.Commands.Emulator.GetSpeechToken;

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

class Chat extends Component<Props> {
  createWebChatPropsMemoized: (
    botId: string,
    userId: string,
    directLine: any,
    selectedActivity$: any,
    endpoint: IEndpointService,
    mode: string
  ) => any;

  constructor(props: Props, context: {}) {
    super(props, context);

    this.createWebChatPropsMemoized = memoize(createWebChatProps);
  }

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
        <div id="webchat-container" className={ `${styles.chat} wc-app` }>
          <WebChat
            key={ document.directLine.token }
            { ...webChatProps }
          />
        </div>
      );
    } else {
      return (
        <div className={ styles.disconnected }>
          Not Connected
        </div>
      );
    }
  }
}

export default connect((state, { document }) => ({
  endpoint: ((state.bot.activeBot && state.bot.activeBot.services) || [])
    .find(s => s.id === document.endpointId) as IEndpointService
}))(Chat as any) as any;
