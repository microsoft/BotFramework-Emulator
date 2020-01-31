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
import { connect } from 'react-redux';
import { LinkButton } from '@bfemulator/ui-react';
import { beginClear } from '@bfemulator/app-shared';

import { RootState } from '../../../../state/store';
import { NotificationManager } from '../../../../notificationManager';

import { Notification } from './notification';
import * as styles from './notificationsExplorer.scss';

interface NotificationExplorerProps {
  notifications?: string[];
  clearNotifications?: () => void;
}

class NotificationsExplorerComp extends React.Component<NotificationExplorerProps, {}> {
  constructor(props: NotificationExplorerProps) {
    super(props);
  }

  public render() {
    const { notifications = [] } = this.props;
    const clearAllButton = notifications.length ? this.renderClearAllButton() : null;

    // max-height: 100% of explorer pane - 20px (Clear all button height) - 40px (Explorer title height)
    return (
      <>
        {clearAllButton}
        <ul className={styles.notificationsExplorer}>
          {notifications.length ? (
            notifications.map(n => {
              const notification = NotificationManager.get(n);
              return <Notification key={notification.id} notification={notification} />;
            })
          ) : (
            <p className={styles.noNotificationsMsg}>No new notifications.</p>
          )}
        </ul>
      </>
    );
  }

  private renderClearAllButton = (): JSX.Element => {
    return (
      <LinkButton className={styles.clearAllNotificationsBtn} onClick={() => this.props.clearNotifications()}>
        Clear all
      </LinkButton>
    );
  };
}

const mapStateToProps = (state: RootState): NotificationExplorerProps => {
  return {
    notifications: state.notification.allIds,
  };
};

const mapDispatchToProps = (dispatch): NotificationExplorerProps => {
  return {
    clearNotifications: () => {
      dispatch(beginClear());
    },
  };
};

export const NotificationsExplorer = connect(mapStateToProps, mapDispatchToProps)(NotificationsExplorerComp);
