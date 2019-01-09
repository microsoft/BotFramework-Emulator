import * as React from 'react';
import { Component, ReactNode } from 'react';
import { Activity } from '@bfemulator/sdk-shared';

import * as styles from './chat.scss';

interface ActivityWrapperProps {
  children: ReactNode;
  activity: any;
  isSelected: boolean;
  onClick: (activity: Activity) => void;
}

class ActivityWrapper extends Component<ActivityWrapperProps> {
  render() {
    const { activity, children, isSelected } = this.props;
    let classes = styles.chatActivity;

    if (isSelected) {
      classes = `${classes} ${styles.selectedActivity}`;
    }

    // TODO: aria-label?
    return (
      <div
      className={ classes }
      onClick={this.setSelectedActivity(activity)}
      tabIndex={0}
      onKeyDown={this.onKeyDown(activity)}
      >
        { children }
      </div>
    );
  }

  private setSelectedActivity = (activity: Activity) => () => {
    this.props.onClick(activity);
  }

  private onKeyDown = (activity: Activity) => (e: React.KeyboardEvent) => {
    switch (e.key) {
      case ' ':
      case 'Enter':
        this.props.onClick(activity);
        return;
      default:
        return;
    }
  }
}

export default ActivityWrapper;
