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
import { DebugMode } from '@bfemulator/app-shared';
import { User } from '@bfemulator/sdk-shared';
import { IEndpointService } from 'botframework-config/lib/schema';
import { Activity, ActivityTypes } from 'botframework-schema';
import ReactWebChat, { createCognitiveServicesBingSpeechPonyfillFactory } from 'botframework-webchat';
import * as React from 'react';
import { Component, KeyboardEvent, MouseEvent, ReactNode } from 'react';

import { CommandServiceImpl } from '../../../../../platform/commands/commandServiceImpl';
import { EmulatorMode } from '../../emulator';

import ActivityWrapper from './activityWrapper';
import * as styles from './chat.scss';
import webChatStyleOptions from './webChatTheme';

export interface ChatProps {
  document: any;
  endpoint: IEndpointService;
  mode: EmulatorMode;
  debugMode: DebugMode;
  onStartConversation: any;
  currentUser: User;
  currentUserId: string;
  locale: string;
  selectedActivity: Activity | null;
  updateSelectedActivity: (activity: Partial<Activity>) => void;
  showContextMenuForActivity: (activity: Partial<Activity>) => void;
}

interface ChatState {
  waitForSpeechToken: boolean;
  webSpeechPonyfillFactory: any;
}

function isCardSelected(selectedActivity: Activity | null, activity: Activity): boolean {
  return Boolean(selectedActivity && activity.id && selectedActivity.id === activity.id);
}

function isSpeechEnabled(endpoint: IEndpointService | null): boolean {
  return Boolean(endpoint && endpoint.appId && endpoint.appPassword);
}

export async function getSpeechToken(endpoint: IEndpointService, refresh: boolean = false): Promise<string | void> {
  if (!endpoint) {
    // eslint-disable-next-line no-console
    console.warn('No endpoint for this chat, cannot fetch speech token.');
    return;
  }

  const command = refresh ? 'speech-token:refresh' : 'speech-token:get';

  try {
    return await CommandServiceImpl.remoteCall(command, endpoint.id);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
  }
}

export class Chat extends Component<ChatProps, ChatState> {
  private activityMap: { [activityId: string]: Activity };

  constructor(props: ChatProps, context: {}) {
    super(props, context);

    this.state = {
      waitForSpeechToken: isSpeechEnabled(props.endpoint),
      webSpeechPonyfillFactory: null,
    };
  }

  public async componentDidMount() {
    if (this.state.waitForSpeechToken) {
      const speechToken = await getSpeechToken(this.props.endpoint);

      if (speechToken) {
        const webSpeechPonyfillFactory = await createCognitiveServicesBingSpeechPonyfillFactory({
          authorizationToken: speechToken,
        });

        this.setState({ webSpeechPonyfillFactory, waitForSpeechToken: false });
      } else {
        this.setState({ waitForSpeechToken: false });
      }
    }
  }

  public render() {
    this.activityMap = {};
    const { currentUser, currentUserId, document, locale, mode, debugMode } = this.props;

    if (this.state.waitForSpeechToken) {
      return <div className={styles.disconnected}>Connecting...</div>;
    }

    if (document.directLine) {
      const bot = {
        id: document.botId || 'bot',
        name: 'Bot',
      };
      const isDisabled = mode === 'transcript' || debugMode === DebugMode.Sidecar;

      return (
        <div className={styles.chat}>
          <ReactWebChat
            activityMiddleware={this.createActivityMiddleware}
            bot={bot}
            directLine={document.directLine}
            disabled={isDisabled}
            key={document.directLine.token}
            locale={locale}
            styleOptions={{ ...webChatStyleOptions, hideSendBox: isDisabled }}
            userID={currentUserId}
            username={currentUser.name || 'User'}
            webSpeechPonyfillFactory={this.state.webSpeechPonyfillFactory}
          />
        </div>
      );
    }

    return <div className={styles.disconnected}>Not Connected</div>;
  }

  private activityWrapper(next, card, children): ReactNode {
    return (
      <ActivityWrapper
        activity={card.activity}
        data-activity-id={card.activity.id}
        onClick={this.onActivityWrapperClick}
        onKeyDown={this.onActivityWrapperKeyDown}
        isSelected={isCardSelected(this.props.selectedActivity, card.activity)}
      >
        {next(card)(children)}
      </ActivityWrapper>
    );
  }

  private createActivityMiddleware = () => next => card => children => {
    this.activityMap[card.activity.id] = card.activity;

    switch (card.activity.type) {
      case ActivityTypes.Trace:
        return this.renderTraceActivity(next, card, children);

      case ActivityTypes.EndOfConversation:
        return null;

      default:
        return this.activityWrapper(next, card, children);
    }
  };

  private renderTraceActivity(next, card, children): ReactNode {
    if (this.props.debugMode !== DebugMode.Sidecar) {
      return null;
    }
    let { value: activity = {} } = card.activity; // activities are nested
    if (activity.type !== ActivityTypes.Message) {
      // determine if this is a bot state
      const valueType = 'https://www.botframework.com/schemas/botState';
      if (card.activity.valueType === valueType) {
        activity = {
          type: ActivityTypes.Message,
          id: card.activity.id,
          text: '<Bot State Object>',
          from: { role: 'bot' },
          value: activity,
          valueType,
        } as Activity;
      } else {
        return null;
      }
    }
    return (
      <ActivityWrapper
        activity={activity}
        data-activity-id={card.activity.id}
        onKeyDown={this.onActivityWrapperKeyDown}
        onClick={this.onActivityWrapperClick}
        onContextMenu={this.onContextMenu}
        isSelected={isCardSelected(this.props.selectedActivity, activity)}
      >
        {next({ activity, timestampClassName: 'transcript-timestamp' })(children)}
      </ActivityWrapper>
    );
  }

  private onActivityWrapperClick = (event: MouseEvent<HTMLDivElement>): void => {
    const { activityId } = (event.currentTarget as any).dataset;
    this.props.updateSelectedActivity(this.activityMap[activityId]);
  };

  private onActivityWrapperKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    const { activityId } = (event.currentTarget as any).dataset;
    this.props.updateSelectedActivity(this.activityMap[activityId]);
  };

  private onContextMenu = (event: MouseEvent<HTMLDivElement>): void => {
    const { activityId } = (event.currentTarget as any).dataset;
    const activity = this.activityMap[activityId];

    this.props.updateSelectedActivity(activity);
    this.props.showContextMenuForActivity(activity);
  };
}
