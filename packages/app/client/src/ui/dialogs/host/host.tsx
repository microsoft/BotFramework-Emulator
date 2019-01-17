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
import { EventHandler, SyntheticEvent } from 'react';

import { DialogService } from '../service';

import * as styles from './host.scss';

export interface DialogHostProps {
  saveHostRef?: (elem: HTMLElement) => void;
  showing?: boolean;
}

export class DialogHost extends React.Component<DialogHostProps, {}> {
  private _hostRef: HTMLElement;

  constructor(props: DialogHostProps) {
    super(props);
  }

  public componentDidMount() {
    this._hostRef.addEventListener('dialogRendered', this.initFocusTrap);
  }

  public componentWillUnmount() {
    this._hostRef.removeEventListener('dialogRendered', this.initFocusTrap);
  }

  public render() {
    const visibilityClass = this.props.showing ? styles.dialogHostVisible : '';
    // sentinels shouldn't be tab-able when dialog is hidden
    const sentinelTabIndex = this.props.showing ? 0 : -1;

    return (
      <div
        className={`${styles.host} ${visibilityClass}`}
        onClick={this.handleOverlayClick}
      >
        <span
          tabIndex={sentinelTabIndex}
          onFocus={this.onFocusStartingSentinel}
          className={styles.focusSentinel}
        />
        <div
          className={styles.dialogHostContent}
          onClick={this.handleContentClick}
          ref={this.saveHostRef}
        />
        <span
          tabIndex={sentinelTabIndex}
          onFocus={this.onFocusEndingSentinel}
          className={styles.focusSentinel}
        />
      </div>
    );
  }

  private handleOverlayClick: EventHandler<any> = (event: MouseEvent) => {
    event.stopPropagation();
    DialogService.hideDialog();
  };

  private handleContentClick: EventHandler<any> = (event: MouseEvent) => {
    // need to stop clicks inside the dialog from bubbling up to the overlay
    event.stopPropagation();
  };

  private saveHostRef = (elem: HTMLElement) => {
    DialogService.setHost(elem);
    this._hostRef = elem;
  };

  private getFocusableElementsInModal = (): NodeList => {
    if (this._hostRef) {
      return this._hostRef.querySelectorAll('[tabIndex]:not([tabIndex="-1"])');
    }
    return new NodeList();
  };

  private initFocusTrap = () => {
    const allFocusableElements = this.getFocusableElementsInModal();
    if (allFocusableElements.length) {
      const firstChild: HTMLElement = allFocusableElements[0] as HTMLElement;
      firstChild.focus();
    }
  };

  // Reached beginning of focusable items inside the modal host; re-focus the last item
  private onFocusStartingSentinel = (e: SyntheticEvent<any>) => {
    e.preventDefault();

    const allFocusableElements = this.getFocusableElementsInModal();
    if (allFocusableElements.length) {
      let lastChild: HTMLElement = allFocusableElements[
        allFocusableElements.length - 1
      ] as HTMLElement;

      if (lastChild.hasAttribute('disabled')) {
        // focus the last element in the list that isn't disabled
        for (let i = allFocusableElements.length - 2; i >= 0; i--) {
          lastChild = allFocusableElements[i] as HTMLElement;
          if (!lastChild.hasAttribute('disabled')) {
            lastChild.focus();
            break;
          }
        }
      } else {
        lastChild.focus();
      }
    }
  };

  // Reached end of focusable items inside the modal host; re-focus the first item
  private onFocusEndingSentinel = (e: SyntheticEvent<any>) => {
    e.preventDefault();

    const allFocusableElements = this.getFocusableElementsInModal();
    if (allFocusableElements.length) {
      let firstChild: HTMLElement = allFocusableElements[0] as HTMLElement;

      if (firstChild.hasAttribute('disabled')) {
        // focus the first element in the list that isn't disabled
        for (let i = 1; i <= allFocusableElements.length - 1; i++) {
          firstChild = allFocusableElements[i] as HTMLElement;
          if (!firstChild.hasAttribute('disabled')) {
            firstChild.focus();
            break;
          }
        }
      } else {
        firstChild.focus();
      }
    }
  };
}
