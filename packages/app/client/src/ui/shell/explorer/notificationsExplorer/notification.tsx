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

import { beginRemove, Notification as NotificationType } from '@bfemulator/app-shared';
import { PrimaryButton } from '@bfemulator/ui-react';
import * as React from 'react';
import { connect } from 'react-redux';

import * as styles from './notification.scss';

export interface NotificationProps {
  notification?: NotificationType;
  removeNotification?: (id: string) => void;
}

class NotificationComp extends React.Component<NotificationProps, {}> {
  constructor(props: NotificationProps) {
    super(props);
  }

  public render(): JSX.Element {
    const { message = '', id = '' } = this.props.notification;
    const { removeNotification } = this.props;

    return (
      <li className={styles.notification}>
        <div className={styles.closeIcon} onClick={() => removeNotification(id)} />
        <p className={styles.notificationMessage}>{message}</p>
        {this.timestamp}
        {this.buttonRow}
        <div className={styles.innerBorder} />
      </li>
    );
  }

  /** Renders notification buttons */
  private get buttonRow(): JSX.Element {
    const { buttons = [] } = this.props.notification;
    if (buttons.length) {
      const renderedButtons = buttons.map((btn, i) => (
        <PrimaryButton key={`button${i}`} onClick={() => btn.onClick()} text={btn.text} />
      ));
      return <div className={styles.notificationButtonRow}>{renderedButtons}</div>;
    }
    return null;
  }

  /** Renders notification timestamp */
  private get timestamp(): JSX.Element {
    const { timestamp = null } = this.props.notification;
    if (timestamp) {
      const dateOptions = {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
      };
      return (
        <span className={styles.notificationTimestamp}>{new Date(timestamp).toLocaleString('en-US', dateOptions)}</span>
      );
    }
    return null;
  }
}

const mapDispatchToProps = (dispatch): NotificationProps => ({
  removeNotification: (id: string) => {
    dispatch(beginRemove(id));
  },
});

const mapStateToProps = (): NotificationProps => ({});

export const Notification = connect(mapStateToProps, mapDispatchToProps)(NotificationComp);
