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
import { DebugMode, ValueTypes } from '@bfemulator/app-shared';
import { User } from '@bfemulator/sdk-shared';
import { Activity, ActivityTypes } from 'botframework-schema';
import ReactWebChat from 'botframework-webchat';
import * as React from 'react';
import { Component, KeyboardEvent, MouseEvent, ReactNode } from 'react';
import { PrimaryButton } from '@bfemulator/ui-react';

import { EmulatorMode } from '../../emulator';
import { areActivitiesEqual, getActivityTargets } from '../../../../../utils';

import ActivityWrapper from './activityWrapper';
import * as styles from './chat.scss';
import webChatStyleOptions from './webChatTheme';

interface PartialDocument {
  directLine: any;
  botId: string;
  inspectorObjects: Activity[];
  highlightedObjects: Activity[];
  documentId: string;
}

export interface ChatProps {
  document: PartialDocument;
  mode: EmulatorMode;
  debugMode: DebugMode;
  currentUser: User;
  locale: string;
  webSpeechPonyfillFactory?: () => any;
  pendingSpeechTokenRetrieval?: boolean;
  showContextMenuForActivity: (activity: Partial<Activity>) => void;
  setInspectorObject: (documentId: string, activity: Partial<Activity & { showInInspector: true }>) => void;
  webchatStore: any;
}

interface ChatState {
  selectedActivity?: Activity;
  highlightedActivities?: Activity[];
  document?: PartialDocument;
}

export class Chat extends Component<ChatProps, ChatState> {
  public state = { waitForSpeechToken: false } as ChatState;
  private activityMap: { [activityId: string]: Activity };

  public static getDerivedStateFromProps(newProps: ChatProps): ChatState {
    let selectedActivity =
      'inspectorObjects' in newProps.document ? newProps.document.inspectorObjects[0] : ({} as Activity);
    // The log panel gives us the entire trace while
    // WebChat gives us the nested activity. Determine
    // if we should be targeting the nested activity
    // within the selected activity.
    if (selectedActivity && selectedActivity.valueType === ValueTypes.Activity) {
      selectedActivity = selectedActivity.value;
    }
    const highlightedActivities = getActivityTargets([
      ...(newProps.document.highlightedObjects || []),
      selectedActivity,
    ]);
    return {
      document: newProps.document,
      selectedActivity,
      highlightedActivities,
    };
  }

  public render() {
    this.activityMap = {};
    const { currentUser, document, locale, mode, debugMode, webchatStore } = this.props;

    if (this.props.pendingSpeechTokenRetrieval) {
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
            store={webchatStore}
            activityMiddleware={this.createActivityMiddleware}
            bot={bot}
            directLine={document.directLine}
            disabled={isDisabled}
            key={document.directLine.token}
            locale={locale}
            styleOptions={{ ...webChatStyleOptions, hideSendBox: isDisabled }}
            userID={currentUser.id}
            username={currentUser.name || 'User'}
            webSpeechPonyfillFactory={this.props.webSpeechPonyfillFactory}
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
        onClick={this.onItemRendererClick}
        onKeyDown={this.onItemRendererKeyDown}
        isSelected={this.shouldBeSelected(card.activity)}
      >
        {next(card)(children)}
      </ActivityWrapper>
    );
  }

  private createActivityMiddleware = () => next => card => children => {
    const { valueType } = card.activity;

    this.activityMap[card.activity.id] = valueType === ValueTypes.Activity ? card.activity.value : card.activity;

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
    const { valueType } = card.activity; // activities are nested

    if (valueType === ValueTypes.Activity) {
      const messageActivity = card.activity.value;
      return (
        <ActivityWrapper
          activity={messageActivity}
          data-activity-id={card.activity.id}
          onKeyDown={this.onItemRendererKeyDown}
          onClick={this.onItemRendererClick}
          onContextMenu={this.onContextMenu}
          isSelected={this.shouldBeSelected(messageActivity)}
        >
          {next({ activity: messageActivity, timestampClassName: 'transcript-timestamp' })(children)}
        </ActivityWrapper>
      );
    } else if (valueType === ValueTypes.BotState) {
      const diffIndicatorIndex =
        this.state.highlightedActivities.length > 1
          ? this.state.highlightedActivities.findIndex(activity => areActivitiesEqual(activity, card.activity))
          : -1;
      return (
        <PrimaryButton
          className={styles.botStateObject}
          data-activity-id={card.activity.id}
          data-diff-indicator-index={diffIndicatorIndex}
          onKeyDown={this.onItemRendererKeyDown}
          onClick={this.onItemRendererClick}
          onContextMenu={this.onContextMenu}
          aria-selected={this.shouldBeSelected(card.activity)}
        >
          Bot State
        </PrimaryButton>
      );
    }
    return null;
  }

  protected updateSelectedActivity(id: string): void {
    const selectedActivity: Activity & { showInInspector?: boolean } = this.activityMap[id];
    this.setState({ selectedActivity });
    this.props.setInspectorObject(this.props.document.documentId, { ...selectedActivity, showInInspector: true });
  }

  private shouldBeSelected(subject: Activity): boolean {
    return this.state.highlightedActivities.some(activity => areActivitiesEqual(activity, subject));
  }

  private onItemRendererClick = (event: MouseEvent<HTMLDivElement | HTMLButtonElement>): void => {
    const { activityId } = (event.currentTarget as any).dataset;
    this.updateSelectedActivity(activityId);
  };

  private onItemRendererKeyDown = (event: KeyboardEvent<HTMLDivElement | HTMLButtonElement>): void => {
    if (event.key !== ' ' && event.key !== 'Enter') {
      return;
    }
    const { activityId } = (event.currentTarget as any).dataset;
    this.updateSelectedActivity(activityId);
  };

  private onContextMenu = (event: MouseEvent<HTMLDivElement | HTMLButtonElement>): void => {
    const { activityId } = (event.currentTarget as any).dataset;
    const activity = this.activityMap[activityId];

    this.updateSelectedActivity(activityId);
    this.props.showContextMenuForActivity(activity);
  };
}
