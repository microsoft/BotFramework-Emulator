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
import { Component } from 'react';
import { IEndpointService } from 'botframework-config/lib/schema';
import ReactWebChat from 'botframework-webchat';
import { CommandServiceImpl } from '../../../../../platform/commands/commandServiceImpl';
import memoize from '../../../../helpers/memoize';
import * as styles from './chat.scss';
import { EmulatorMode } from '../../emulator';

// const CognitiveServices = require('botframework-webchat/CognitiveServices');

export interface ChatProps {
  document: any;
  endpoint: IEndpointService;
  mode: EmulatorMode;
  onStartConversation: any;
  currentUserId: string;
  locale: string;
}

function createWebChatProps(
  botId: string,
  userId: string,
  directLine: any,
  endpoint: IEndpointService
): any {
  return {
    bot: {
      id: botId || 'bot',
      name: 'Bot'
    },
    directLine,
    userID: userId
    // speechOptions:
    //   (endpoint && endpoint.appId && endpoint.appPassword) ? {
    //     speechRecognizer: new CognitiveServices.SpeechRecognizer({
    //       fetchCallback: getSpeechToken.bind(null, endpoint, false),
    //       fetchOnExpiryCallback: getSpeechToken.bind(null, endpoint, true)
    //     }),
    //     speechSynthesizer: new Speech.BrowserSpeechSynthesizer()
    //   } : null,
  };
    }

}

export async function getSpeechToken(endpoint: IEndpointService, refresh: boolean): Promise<string | void> {
  if (!endpoint) {
    console.warn('No endpoint for this chat, cannot fetch speech token.');
    return;
  }

  let command = refresh ? 'speech-token:refresh' : 'speech-token:get';

  try {
    return await CommandServiceImpl.remoteCall(command, endpoint.id);
  } catch (err) {
    console.error(err);
  }
}

export class Chat extends Component<ChatProps> {
  createWebChatPropsMemoized: (
    botId: string,
    userId: string,
    directLine: any,
    endpoint: IEndpointService
  ) => any;

  constructor(props: ChatProps, context: {}) {
    super(props, context);

    this.createWebChatPropsMemoized = memoize(createWebChatProps);
  }

  render() {
    const { document, endpoint } = this.props;

    if (document.directLine) {
      const webChatProps = this.createWebChatPropsMemoized(
        document.botId,
        document.userId || this.props.currentUserId,
        document.directLine,
        endpoint
      );

      // TODO: update for themes
      const styleOptions = {
        bubbleBackground: '#dcdcdc',
        bubbleFromUserBackground: '#3062D6',
        bubbleFromUserTextColor: '#ffffff',
        backgroundColor: '#ffffff'
      };

      return (
        <div id="webchat-container" className={ `${styles.chat} wc-app wc-wide` }>
          <ReactWebChat
            locale={ this.props.locale }
            key={ document.directLine.token }
            styleOptions={ styleOptions }
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
