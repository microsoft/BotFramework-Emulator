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
import * as styles from './splitButton.scss';
import { SplitButtonPanel } from './splitButtonPanel/splitButtonPanel';

export interface SplitButtonProps {
  buttonClass?: string;
  onChange?: (newValue: string) => any;
  options?: string[];
  selected?: number;
}

export interface SplitButtonState {
  expanded: boolean;
  focused: number;
  selected?: number;
}

export class SplitButton extends React.Component<SplitButtonProps, SplitButtonState> {
  private caretRef: HTMLButtonElement;

  constructor(props: SplitButtonProps) {
    super(props);

    this.state = {
      expanded: false,
      focused: 0,
      selected: props.selected || 0
    };
  }

  public render(): JSX.Element {
    const { buttonClass = '', options } = this.props;
    const { expanded, focused, selected } = this.state;

    return (
      <>
        <div className={ styles.container }>
          <button className={ `${styles.defaultButton} ${buttonClass}` }><span>{ options[selected] }</span></button>
          <div className={ styles.separator }></div>
          <button className={ 'caret' } ref={ this.setCaretRef } onClick={ this.onClickCaret }
            aria-haspopup={ 'listbox' }>V</button>
        </div>
        <SplitButtonPanel
          expanded={ expanded }
          caretRef={ this.caretRef }
          focused={ focused }
          hidePanel={ this.hidePanel }
          onChange={ this.onChangeOption }
          onKeyDown={ this.onKeyDown }
          options={ options }
          selected={ selected }/>
      </>
    );
  }

  private setCaretRef = (ref: HTMLButtonElement) => {
    this.caretRef = ref;
  }

  private onClickCaret = (e: React.SyntheticEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const { expanded } = this.state;
    this.setState({ expanded: !expanded, focused: 0 });
  }

  private onChangeOption = (index: number): void => {
    const { onChange, options = [] } = this.props;
    if (onChange && typeof onChange === 'function') {
      const newValue = options[index] || null;
      onChange(newValue);
    }
    this.caretRef.focus();
    this.setState({ expanded: false, selected: index });
  }

  private hidePanel = (): void => {
    this.caretRef.focus();
    this.setState({ expanded: false });
  }

  private moveFocusUp = (): void => {
    const { options = [] } = this.props;
    const { focused } = this.state;
    if (options.length && focused > 0) {
      this.setState({ focused: focused - 1 });
    }
  }

  private moveFocusDown = (): void => {
    const { options = [] } = this.props;
    const { focused } = this.state;
    if (options.length && focused < options.length - 1) {
      this.setState({ focused: focused + 1 });
    }
  }

  private onKeyDown = (e: React.KeyboardEvent<HTMLUListElement>): void => {
    let { key = '' } = e;
    key = key.toLowerCase();

    switch (key) {
      case 'arrowdown':
        this.moveFocusDown();
        break;

      case 'arrowup':
        this.moveFocusUp();
        break;

      case 'escape':
        this.hidePanel();
        break;

      case 'enter':
        e.preventDefault();
        this.onChangeOption(this.state.focused);
        break;

      case 'tab':
        if (e.shiftKey) {
          // hidePanel() already re-focuses the caret button,
          // so we want to prevent the default behavior which
          // would shift focus to whatever is before the caret button
          e.preventDefault();
        }
        this.hidePanel();
        break;

      default:
        break;
    }
  }
}
