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
import { Component, ReactNode } from 'react';
import { Activity } from '@bfemulator/sdk-shared';

import * as styles from './chat.scss';

interface ActivityWrapperProps {
  activity: Activity;
  children: ReactNode;
  isSelected: boolean;
  onClick: (activity: Activity) => void;
}

// Returns false if the event target is normally an interactive element.
function shouldSelectActivity(e: React.SyntheticEvent): boolean {
  // recurse on currentNode.parentElement until chatActivity is reached
  let currentNode = e.target as HTMLElement;
  const interactiveElements = ['button', 'a'];

  while (!currentNode.classList.contains(styles.chatActivity)) {
    if (interactiveElements.includes(currentNode.tagName.toLowerCase())) {
      return false;
    }

    currentNode = currentNode.parentElement;
  }

  return true;
}

class ActivityWrapper extends Component<ActivityWrapperProps> {
  render() {
    const { activity, children, isSelected } = this.props;
    let classes = styles.chatActivity;

    if (isSelected) {
      classes = `${ classes } ${ styles.selectedActivity }`;
    }

    return (
      <div
        className={ classes }
        onClick={ this.setSelectedActivity(activity) }
        onKeyDown={ this.onKeyDown(activity) }
        role="button"
        tabIndex={ 0 }
      >
        { children }
      </div>
    );
  }

  private setSelectedActivity = (activity: Activity) => (e: React.SyntheticEvent) => {
    if (shouldSelectActivity(e)) {
      this.props.onClick(activity);
    }
  }

  private onKeyDown = (activity: Activity) => (e: React.KeyboardEvent) => {
    if (shouldSelectActivity(e) && [' ', 'Enter'].includes(e.key)) {
      this.props.onClick(activity);
    }
  }
}

export default ActivityWrapper;
