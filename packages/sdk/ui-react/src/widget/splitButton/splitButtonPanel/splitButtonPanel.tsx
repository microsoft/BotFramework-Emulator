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

import * as styles from './splitButtonPanel.scss';

export interface SplitButtonPanelProps {
  caretRef?: HTMLButtonElement;
  expanded?: boolean;
  selected?: number;
  hidePanel?: () => void;
  onClick?: (index: number) => any;
  onKeyDown?: (e: React.KeyboardEvent<HTMLUListElement>) => any;
  options?: string[];
}

export class SplitButtonPanel extends React.Component<SplitButtonPanelProps> {
  private panelRef: HTMLUListElement;

  public componentWillMount(): void {
    document.addEventListener('wheel', this.onScroll);
    document.body.addEventListener('click', this.onOutsideClick);
  }

  public componentWillUnmount(): void {
    document.removeEventListener('wheel', this.onScroll);
    document.body.removeEventListener('click', this.onOutsideClick);
  }

  public render() {
    return ReactDOM.createPortal(this.panel, document.body);
  }

  private setPanelRef = (ref: HTMLUListElement) => {
    this.panelRef = ref;
    if (this.panelRef) {
      this.panelRef.focus();
    }
  };

  private get panel(): JSX.Element {
    const { caretRef, options = [], expanded = false, onKeyDown = () => null, selected = 0, id } = this.props;
    if (expanded) {
      const caretClientRect = caretRef.getBoundingClientRect();
      const inlineStyle = {
        left: `${caretClientRect.left - 1}px`,
        top: `${caretClientRect.bottom}px`,
      };

      return (
        <ul
          className={styles.panel}
          style={inlineStyle}
          ref={this.setPanelRef}
          role={'menu'}
          tabIndex={-1}
          aria-activedescendant={this.getOptionId(selected)}
          onKeyDown={onKeyDown}
        >
          {options.map((option, index) => {
            const isSelected = index === selected;
            const selectedClass = isSelected ? ` ${styles.selected}` : '';
            return (
              <li
                id={this.getOptionId(index)}
                key={option}
                className={styles.option + selectedClass}
                role={'menuitem'}
                aria-selected={isSelected}
                onClick={e => this.onSelectOption(e, index)}
              >
                {option}
              </li>
            );
          })}
        </ul>
      );
    }
    return null;
  }

  private getOptionId(index: number): string {
    return `split_button_option_${index}`;
  }

  private onSelectOption = (_e: React.SyntheticEvent<HTMLLIElement>, index: number): void => {
    if (this.props.onClick) {
      this.props.onClick(index);
    }
  };

  private onScroll = (_e: WheelEvent): void => {
    const { expanded, hidePanel } = this.props;
    if (expanded && hidePanel) {
      hidePanel();
    }
  };

  private onOutsideClick = (e: MouseEvent): void => {
    const { target = null } = e as any;
    const { expanded, hidePanel } = this.props;
    const { panelRef } = this;
    if (expanded && hidePanel && !panelRef.contains(target)) {
      hidePanel();
    }
  };
}
