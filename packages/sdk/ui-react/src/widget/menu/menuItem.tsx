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

import { getMenuItemAria } from '../../utils';

import * as styles from './menu.scss';

type MenuItemType = 'default' | 'submenu' | 'separator';

export interface MenuItem {
  checked?: boolean;
  disabled?: boolean;
  items?: MenuItem[];
  label?: string;
  onClick?: () => void;
  subtext?: string;
  type?: MenuItemType;
}

export interface MenuItemProps extends MenuItem {
  focusHandler: (index: number) => (ref: HTMLLIElement) => void;
  index: number;
}

/** Basic menu item (Default / Separator) */
export class MenuItemComp extends React.Component<MenuItemProps, Record<string, unknown>> {
  public render(): React.ReactNode {
    const { checked, disabled, focusHandler, index, label, subtext, type = 'default' } = this.props;

    switch (type) {
      case 'separator':
        return <li className={styles.menuSeparator}></li>;

      default:
        return (
          <li
            {...getMenuItemAria({ text: label, subtext, disabled, checked })}
            className={`${styles.menuItem} ${disabled ? styles.disabled : ''}`}
            onClick={this.onClick}
            onKeyDown={this.onKeyDown}
            ref={focusHandler(index)}
            role="menuitem"
            tabIndex={-1}
          >
            {checked && <span className={styles.menuItemCheck} role="presentation" />}
            {label}
            {subtext && <span className={styles.menuItemSubtext}>{subtext}</span>}
          </li>
        );
    }
  }

  private handleClick = async event => {
    const { disabled, onClick } = this.props;
    if (!disabled && onClick) {
      document.body.dispatchEvent(new Event('MenuItemSelected'));
      const result: unknown = onClick();
      await result;
      document.body.dispatchEvent(new CustomEvent('MenuItemActionCompleted'));
    }
  };

  private onClick = (event: React.MouseEvent<HTMLLIElement>): void => {
    this.handleClick(event);
  };

  private onKeyDown = (event: React.KeyboardEvent<HTMLLIElement>): void => {
    let { key } = event;
    key = key.toLowerCase();

    if (key === 'enter') {
      event.preventDefault();
      event.stopPropagation();
      this.handleClick(event);
    }
  };
}
