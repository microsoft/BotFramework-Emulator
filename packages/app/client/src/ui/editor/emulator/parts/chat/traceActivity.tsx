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
import { Activity, ActivityTypes } from 'botframework-schema';
import { EmulatorMode } from '@bfemulator/sdk-shared';
import { ValueTypes } from '@bfemulator/app-shared';
import { PrimaryButton } from '@bfemulator/ui-react';

import { areActivitiesEqual } from '../../../../../utils';

import * as styles from './chat.scss';
import { ActivityWrapper } from './activityWrapper';

export interface TraceActivityProps {
  activity?: Activity;
  card?: any;
  children?: any;
  documentId?: string;
  highlightedActivities?: Activity[];
  mode?: EmulatorMode;
  onContextMenu?: (event: React.MouseEvent<HTMLElement>) => void;
  onItemRendererClick?: (event: React.MouseEvent<HTMLElement>) => void;
  onItemRendererKeyDown?: (event: React.KeyboardEvent<HTMLElement>) => void;
}

export class TraceActivity extends React.Component<TraceActivityProps, {}> {
  public render(): React.ReactNode {
    const {
      card,
      children,
      highlightedActivities = [],
      mode,
      onContextMenu,
      onItemRendererClick,
      onItemRendererKeyDown,
    } = this.props;

    if (mode !== 'debug') {
      return null;
    }

    const { valueType } = card.activity; // activities are nested
    if (valueType === ValueTypes.Activity) {
      const messageActivity = card.activity.value;
      return (
        <ActivityWrapper
          activity={messageActivity}
          data-activity-id={card.activity.id}
          onKeyDown={onItemRendererKeyDown}
          onClick={onItemRendererClick}
          onContextMenu={onContextMenu}
          isSelected={this.shouldBeSelected(messageActivity)}
        >
          {children}
        </ActivityWrapper>
      );
    } else if (valueType === ValueTypes.Command) {
      const messageActivity = { ...card.activity, type: ActivityTypes.Message, text: card.activity.value } as Activity;
      return (
        <ActivityWrapper
          activity={messageActivity}
          data-activity-id={card.activity.id}
          onKeyDown={onItemRendererKeyDown}
          onClick={onItemRendererClick}
          onContextMenu={onContextMenu}
          isSelected={this.shouldBeSelected(messageActivity)}
        >
          {children}
        </ActivityWrapper>
      );
    } else if (valueType === ValueTypes.BotState) {
      const diffIndicatorIndex =
        highlightedActivities.length > 1
          ? highlightedActivities.findIndex(activity => areActivitiesEqual(activity, card.activity))
          : -1;
      return (
        <PrimaryButton
          className={styles.botStateObject}
          data-activity-id={card.activity.id}
          data-diff-indicator-index={diffIndicatorIndex}
          onKeyDown={onItemRendererKeyDown}
          onClick={onItemRendererClick}
          onContextMenu={onContextMenu}
          aria-selected={this.shouldBeSelected(card.activity)}
        >
          Bot State
        </PrimaryButton>
      );
    }
    return null;
  }

  private shouldBeSelected(subject: Activity): boolean {
    return this.props.highlightedActivities.some(activity => areActivitiesEqual(activity, subject));
  }
}
