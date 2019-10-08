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

import * as styles from './menu.scss';
import { Menu } from './menu';
import { MenuItem } from './menuItem';

export interface SubMenuProps {
  disabled?: boolean;
  focusHandler: (index: number) => (ref: HTMLLIElement) => void;
  index: number;
  items: MenuItem[];
  label: string;
}

export interface SubMenuState {
  menuShowing: boolean;
}

/** Represents a menu item that also opens a menu when hovered over */
export class SubMenu extends React.Component<SubMenuProps, SubMenuState> {
  private static _id: number;
  private subMenuButtonId: string;

  constructor(props: SubMenuProps) {
    super(props);
    this.state = {
      menuShowing: false,
    };
    this.subMenuButtonId = SubMenu.id;
  }

  public static get id(): string {
    if (!this._id) {
      this._id = 0;
    }
    return `sub-menu-btn-${this._id++}`;
  }

  public render(): React.ReactNode {
    const { disabled, focusHandler, index, items, label = '' } = this.props;
    const { menuShowing } = this.state;
    // if the submenu is showing, temporarily disable focus management in parent menu
    const ref = menuShowing ? undefined : focusHandler(index);

    return (
      <li
        aria-expanded={menuShowing}
        aria-haspopup={true}
        aria-label={`${label}${disabled ? ' unavailable' : ''}`}
        className={`${styles.menuItem} ${disabled ? styles.disabled : ''}`}
        id={this.subMenuButtonId}
        onKeyDown={this.onKeyDown}
        onMouseEnter={this.onMouseEnter}
        onMouseLeave={this.onMouseLeave}
        ref={ref}
        role="menuitem"
        tabIndex={-1}
      >
        {label}
        <span className={styles.submenuCaret} role="presentation" />
        <Menu
          ariaLabelledBy={this.subMenuButtonId}
          items={items}
          setMenuShowing={this.setMenuShowing}
          showing={this.state.menuShowing}
        />
      </li>
    );
  }

  private onKeyDown = (event: React.KeyboardEvent<HTMLLIElement>): void => {
    let { key } = event;
    key = key.toLowerCase();

    switch (key) {
      case 'arrowright':
      case 'enter':
        // TODO: Would be nice to avoid using stopPropagation()
        event.stopPropagation();
        event.preventDefault();
        if (!this.props.disabled) {
          this.setMenuShowing(true);
        }
        break;

      case 'arrowleft':
      case 'escape':
        if (this.state.menuShowing) {
          event.stopPropagation();
          this.setMenuShowing(false);
        }
        break;

      default:
        break;
    }
  };

  private onMouseEnter = (): void => {
    if (!this.props.disabled) {
      this.setMenuShowing(true);
    }
  };

  private onMouseLeave = (): void => {
    this.setMenuShowing(false);
  };

  private setMenuShowing = (showing: boolean): void => {
    this.setState({ menuShowing: showing });
  };
}
