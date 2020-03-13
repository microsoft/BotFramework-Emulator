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

import { ValueTypes, RestartConversationStatus } from '@bfemulator/app-shared';
import { User } from '@bfemulator/sdk-shared';
import { Activity, ActivityTypes } from 'botframework-schema';
import ReactWebChat, { createStyleSet } from 'botframework-webchat';
import * as React from 'react';
import { PureComponent, KeyboardEvent, MouseEvent, ReactNode } from 'react';
import { EmulatorMode } from '@bfemulator/sdk-shared';
import { DirectLine } from 'botframework-directlinejs';

import { OuterActivityWrapperContainer } from './outerActivityWrapperContainer';
import * as styles from './chat.scss';
import webChatStyleOptions from './webChatTheme';
import { TraceActivityContainer } from './traceActivityContainer';
import { ConnectionMessageContainer } from './connectionMessageContainer';

export interface ChatProps {
  botId?: string;
  conversationId?: string;
  currentUserId?: string;
  directLine?: DirectLine;
  documentId?: string;
  mode?: EmulatorMode;
  locale?: string;
  webSpeechPonyfillFactory?: () => any;
  showContextMenuForActivity?: (activity: Partial<Activity>) => void;
  setInspectorObject?: (documentId: string, activity: Partial<Activity & { showInInspector: true }>) => void;
  webchatStore?: any;
  showOpenUrlDialog?: (url) => any;
  restartStatus: RestartConversationStatus;
}

interface ChatState {
  highlightedActivities?: Activity[];
}

export class Chat extends PureComponent<ChatProps, ChatState> {
  public state = { waitForSpeechToken: false } as ChatState;
  private activityMap: { [activityId: string]: Activity } = {};

  public render() {
    const {
      botId,
      conversationId,
      currentUserId = '',
      directLine,
      locale,
      mode,
      webchatStore,
      webSpeechPonyfillFactory,
    } = this.props;

    const currentUser = { id: currentUserId, name: 'User' };
    const isDisabled =
      mode === 'transcript' || mode === 'debug' || this.props.restartStatus === RestartConversationStatus.Started;

    // Due to needing to make idiosyncratic style changes, Emulator is using `createStyleSet` instead of `createStyleOptions`. The object below: {...webChatStyleOptions, hideSendBox...} was formerly passed into the `styleOptions` parameter of React Web Chat. If further styling modifications are desired using styleOptions, simply pass it into the same object in createStyleSet below.

    const styleSet = createStyleSet({ ...webChatStyleOptions, hideSendBox: isDisabled });

    // Overriding default styles of webchat as these properties are not exposed directly
    styleSet.fileContent = {
      ...styleSet.fileContent,
      background: styles.bubbleBackground,
      '& .webchat__fileContent__fileName': {
        color: styles.bubbleContentColor,
      },
      '& .webchat__fileContent__size': {
        color: styles.bubbleContentColor,
      },
      '& .webchat__fileContent__downloadIcon': {
        fill: styles.bubbleContentColor,
      },
      '& .webchat__fileContent__badge': {
        padding: '4px',
      },
    };

    if (directLine) {
      const bot = {
        id: botId || 'bot',
        name: 'Bot',
      };

      return (
        <div className={styles.chat}>
          <ReactWebChat
            store={webchatStore}
            activityMiddleware={this.createActivityMiddleware}
            cardActionMiddleware={this.cardActionMiddleware}
            bot={bot}
            directLine={directLine}
            disabled={isDisabled}
            key={conversationId}
            locale={locale}
            styleSet={styleSet}
            userID={currentUser.id}
            username={currentUser.name || 'User'}
            webSpeechPonyfillFactory={webSpeechPonyfillFactory}
          />
          <ConnectionMessageContainer documentId={this.props.documentId} />
        </div>
      );
    }

    return <div className={styles.disconnected}>Not Connected</div>;
  }

  private activityWrapper(next, card, children): ReactNode {
    return (
      <OuterActivityWrapperContainer
        card={card}
        documentId={this.props.documentId}
        onContextMenu={this.onContextMenu}
        onItemRendererClick={this.onItemRendererClick}
        onItemRendererKeyDown={this.onItemRendererKeyDown}
      >
        {next(card)(children)}
      </OuterActivityWrapperContainer>
    );
  }

  private cardActionMiddleware = () => next => async ({ cardAction, getSignInUrl }) => {
    const { type, value } = cardAction;

    switch (type) {
      case 'signin': {
        const popup = window.open();
        const url = await getSignInUrl();
        popup.location.href = url;
        break;
      }

      case 'downloadFile':
      //Fall through

      case 'playAudio':
      //Fall through

      case 'playVideo':
      //Fall through

      case 'showImage':
      //Fall through

      case 'openUrl':
        if (value) {
          this.props.showOpenUrlDialog(value).then(result => {
            if (result == 1) {
              window.open(value, '_blank');
            }
          });
        }
        break;

      default:
        return next({ cardAction, getSignInUrl });
    }
  };

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
    const { documentId, mode } = this.props;

    // we should only render the underlying activity once using the middleware,
    // and re-rendering should only be done at the wrapper level for highlighting
    let activityChildren;
    const { valueType } = card.activity; // activities are nested
    if (valueType === ValueTypes.Activity) {
      const messageActivity = card.activity.value;
      activityChildren = next({ activity: messageActivity, timestampClassName: 'transcript-timestamp' })(children);
    } else if (valueType === ValueTypes.Command) {
      const messageActivity = { ...card.activity, type: ActivityTypes.Message, text: card.activity.value } as Activity;
      activityChildren = next({ activity: messageActivity, timestampClassName: 'transcript-timestamp' })(children);
    }

    return (
      <TraceActivityContainer
        card={card}
        documentId={documentId}
        mode={mode}
        next={next}
        onItemRendererKeyDown={this.onItemRendererKeyDown}
        onItemRendererClick={this.onItemRendererClick}
        onContextMenu={this.onContextMenu}
      >
        {activityChildren}
      </TraceActivityContainer>
    );
  }

  protected updateSelectedActivity(id: string): void {
    const selectedActivity: Activity & { showInInspector?: boolean } = this.activityMap[id];
    this.props.setInspectorObject(this.props.documentId, { ...selectedActivity, showInInspector: true });
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
