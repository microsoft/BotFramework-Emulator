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
  hidePanel?: () => void;
  onChange?: (index: number) => any;
  options?: string[];
  selected?: number;
}

export class SplitButtonPanel extends React.Component<SplitButtonPanelProps> {
  private _panelRef: HTMLDivElement;

  public componentWillMount(): void {
    document.addEventListener('wheel', this.onScroll);
    document.body.addEventListener('click', this.onOutsideClick);
  }

  public componentWillUnmount(): void {
    document.removeEventListener('wheel', this.onScroll);
    document.body.removeEventListener('click', this.onOutsideClick);
  }

  public render() {
    return ReactDOM.createPortal(
      this.panel,
      document.body
    );
  }

  private setPanelRef = (ref: HTMLDivElement) => {
    this._panelRef = ref;
  }

  private get panel(): JSX.Element {
    const { caretRef, options = [], expanded = false } = this.props;
    if (expanded) {
      const caretClientRect = caretRef.getBoundingClientRect();
      const inlineStyle = { top: `${caretClientRect.bottom}px`, left: `${caretClientRect.left}px` };

      return (
        <div className={ styles.panel } style={ inlineStyle } ref={ this.setPanelRef }>
          {
            options.map((option, index) => {
              const isActive = index === this.props.selected;
              const activeClass = isActive ? ` ${styles.selected}` : '';
              return <button 
                        key={ option }
                        className={ styles.option + activeClass }
                        role={ 'option' }
                        aria-selected={ isActive }
                        onClick={ e => this.onSelectOption(e, index) }>
                        { option }
                      </button>;
            })
          }
        </div>
      );
    }
    return null;
  }

  private onSelectOption = (e: React.SyntheticEvent<HTMLButtonElement>, optionIndex: number): void => {
    if (this.props.onChange) {
      this.props.onChange(optionIndex);
    }
  }

  private onScroll = (e: WheelEvent): void => {
    if (this.props.hidePanel) {
      this.props.hidePanel();
    }
  }

  private onOutsideClick = (e: MouseEvent): void => {
    const { target = null } = e as any;
    if (!this._panelRef.contains(target) && this.props.hidePanel) {
      this.props.hidePanel();
    }
  }
}
