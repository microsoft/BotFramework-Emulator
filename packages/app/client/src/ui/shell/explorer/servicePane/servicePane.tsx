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

import { IConnectedService } from 'msbot/bin/schema';
import { ExpandCollapse, ExpandCollapseContent, ExpandCollapseControls } from '@bfemulator/ui-react';
import * as React from 'react';
import { Component, SyntheticEvent } from 'react';
import * as styles from './servicePane.scss';

export interface ServicePaneProps extends ServicePaneState {
  openContextMenuForService: (service: IConnectedService, ...rest: any[]) => void;
  window: Window;
  title: string;
  sortCriteria?: string;
}

export interface ServicePaneState {
  expanded?: boolean;
}

export abstract class ServicePane<T extends ServicePaneProps, S extends ServicePaneState = ServicePaneState>
  extends Component<T, S> {

  protected abstract onLinkClick: (event: SyntheticEvent<HTMLLIElement>) => void; // bound
  protected abstract onAddIconClick: (event: SyntheticEvent<HTMLButtonElement>) => void; // bound
  protected abstract onSortClick: (event: SyntheticEvent<HTMLButtonElement>) => void; // bound

  public state = {} as Readonly<S>;
  private _listRef: HTMLUListElement;

  protected constructor(props: T, context: S) {
    super(props, context);
  }

  protected get controls(): JSX.Element {
    return (
      <>
        <button onClick={ this.onSortClick } className={ styles.sortIconButton }>⮁</button>
        <button onClick={ this.onAddIconClick } className={ styles.addIconButton }>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 25">
            <g>
              <path d="M0 10L10 10 10 0 15 0 15 10 25 10 25 15 15 15 15 25 10 25 10 15 0 15"/>
            </g>
          </svg>
        </button>
      </>
    );
  }

  protected abstract get links(): JSX.Element[];

  protected get content(): JSX.Element {
    const { links, emptyContent } = this;
    if (!links || !links.length) {
      return (
        <ExpandCollapseContent>
          { emptyContent }
        </ExpandCollapseContent>
      );
    }
    return (
      <ExpandCollapseContent>
        <ul className={ styles.servicePaneList } ref={ ul => this.listRef = ul }>
          { links }
        </ul>
      </ExpandCollapseContent>
    );
  }

  protected get emptyContent(): JSX.Element {
    return (
      <p className={ styles.emptyContent }>You have not saved any { this.props.title } apps to this bot.</p>
    );
  }

  protected get listRef(): HTMLUListElement {
    return this._listRef;
  }

  protected set listRef(value: HTMLUListElement) {
    const { window } = this.props;
    window.removeEventListener('contextmenu', this.onContextMenu, true);
    const ref = this._listRef = value;
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
  }

  protected onContextMenuOverLiElement(li: HTMLLIElement): void {
    const { window } = this.props;
    const { document } = window;
    li.setAttributeNode(document.createAttribute('data-selected')); // Boolean attribute
    const deselectLiElement = function () {
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
        className={ styles.servicePane }
        key={ this.props.title }
        title={ this.props.title }
        expanded={ this.state.expanded }>
        <ExpandCollapseControls>
          <span className={ styles.servicePane }>
          { this.controls }
          </span>
        </ExpandCollapseControls>
        { this.content }
      </ExpandCollapse>
    );
  }
}
