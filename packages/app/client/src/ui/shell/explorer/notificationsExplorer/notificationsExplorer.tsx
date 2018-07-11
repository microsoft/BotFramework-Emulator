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
import { RootState } from '../../../../data/store';
import { Notification } from './notification';
import { NotificationManager } from '../../../../notificationManager';
import * as NotificationActions from '../../../../data/action/notificationActions';
import { Colors } from '@bfemulator/ui-react';
import { css } from 'glamor';

const CSS = css({
  padding: 0,
  maxHeight: 'calc(100% - 60px)',
  overflowY: 'auto',
  margin: 0
});

interface NotificationExplorerProps {
  notifications?: string[];
  clearNotifications?: () => void;
}

class NotificationsExplorerComp extends React.Component<NotificationExplorerProps, {}> {
  private _notificationManager: NotificationManager;

  constructor(props: NotificationExplorerProps) {
    super(props);
    this._notificationManager = NotificationManager.getInstance();
  }

  render() {
    const { notifications = [] } = this.props;
    const clearAllButton = notifications.length ? this.renderClearAllButton() : null;

    // max-height: 100% of explorer pane - 20px (Clear all button height) - 40px (Explorer title height)
    return (
      <>
        <ul { ...CSS }>
          {
            notifications.map(n => {
              const notification = this._notificationManager.notificationStore[n];
              return <Notification key={ notification.id } notification={ notification } />;
            })
          }
        </ul>
        { clearAllButton }
      </>
    );
  }

  private renderClearAllButton = (): JSX.Element => {
    const clearCss = css({
      display: 'block',
      textAlign: 'right',
      marginRight: '8px',
      minWidth: 0,
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      textDecoration: 'none',
      color: Colors.APP_HYPERLINK_FOREGROUND_DARK,

      ':hover': {
        color: Colors.APP_HYPERLINK_FOREGROUND_DARK
      }
    });

    return <a { ...clearCss }
              onClick={ () => this.props.clearNotifications() }
              href="javascript:void(0);">
              Clear all
            </a>;
  }
}

const mapStateToProps = (state: RootState): NotificationExplorerProps => {
  return {
    notifications: state.notification.allIds
  };
};

const mapDispatchToProps = (dispatch): NotificationExplorerProps => {
  return {
    clearNotifications: () => { dispatch(NotificationActions.beginClear()); }
  };
};

export const NotificationsExplorer = connect(mapStateToProps, mapDispatchToProps)(NotificationsExplorerComp);
