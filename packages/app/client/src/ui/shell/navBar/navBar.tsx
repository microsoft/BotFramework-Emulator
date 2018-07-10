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
import { IBotConfig } from 'msbot/bin/schema';
import * as styles from './navBar.scss';
import * as Constants from '../../../constants';

export interface NavBarProps {
  activeBot?: IBotConfig;
  selection?: string;
  showBotExplorer?: (show: boolean) => void;
  navBarSelectionChanged?: (newSection: string) => void;
  openBotSettings?: () => void;
  openEmulatorSettings?: () => void;
}

export interface NavBarState {
  selection?: string;
  selectionActive?: boolean;
}

const selectionMap = [
  Constants.NAVBAR_BOT_EXPLORER,
  Constants.NAVBAR_SERVICES
];

export class NavBarComponent extends React.Component<NavBarProps, NavBarState> {
  state: NavBarState = {};

  constructor(props: NavBarProps, context: NavBarState) {
    super(props, context);
    this.state.selection = props.selection;
    this.state.selectionActive = !!props.selection;
  }

  render() {
    return (
      <nav className={ styles.navBar }>
        { ...this.links }
      </nav>
    );
  }

  public onLinkClick = (event: SyntheticEvent<HTMLAnchorElement>): void => {
    const { selection: currentSelection } = this.props;
    const { currentTarget: anchor } = event;
    const index = Array.prototype.indexOf.call(anchor.parentElement.children, anchor);
    switch (index) {
      // Bot Explorer
      case 0:
      // Services
      case 1:
        if (currentSelection === selectionMap[index]) {
          // toggle explorer when clicking the same navbar icon
          this.props.showBotExplorer(!this.state.selectionActive);
          this.setState({ selectionActive: !this.state.selectionActive });
        } else {
          // switch tabs and show explorer when clicking different navbar icon
          this.props.showBotExplorer(true);
          this.props.navBarSelectionChanged(selectionMap[index]);
          this.setState({ selection: selectionMap[index], selectionActive: true });
        }
        break;

      // Bot Settings
      case 2:
        if (this.props.activeBot) {
          this.props.openBotSettings();
        }
        break;

      // Settings
      default:
        this.props.openEmulatorSettings();
        break;
    }
  }

  private get links(): JSX.Element[] {
    const { selectionActive, selection } = this.state;
    return [
      'Bot Explorer',
      'Services',
      'Bot Settings',
      'Settings'
    ].map((title, index) => {
      return (
        <a
          aria-selected={ selectionActive && selection === selectionMap[index] }
          key={ index }
          href="javascript:void(0);"
          title={ title }
          className={ styles.navLink }
          onClick={ this.onLinkClick }/>
      );
    });
  }
}
