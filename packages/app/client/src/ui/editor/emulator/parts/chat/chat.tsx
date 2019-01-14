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
import { Activity } from '@bfemulator/sdk-shared';
import { IEndpointService } from 'botframework-config/lib/schema';
import ReactWebChat from 'botframework-webchat';
import { CommandServiceImpl } from '../../../../../platform/commands/commandServiceImpl';
import * as styles from './chat.scss';
import { EmulatorMode } from '../../emulator';
import ActivityWrapper from './activityWrapper';
import webChatStyleOptions from './webChatTheme';

export interface ChatProps {
  document: any;
  endpoint: IEndpointService;
  mode: EmulatorMode;
  onStartConversation: any;
  currentUserId: string;
  locale: string;
  selectedActivity: Activity | null;
  updateSelectedActivity: (activity: Activity) => void;
}

function isCardSelected(selectedActivity: Activity | null, activity: Activity): boolean {
  return Boolean(selectedActivity && activity.id && selectedActivity.id === activity.id);
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
  render() {
    const { currentUserId, document, locale } = this.props;

    if (document.directLine) {
      const bot = {
        id: document.botId || 'bot',
        name: 'Bot'
      };

      return (
        <div className={ `${styles.chat} wc-app wc-wide` }>
          <ReactWebChat
            activityMiddleware={ this.createActivityMiddleware }
            bot={ bot }
            directLine={ document.directLine }
            key={ document.directLine.token }
            locale={ locale }
            styleOptions={ webChatStyleOptions }
            userId={ currentUserId }
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

  private createActivityMiddleware = () => next => card => children => (
    <ActivityWrapper
      activity={ card.activity }
      onClick={ this.props.updateSelectedActivity }
      isSelected={ isCardSelected(this.props.selectedActivity, card.activity) }
    >
      { next(card)(children) }
    </ActivityWrapper>
  )
}
