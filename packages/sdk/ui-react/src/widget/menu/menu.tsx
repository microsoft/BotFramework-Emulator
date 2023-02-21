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
import * as ReactDOM from 'react-dom';

import * as styles from './menu.scss';
import { MenuItem, MenuItemComp } from './menuItem';
import { SubMenu } from './subMenu';

export type MenuOrientation = 'below' | 'toRight';

export interface MenuProps {
  anchorRef?: HTMLElement;
  ariaLabelledBy?: string;
  items: MenuItem[];
  orientation?: MenuOrientation;
  setMenuShowing: (showing: boolean) => void;
  showing?: boolean;
  topLevel?: boolean;
}

export interface MenuState {
  focusedIndex: number;
}

/** Menu that can be top-level, or spawned by a SubMenu */
export class Menu extends React.Component<MenuProps, MenuState> {
  constructor(props: MenuProps) {
    super(props);
    this.state = {
      focusedIndex: 0,
    };
  }

  public render(): React.ReactNode {
    const { ariaLabelledBy = '', items = [], showing, topLevel } = this.props;

    if (!showing) {
      return null;
    }

    const menuContent = (
      <ul
        aria-labelledby={ariaLabelledBy}
        className={styles.menu}
        id={`menu-of-${ariaLabelledBy}`}
        onKeyDown={this.onKeyDown}
        role="menu"
        style={this.menuPosition}
      >
        {items.map((item, index) => {
          if (item.type === 'submenu') {
            return (
              <SubMenu
                key={index}
                disabled={item.disabled}
                focusHandler={this.checkRefForFocus}
                index={index}
                items={item.items}
                label={item.label}
              />
            );
          } else {
            return <MenuItemComp key={index} focusHandler={this.checkRefForFocus} index={index} {...item} />;
          }
        })}
      </ul>
    );

    if (topLevel) {
      return ReactDOM.createPortal(menuContent, document.body);
    } else {
      return menuContent;
    }
  }

  private get menuPosition() {
    const { anchorRef, orientation = 'below' } = this.props;
    if (anchorRef) {
      const domRect = anchorRef.getBoundingClientRect();
      if (orientation === 'below') {
        const top = domRect.bottom;
        const left = domRect.left;
        return { top, left };
      } else {
        const top = domRect.top + 8;
        const left = domRect.right;
        return { top, left };
      }
    }
    return undefined;
  }

  private focusPreviousItem(): void {
    const { items = [] } = this.props;
    const numItems = items.length;
    const focusableItems = items.filter(item => item.type !== 'separator');
    if (!numItems || !focusableItems.length) {
      // nothing to focus
      return;
    }
    // search for the previous focusable item and focus it
    const { focusedIndex } = this.state;
    let index = focusedIndex;
    let foundItem;
    while (!foundItem) {
      if (index === 0) {
        // start from the back of the array
        index = numItems - 1;
      } else {
        // start from the current index
        --index;
      }
      if (items[index].type !== 'separator') {
        foundItem = true;
      }
    }
    this.setState({ focusedIndex: index });
  }

  private focusNextItem(): void {
    const { items = [] } = this.props;
    const numItems = items.length;
    const focusableItems = items.filter(item => item.type !== 'separator');
    if (!numItems || !focusableItems.length) {
      // nothing to focus
      return;
    }
    // search for the next focusable item and focus it
    const { focusedIndex } = this.state;
    let index = focusedIndex;
    let foundItem;
    while (!foundItem) {
      if (index === numItems - 1) {
        // start from the front of the array
        index = 0;
      } else {
        // start from the current index
        ++index;
      }
      if (items[index].type !== 'separator') {
        foundItem = true;
      }
    }
    this.setState({ focusedIndex: index });
  }

  private checkRefForFocus = (index: number) => (ref: HTMLLIElement): void => {
    if (ref && index === this.state.focusedIndex) {
      ref.focus();
    }
  };

  private onKeyDown = (event: React.KeyboardEvent<HTMLUListElement>): void => {
    let { key = '' } = event;
    key = key.toLowerCase();

    switch (key) {
      case 'arrowdown':
        event.stopPropagation();
        this.focusNextItem();
        break;

      case 'arrowup':
        event.stopPropagation();
        this.focusPreviousItem();
        break;

      case 'escape':
        // don't want hiding a submenu to hide a top-level menu
        event.stopPropagation();
        this.hideMenu();
        break;

      case 'enter':
        // let selecting an option bubble up to parent menu
        if (this.props.topLevel) {
          // don't let the click bubble up to the button or the menu will reopen
          event.preventDefault();
        }
        this.hideMenu();
        break;

      case 'tab':
        if (event.shiftKey) {
          // hideMenu() already re-focuses the menu button,
          // so we want to prevent the default behavior which
          // would shift focus to whatever is before the menu button
          event.preventDefault();
        }
        this.hideMenu();
        break;

      default:
        break;
    }
  };

  private hideMenu(): void {
    if (this.props.anchorRef) {
      this.props.anchorRef.focus();
    }
    this.props.setMenuShowing(false);
  }
}
