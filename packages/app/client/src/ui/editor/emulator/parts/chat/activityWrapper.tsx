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
import { Component, HTMLAttributes, KeyboardEvent, MouseEvent, ReactNode } from 'react';
import { Activity } from 'botframework-schema';
import { LinkButton } from '@bfemulator/ui-react';

import * as styles from './chat.scss';

interface ActivityWrapperProps extends HTMLAttributes<HTMLDivElement> {
  activity: Activity;
  children: ReactNode;
  isSelected: boolean;
  onRestartConversationFromActivityClick: () => void;
  showRestartBubble: boolean;
}

// Returns false if the event target is normally an interactive element.
function shouldSelectActivity(e: React.SyntheticEvent): boolean {
  // recurse on currentNode.parentElement until chatActivity is reached
  let currentNode = e.target as HTMLElement;
  const interactiveElements = { BUTTON: true, A: true };

  while (currentNode.parentElement && !currentNode.classList.contains(styles.chatActivity)) {
    if (interactiveElements[currentNode.tagName]) {
      return false;
    }

    currentNode = currentNode.parentElement;
  }

  return true;
}

export class ActivityWrapper extends Component<ActivityWrapperProps> {
  render() {
    const { activity: _, children, isSelected, showRestartBubble, ...divProps } = this.props;
    let classes = styles.chatActivity;
    const restartConversationBubble = (
      <div className={[styles.replayBubble, showRestartBubble ? '' : styles.hidden].join(' ')}>
        <LinkButton ariaLabel="Restart conversation from here." linkRole={false} onClick={this.replayConversation}>
          Restart conversation from here
        </LinkButton>
      </div>
    );

    if (isSelected) {
      classes = `${classes} ${styles.selectedActivity}`;
    }

    return (
      <div
        {...divProps}
        aria-checked={isSelected}
        className={classes}
        onClick={this.setSelectedActivity}
        onKeyDown={this.onKeyDown}
        role="region"
        tabIndex={0}
        title={'activity'}
      >
        {children}
        {restartConversationBubble}
      </div>
    );
  }

  private replayConversation = () => {
    this.props.onRestartConversationFromActivityClick();
  };

  private setSelectedActivity = (e: MouseEvent<HTMLDivElement>) => {
    if (shouldSelectActivity(e)) {
      this.props.onClick(e);
    }
  };

  private onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (shouldSelectActivity(e) && [' ', 'Enter'].includes(e.key)) {
      this.props.onKeyDown(e);
    }
  };
}
