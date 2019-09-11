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
  showing?: boolean;
}

export class DialogHost extends React.Component<DialogHostProps, {}> {
  private hostRef: React.RefObject<any>;

  constructor(props) {
    super(props);

    this.hostRef = React.createRef();
  }

  public componentDidMount() {
    this.hostRef.current && this.hostRef.current.addEventListener('dialogRendered', this.initFocusTrap);
    DialogService.setHost(this.hostRef.current);
  }

  public componentWillUnmount() {
    this.hostRef.current && this.hostRef.current.removeEventListener('dialogRendered', this.initFocusTrap);
  }

  public render() {
    const { showing } = this.props;
    const visibilityClass = showing ? styles.dialogHostVisible : '';
    // sentinels shouldn't be tab-able when dialog is hidden
    const sentinelTabIndex = showing ? 0 : -1;

    return (
      <div aria-hidden={!showing} className={`${styles.host} ${visibilityClass}`} onClick={this.handleOverlayClick}>
        <span tabIndex={sentinelTabIndex} onFocus={this.onFocusStartingSentinel} className={styles.focusSentinel} />
        <div className={styles.dialogHostContent} onClick={this.handleContentClick} ref={this.hostRef} />
        <span tabIndex={sentinelTabIndex} onFocus={this.onFocusEndingSentinel} className={styles.focusSentinel} />
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

  private getFocusableElementsInModal = (): any[] => {
    if (this.hostRef.current) {
      const result = [].filter.call(
        this.hostRef.current.querySelectorAll('*'),
        element => this.getTabIndex(element) !== -1 && !element.hasAttribute('disabled')
      );

      return result;
    }
    return [];
  };

  private getTabIndex(element) {
    const { tabIndex } = element;
    if (tabIndex === -1) {
      const attr = element.getAttribute('tabindex');
      if (attr === null) {
        return -1;
      }
    }

    return tabIndex;
  }

  private initFocusTrap = () => {
    const allFocusableElements = this.getFocusableElementsInModal();
    if (allFocusableElements.length) {
      const firstElement: HTMLElement = allFocusableElements[1] as HTMLElement;
      firstElement && firstElement.focus();
    }
  };

  // Reached beginning of focusable items inside the modal host; re-focus the last item
  private onFocusStartingSentinel = (e: SyntheticEvent<any>) => {
    e.preventDefault();

    const allFocusableElements = this.getFocusableElementsInModal();
    const lastElement = allFocusableElements.pop();

    lastElement && lastElement.focus();
  };

  // Reached end of focusable items inside the modal host; re-focus the first item
  private onFocusEndingSentinel = (e: SyntheticEvent<any>) => {
    e.preventDefault();

    const allFocusableElements = this.getFocusableElementsInModal();
    const firstElement = allFocusableElements[0];

    firstElement && firstElement.focus();
  };
}
