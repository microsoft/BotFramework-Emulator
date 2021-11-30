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
import { SyntheticEvent } from 'react';

import * as Constants from '../../../constants';
import { NotificationManager } from '../../../notificationManager';

import * as styles from './navBar.scss';

export interface NavBarProps {
  selection?: string;
  showExplorer?: (show: boolean) => void;
  navBarSelectionChanged?: (selection: string) => void;
  openEmulatorSettings?: () => void;
  notifications?: string[];
  explorerIsVisible?: boolean;
  botIsOpen?: boolean;
  trackEvent?: (name: string, properties?: { [key: string]: any }) => void;
}

export interface NavBarState {
  selection?: string;
}

const selectionMap = [
  Constants.NAVBAR_BOT_EXPLORER,
  Constants.NAVBAR_RESOURCES,
  Constants.NAVBAR_NOTIFICATIONS,
  Constants.NAVBAR_SETTINGS,
  Constants.NAVBAR_NGROK_DEBUGGER,
];

export class NavBarComponent extends React.Component<NavBarProps, NavBarState> {
  public state: NavBarState = {};

  constructor(props: NavBarProps, context: NavBarState) {
    super(props, context);
    this.state.selection = props.selection;
  }

  public render() {
    return <nav className={styles.navBar}>{this.links}</nav>;
  }

  public onLinkClick = (event: SyntheticEvent<HTMLButtonElement>): void => {
    const { selection: currentSelection, explorerIsVisible } = this.props;
    const { currentTarget: anchor } = event;
    const index = Array.prototype.indexOf.call(anchor.parentElement.children, anchor);
    switch (index) {
      // 0: Bot Explorer
      // 1: Resources
      // 2: Notifications
      case 0:
      // Falls through

      case 1:
      // Falls through

      case 2:
        if (currentSelection === selectionMap[index]) {
          // toggle explorer when clicking the same navbar icon
          const showExplorer = !explorerIsVisible;
          this.props.showExplorer(showExplorer);
        } else {
          // switch tabs and showExplorer explorer when clicking different navbar icon
          this.props.showExplorer(true);
          if (index === 2) {
            this.props.trackEvent('navbar_selection', {
              selection: 'notifications',
            });
          }
          this.props.navBarSelectionChanged(selectionMap[index]);
          this.setState({ selection: selectionMap[index] });
        }
        break;
      default:
        this.props.openEmulatorSettings();
        break;
    }
  };

  private get links(): JSX.Element[] {
    const { selection } = this.state;
    const { explorerIsVisible, botIsOpen = false } = this.props;

    return ['Bot Explorer', 'Resources', 'Notifications', 'Settings'].map((title, index) => {
      return (
        <button
          aria-selected={explorerIsVisible && selection === selectionMap[index]}
          title={title}
          className={styles.navLink}
          key={index}
          disabled={!botIsOpen && index === 1}
          onClick={this.onLinkClick}
        >
          <div />
          {this.renderNotificationBadge(title)}
          {this.renderKeyboardTooltip(title)}
        </button>
      );
    });
  }

  /** Renders a circular counter badge in the corner of the notification icon */
  private renderNotificationBadge(navSelection: string): JSX.Element {
    if (navSelection === 'Notifications') {
      const { notifications } = this.props;
      const numUnreadNotifications = notifications
        .map(notificationId => NotificationManager.get(notificationId))
        .map(notification => notification.read)
        .filter(notificationHasBeenRead => !notificationHasBeenRead).length;

      return numUnreadNotifications ? <span className={styles.badge}>{numUnreadNotifications}</span> : null;
    }
    return null;
  }

  /** Renders a tooltip for keyboard navigation */
  private renderKeyboardTooltip(title: string): JSX.Element {
    return <span>{title}</span>;
  }
}
