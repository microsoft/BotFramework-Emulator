import * as React from 'react';
import { Component, ReactNode } from 'react';
import { Activity } from '@bfemulator/sdk-shared';

import * as styles from './chat.scss';

interface ActivityWrapperProps {
  activity: any;
  children: ReactNode;
  isSelected: boolean;
  onClick: (activity: Activity) => void;
}

// Returns false if the event target is normally an interactive element.
export function shouldSelectActivity(e: React.SyntheticEvent): boolean {
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
