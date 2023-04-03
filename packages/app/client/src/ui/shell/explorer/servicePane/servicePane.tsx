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

import { ExpandCollapse, ExpandCollapseContent, ExpandCollapseControls } from '@bfemulator/ui-react';
import { IConnectedService } from 'botframework-config/lib/schema';
import * as React from 'react';
import { Component, SyntheticEvent } from 'react';

import * as styles from './servicePane.scss';

export interface ServicePaneProps extends ServicePaneState {
  openContextMenuForService: (service: IConnectedService, ...rest: any[]) => void;
  window: Window;
  title?: string;
  ariaLabel?: string;
  sortCriteria?: string;
  role?: string;
  elementRefHandler?: (ref: HTMLElement) => void;
}

export interface ServicePaneState {
  expanded?: boolean;
  sortCriteriaChanged?: boolean;
}

/* eslint-disable react/display-name */
export abstract class ServicePane<
  T extends ServicePaneProps,
  S extends ServicePaneState = ServicePaneState
> extends Component<T, S> {
  protected addIconButtonRef: HTMLButtonElement;
  protected sortIconButtonRef: HTMLButtonElement;

  protected abstract onLinkClick: (event: SyntheticEvent<HTMLLIElement>) => void; // bound
  protected abstract onSortClick: (event: SyntheticEvent<HTMLButtonElement>) => void; // bound
  protected onAddIconClick: (event: SyntheticEvent<HTMLButtonElement>) => void; // bound

  public state = {} as Readonly<S>;
  private _listRef: HTMLUListElement;

  protected constructor(props: T, context: S) {
    super(props, context);
  }

  protected get controls(): JSX.Element {
    return (
      <>
        <button
          aria-label="Sort"
          onKeyPress={this.onControlKeyPress}
          onClick={this.onSortClick}
          className={`${styles.sortIconButton} ${styles.serviceIcon}`}
          ref={this.setSortIconButtonRef}
        >
          <svg viewBox="0 0 34.761 26.892" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
            <g>
              <path d="M15.359 9.478l-6.226-6.21v17.557H7.426V3.268L1.2 9.478 0 8.281 8.279 0l8.279 8.281z" />
              <path d="M34.761 18.612l-8.279 8.281-8.282-8.281 1.2-1.2 6.226 6.21V6.068h1.707v17.557l6.226-6.21z" />
            </g>
          </svg>
        </button>
        <button
          aria-label={'Add ' + this.props.title}
          onKeyPress={this.onControlKeyPress}
          onClick={this.onAddIconClick}
          className={`${styles.addIconButton} ${styles.serviceIcon}`}
          ref={this.setAddIconButtonRef}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 25">
            <g>
              <path d="M0 10L10 10 10 0 15 0 15 10 25 10 25 15 15 15 15 25 10 25 10 15 0 15" />
            </g>
          </svg>
        </button>
      </>
    );
  }

  protected abstract get links(): JSX.Element[];

  protected get content(): JSX.Element {
    const { links, additionalContent } = this;
    const { sortCriteriaChanged } = this.state;
    const { ariaLabel } = this.props;

    if (!links || !links.length) {
      return (
        <ExpandCollapseContent>
          <div aria-live="polite">{this.emptyContent}</div>
        </ExpandCollapseContent>
      );
    }
    if (sortCriteriaChanged) {
      this.listRef && this.listRef.focus();
    }
    return (
      <ExpandCollapseContent>
        <ul className={styles.servicePaneList} ref={ul => (this.listRef = ul)} tabIndex={0} aria-label={ariaLabel}>
          {links}
        </ul>
        {additionalContent}
      </ExpandCollapseContent>
    );
  }

  protected get emptyContent(): JSX.Element {
    return <p className={styles.emptyContent}>You have not saved any {this.props.title} apps to this bot.</p>;
  }

  protected get additionalContent(): JSX.Element {
    return null;
  }

  protected get listRef(): HTMLUListElement {
    return this._listRef;
  }

  protected set listRef(value: HTMLUListElement) {
    const { window } = this.props;
    window.removeEventListener('contextmenu', this.onContextMenu, true);
    const ref = (this._listRef = value);
    if (ref) {
      window.addEventListener('contextmenu', this.onContextMenu, true);
    }
  }

  protected onContextMenu = (event: MouseEvent) => {
    const { listRef } = this;
    let target = event.target as HTMLElement;
    while (target && target.tagName !== 'LI') {
      target = target.parentElement;
    }
    if (!target || target.tagName !== 'LI' || !listRef.contains(target)) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    this.onContextMenuOverLiElement(target as HTMLLIElement);
  };

  protected onContextMenuOverLiElement(li: HTMLLIElement): void {
    const { window } = this.props;
    const { document } = window;
    li.setAttributeNode(document.createAttribute('data-selected')); // Boolean attribute
    const deselectLiElement = function() {
      window.removeEventListener('click', deselectLiElement, true);
      window.removeEventListener('contextmenu', deselectLiElement, true);
      li.removeAttribute('data-selected');
    };
    window.addEventListener('click', deselectLiElement, true);
    window.addEventListener('contextmenu', deselectLiElement, true);
  }

  public render(): JSX.Element {
    return (
      <ExpandCollapse
        className={styles.servicePane}
        key={this.props.title}
        title={this.props.title}
        elementRefHandler={this.props.elementRefHandler}
        ariaLabel={this.props.ariaLabel}
        expanded={this.state.expanded}
        role={this.props.role}
      >
        <ExpandCollapseControls>
          <span className={styles.servicePane}>{this.controls}</span>
        </ExpandCollapseControls>
        {this.content}
      </ExpandCollapse>
    );
  }

  private onControlKeyPress(ev: SyntheticEvent<HTMLButtonElement>): void {
    // so that the key press doesn't bubble up to the expand collapse and toggle expanded state
    ev.stopPropagation();
  }

  protected setAddIconButtonRef = (ref: HTMLButtonElement): void => {
    this.addIconButtonRef = ref;
  };

  protected setSortIconButtonRef = (ref: HTMLButtonElement): void => {
    this.sortIconButtonRef = ref;
  };
}
