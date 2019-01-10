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

class ActivityWrapper extends Component<ActivityWrapperProps> {
  render() {
    const { activity, children, isSelected } = this.props;
    let classes = styles.chatActivity;

    if (isSelected) {
      classes = `${ classes } ${ styles.selectedActivity }`;
    }

    // TODO: more a11y (role, selected, etc)
    return (
      <div
        className={ classes }
        onClick={ this.setSelectedActivity(activity) }
        onKeyDown={ this.onKeyDown(activity) }
        tabIndex={ 0 }
      >
        { children }
      </div>
    );
  }

  private setSelectedActivity = (activity: Activity) => () => {
    this.props.onClick(activity);
  }

  private onKeyDown = (activity: Activity) => (e: React.KeyboardEvent) => {
    if ([' ', 'Enter'].includes(e.key)) {
      this.props.onClick(activity);
    }
  }
}

export default ActivityWrapper;
