import * as React from 'react';
import { Component, ReactNode } from 'react';

import * as styles from './chat.scss';

interface ActivityWrapperProps {
  children: ReactNode;
  activity: any;
  isSelected: boolean;
  onClick: (activity: any) => void;
}

class ActivityWrapper extends Component<ActivityWrapperProps> {
  setSelectedActivity = (activity) => () => {
    const { onClick } = this.props;

    onClick(activity);
  }

  handleKeyDown = (activity) => (e: React.KeyboardEvent) => {
    const { onClick } = this.props;

    switch (e.key) {
      case ' ':
      case 'Enter':
        onClick(activity);
        return;
      default:
        return;
    }
  }

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
        onKeyDown={this.handleKeyDown(activity)}
      >
        { children }
      </div>
    );
  }
}

export default ActivityWrapper;
