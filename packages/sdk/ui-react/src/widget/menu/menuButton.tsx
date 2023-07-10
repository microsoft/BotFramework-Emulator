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

import { Menu, MenuOrientation } from './menu';
import { MenuItem } from './menuItem';

export interface MenuButtonProps {
  className?: string;
  id?: string;
  items: MenuItem[];
  key?: string;
  orientation?: MenuOrientation;
}

export interface MenuButtonState {
  menuShowing: boolean;
}

/* Button that will spawn a menu when clicked */
export class MenuButton extends React.Component<MenuButtonProps, MenuButtonState> {
  private static _id: number;
  private buttonRef: HTMLButtonElement;
  private menuButtonId: string;
  private restoreFocusAfterCompleted = false;
  private onBodyClickListener: () => void;
  private onMenuButtonExpandedListener: () => void;
  private onMenuItemSelectedListener: () => void;
  private onMenuItemActionCompletedListener: () => void;

  constructor(props: MenuButtonProps) {
    super(props);
    this.state = {
      menuShowing: false,
    };
    this.menuButtonId = MenuButton.id;
  }

  public static get id(): string {
    if (!this._id) {
      this._id = 0;
    }
    return `menu-btn-${this._id++}`;
  }

  public componentDidMount(): void {
    this.onBodyClickListener = this.onBodyClick.bind(this);
    this.onMenuItemSelectedListener = this.onMenuItemSelected.bind(this);
    this.onMenuButtonExpandedListener = this.onMenuButtonExpanded.bind(this);
    this.onMenuItemActionCompletedListener = this.onMenuItemActionCompleted.bind(this);
    document.body.addEventListener('click', this.onBodyClickListener);
    document.body.addEventListener('MenuItemSelected', this.onMenuItemSelectedListener);
    document.body.addEventListener('MenuButtonExpanded', this.onMenuButtonExpandedListener);
    document.body.addEventListener('MenuItemActionCompleted', this.onMenuItemActionCompletedListener);
  }

  public componentWillUnmount(): void {
    document.body.removeEventListener('click', this.onBodyClickListener);
    document.body.removeEventListener('MenuItemSelected', this.onMenuItemSelectedListener);
    document.body.removeEventListener('MenuButtonExpanded', this.onMenuButtonExpandedListener);
    document.body.removeEventListener('MenuItemActionCompleted', this.onMenuItemActionCompletedListener);
  }

  public render(): React.ReactNode {
    const { buttonRef, onButtonClick, setMenuShowing } = this;
    const { className, id, items = [], key, orientation } = this.props;
    const { menuShowing } = this.state;

    return (
      <>
        <button
          aria-haspopup={true}
          aria-expanded={menuShowing}
          className={className}
          key={`${key || 'menu-button-key'}-${this.menuButtonId}`}
          id={id || this.menuButtonId}
          ref={this.setWrapperRef}
          onClick={onButtonClick}
        >
          {this.props.children}
        </button>
        <Menu
          ariaLabelledBy={id || this.menuButtonId}
          anchorRef={buttonRef}
          items={items}
          key={`${key || 'menu-key'}-${this.menuButtonId}`}
          orientation={orientation}
          setMenuShowing={setMenuShowing}
          showing={menuShowing}
          topLevel={true}
        />
      </>
    );
  }

  private onButtonClick = (_event: React.MouseEvent<HTMLButtonElement>): void => {
    if (!this.state.menuShowing) {
      document.body.dispatchEvent(new CustomEvent('MenuButtonExpanded', { detail: this.menuButtonId }));
    }
    this.setMenuShowing(!this.state.menuShowing);
  };

  private setWrapperRef = (ref: HTMLButtonElement): void => {
    this.buttonRef = ref;
  };

  private setMenuShowing = (showing: boolean): void => {
    this.setState({ menuShowing: showing });
    if (!showing) {
      this.buttonRef.focus();
    }
  };

  private onMenuItemSelected(): void {
    if (this.state.menuShowing) {
      this.setMenuShowing(false);
    }
    this.restoreFocusAfterCompleted = document.activeElement === this.buttonRef;
  }

  private onMenuButtonExpanded(event: CustomEvent): void {
    if (this.menuButtonId !== event.detail) {
      // this is not the menu that was opened, so close it if it's open
      this.state.menuShowing && this.setState({ menuShowing: false });
    }
  }

  private onMenuItemActionCompleted(event: CustomEvent) {
    if (this.restoreFocusAfterCompleted && document.activeElement === document.body) {
      this.buttonRef.focus();
    }
    this.restoreFocusAfterCompleted = false;
  }

  private onBodyClick(event: React.MouseEvent<HTMLBodyElement>): void {
    const { id } = this.props;
    const target = event.target as HTMLElement;
    const idSelector = `ul#menu-of-${id || this.menuButtonId}`;
    // ignore clicks on the menu button, because those will be handled by onButtonClick()
    if (!target.closest(idSelector) && target.id !== (id || this.menuButtonId)) {
      // the click was outside of the menu
      this.setState({ menuShowing: false });
    }
  }
}
