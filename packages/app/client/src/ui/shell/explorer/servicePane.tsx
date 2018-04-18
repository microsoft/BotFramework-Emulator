import { Colors, ExpandCollapse, ExpandCollapseContent, ExpandCollapseControls } from '@bfemulator/ui-react';
import { css, StyleAttribute } from 'glamor';
import * as React from 'react';
import { Component, SyntheticEvent } from 'react';
import { IConnectedService } from '@bfemulator/sdk-shared';

export interface ServicePaneProps {
  openContextMenu: (service: IConnectedService) => void;
  window: Window
}

export interface ServicePaneState {
  expanded?: boolean;
}

export abstract class ServicePane<T extends ServicePaneProps, S extends ServicePaneState = ServicePaneState> extends Component<T, S> {
  public state = {} as Readonly<S>;
  private _listRef: HTMLUListElement;

  protected constructor(props, context) {
    super(props, context);
  }

  protected get controls(): JSX.Element {
    return (
      <ExpandCollapseControls>
        <span { ...this.componentCss }>
          <button onClick={ this.onAddIconClick }>
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

  protected abstract get emptyContent(): JSX.Element;

  protected abstract get title(): string | { toString: () => string };

  protected abstract onLinkClick: (event: SyntheticEvent<HTMLLIElement>) => void; // bound
  protected onAddIconClick: (event: SyntheticEvent<HTMLButtonElement>) => void; // bound

  protected get content(): JSX.Element {
    const { links, listCss, emptyContent } = this;
    if (!links || !links.length) {
      return (
        <ExpandCollapseContent>
          { emptyContent }
        </ExpandCollapseContent>
      );
    }
    return (
      <ExpandCollapseContent>
        <ul { ...listCss } ref={ ul => this.listRef = ul }>
          { links }
        </ul>
      </ExpandCollapseContent>
    );
  }

  protected get componentCss(): StyleAttribute {
    return css({
      position: 'relative',
      display: 'inline-block',
      height: '100%',
      width: '100%',
      '> button': {
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

        '> svg': {
          width: '12px',
          height: '12px',

          fill: '#c5c5c5',
          '&:hover': {
            fill: Colors.C14
          }
        }
      }
    });
  }

  protected get listCss(): StyleAttribute {
    return css({
      listStyle: 'none',
      padding: 0,
      margin: 0,
      overflow: 'hidden',

      '> li': {
        color: '#CCCCCC',
        cursor: 'pointer',
        display: 'block',
        whiteSpace: 'nowrap',
        lineHeight: '30px',
        height: '30px',
        paddingLeft: '13px',
        fontSize: ' 13px',

        '&:hover': {
          backgroundColor: Colors.EXPLORER_ITEM_ACTIVE_BACKGROUND_DARK,
        },

        '&[data-selected]': {
          backgroundColor: Colors.C12
        },

        '&::before': {
          content: '🔗',
          display: 'inline-block',
          color: Colors.C5,
          paddingRight: '5px'
        }
      }
    });
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
    return (
      <ExpandCollapse key="LuisExplorer" title={ '' + this.title } expanded={ this.state.expanded }>
        { this.controls }
        { this.content }
      </ExpandCollapse>
    );
  }

  protected onContextMenu = (event: MouseEvent) => {
    const { listRef } = this;
    const target = event.target as HTMLElement;
    if (target.tagName !== 'LI' || !listRef.contains(target)) {
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
    const deselectLiElement = function () {
      window.removeEventListener('click', deselectLiElement, true);
      window.removeEventListener('contextmenu', deselectLiElement, true);
      li.removeAttribute('data-selected');
    };
    window.addEventListener('click', deselectLiElement, true);
    window.addEventListener('contextmenu', deselectLiElement, true);
  }
}
