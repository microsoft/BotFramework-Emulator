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

import * as styles from './tabManager.scss';

export interface TabManagerProps {
  disabled?: boolean;
  recentTabs?: string[];
  setActiveTab?: (tab: string) => void;
  window?: Window;
}

export interface TabManagerState {
  controlIsPressed: boolean;
  selectedIndex: number;
  shiftIsPressed: boolean;
  showing: boolean;
}

export class TabManager extends React.Component<TabManagerProps, TabManagerState> {
  private tabRefs: HTMLLIElement[] = [];

  constructor(props: TabManagerProps) {
    super(props);

    this.state = {
      controlIsPressed: false,
      selectedIndex: 0,
      shiftIsPressed: false,
      showing: false,
    };
  }

  public componentWillMount() {
    const { window } = this.props;
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
  }

  public componentWillUnmount() {
    const { window } = this.props;
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
  }

  public render() {
    return this.state.showing && !this.props.disabled ? (
      <div className={styles.tabManager}>
        <ul>
          {this.props.recentTabs.map((tabId, index) => {
            // TODO: Come up with a simple way to retrieve document
            // name from store using documentId
            const tabClassName = index === this.state.selectedIndex ? styles.selectedTab : '';
            return (
              <li className={tabClassName} ref={x => this.saveTabRef(x, index)} key={tabId} tabIndex={0}>
                {tabId}
              </li>
            );
          })}
        </ul>
      </div>
    ) : null;
  }

  private saveTabRef = (element: HTMLLIElement, index: number) => {
    this.tabRefs[index] = element;
  };

  private onKeyDown = (e: KeyboardEvent) => {
    if (!this.props.recentTabs.length) {
      return;
    }

    switch (e.key) {
      case 'ArrowUp':
        if (this.state.showing) {
          this.setState({ selectedIndex: this.moveIndexUp() });
        }
        break;

      case 'ArrowDown':
        if (this.state.showing) {
          this.setState({ selectedIndex: this.moveIndexDown() });
        }
        break;

      case 'Control':
        this.setState({ controlIsPressed: true });
        break;

      case 'Tab':
        if (this.state.controlIsPressed) {
          if (this.state.showing && !this.state.shiftIsPressed) {
            this.setState({ selectedIndex: this.moveIndexDown() });
          } else if (this.state.showing && this.state.shiftIsPressed) {
            this.setState({ selectedIndex: this.moveIndexUp() });
          } else {
            this.setState({ showing: true, selectedIndex: 0 });
          }
        }
        break;

      case 'Shift':
        this.setState({ shiftIsPressed: true });
        break;

      default:
        break;
    }

    if (this.tabRefs[this.state.selectedIndex]) {
      this.tabRefs[this.state.selectedIndex].focus();
    }
  };

  private onKeyUp = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'Control':
        if (this.state.showing) {
          this.setState({ controlIsPressed: false, showing: false });
          this.props.setActiveTab(this.props.recentTabs[this.state.selectedIndex]);
        } else {
          this.setState({ controlIsPressed: false });
        }
        break;

      case 'Shift':
        this.setState({ shiftIsPressed: false });
        break;

      default:
        break;
    }
  };

  private moveIndexDown() {
    return this.state.selectedIndex === this.props.recentTabs.length - 1 ? 0 : this.state.selectedIndex + 1;
  }

  private moveIndexUp() {
    return this.state.selectedIndex === 0 ? this.props.recentTabs.length - 1 : this.state.selectedIndex - 1;
  }
}
