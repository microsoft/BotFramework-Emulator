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
import { ExpandCollapse, ExpandCollapseContent, ExpandCollapseControls, ThemeVariables } from '@bfemulator/ui-react';
import * as React from 'react';
import { Component, SyntheticEvent } from 'react';
import { mergeStyles, IStyle } from '@uifabric/merge-styles';

export interface ServicePaneProps {
  openContextMenu: (service: IConnectedService, ...rest: any[]) => void;
  window: Window;
  title: string;
}

export interface ServicePaneState {
  expanded?: boolean;
}

export abstract class ServicePane<T extends ServicePaneProps,
  S extends ServicePaneState = ServicePaneState> extends Component<T, S> {

  protected abstract onLinkClick: (event: SyntheticEvent<HTMLLIElement>) => void; // bound
  protected onAddIconClick: (event: SyntheticEvent<HTMLButtonElement>) => void; // bound

  public state = {} as Readonly<S>;
  private _listRef: HTMLUListElement;
  private readonly componentClassName: string;
  private readonly listClassName: string;

  protected constructor(props: T, context: S) {
    super(props, context);
    this.componentClassName = mergeStyles(this.componentCss);
    this.listClassName = mergeStyles(this.listCss);
  }

  protected get controls(): JSX.Element {
    return (
      <ExpandCollapseControls>
        <span className={ this.componentClassName }>
          <button onClick={ this.onAddIconClick } className="addIconButton">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 25">
              <g>
                <path d="M0 10L10 10 10 0 15 0 15 10 25 10 25 15 15 15 15 25 10 25 10 15 0 15"/>
              </g>
            </svg>
          </button>
        </span>
      </ExpandCollapseControls>
    );
  }

  protected abstract get links(): JSX.Element[];

  protected get content(): JSX.Element {
    const { links, listClassName, emptyContent } = this;
    if (!links || !links.length) {
      return (
        <ExpandCollapseContent>
          { emptyContent }
        </ExpandCollapseContent>
      );
    }
    return (
      <ExpandCollapseContent>
        <ul className={ listClassName } ref={ ul => this.listRef = ul }>
          { links }
        </ul>
      </ExpandCollapseContent>
    );
  }

  protected get emptyContent(): JSX.Element {
    return (
      <p { ...this.emptyContentCss }>You have not saved any { this.props.title } apps to this bot.</p>
    );
  }

  protected get componentCss(): IStyle {
    return {
      displayName: 'servicePane',
      position: 'relative',
      display: 'inline-block',
      height: '100%',
      width: '100%',
      selectors: {
        '& .addIconButton': {
          background: 'transparent',
          cursor: 'pointer',
          border: 'none',
          outline: 'none',
          position: 'absolute',
          transform: 'translateY(-50%)',
          top: '50%',
          right: '10px',
          padding: '0',
          margin: '0',
          selectors: {
            '> svg': {
              width: '12px',
              height: '12px',
              fill: `var(${ThemeVariables.neutral5})`,
              selectors: {
                ':hover': {
                  fill: `var(${ThemeVariables.logPanelLink})`
                }
              }
            }
          }
        }
      }
    };
  }

  protected get listCss(): IStyle {
    const { neutral13, neutral7, focusedListItem, webchatSelectedTextBg } = ThemeVariables;
    return {
      displayName: 'servicePaneList',
      listStyle: 'none',
      padding: 0,
      margin: 0,
      overflow: 'hidden',
      selectors: {
        '> li': {
          color: `var(${ThemeVariables.neutral5})`,
          cursor: 'pointer',
          display: 'block',
          whiteSpace: 'nowrap',
          lineHeight: '22px',
          minHeight: '22px',
          fontSize: ' 13px',
          selectors: {
            ':hover': {
              backgroundImage: `linear-gradient(to bottom, ${neutral13} 0%,${neutral13} 100%)`,
              backgroundSize: '100% 30px',
              backgroundRepeat: 'no-repeat'
            },

            '[data-selected]': {
              backgroundImage: `linear-gradient(to bottom, var(${focusedListItem}) 0%,var(${focusedListItem}) 100%)`
            },

            '& span': {
              color: `var(${neutral7})`
            },

            '::before': {
              content: '🔗',
              display: 'inline-block',
              color: `var(${webchatSelectedTextBg})`,
              paddingRight: '5px',
              paddingLeft: '13px',
            }
          }
        }
      }
    };
  }

  protected get emptyContentCss(): IStyle {
    return {
      margin: '12px 25px',
      fontSize: '13px',
      color: `var(${ThemeVariables.neutral7})`
    };
  }

  protected get expandCollapseCss(): IStyle {
    // used to prevent explorer squishing caused by flexbox
    return {
      selectors: {
        '&.service-pane-explorer.container-expanded': {
          minHeight: '44px'
        }
      }
    };
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

  public render(): JSX.Element {
    const { expandCollapseCss } = this;

    return (
      <ExpandCollapse
        className="service-pane-explorer"
        style={ expandCollapseCss }
        key={ this.props.title }
        title={ this.props.title }
        expanded={ this.state.expanded }>
        { this.controls }
        { this.content }
      </ExpandCollapse>
    );
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
}
