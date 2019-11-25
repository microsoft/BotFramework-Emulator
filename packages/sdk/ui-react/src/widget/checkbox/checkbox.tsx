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

import * as styles from './checkbox.scss';

export interface CheckboxProps extends React.HTMLAttributes<HTMLInputElement> {
  label?: string;
  checkboxContainerClassName?: string;
  checked?: boolean;
  disabled?: boolean;
  indeterminate?: boolean;
  name?: string;
  onChange?: (event: React.FormEvent<HTMLInputElement>) => void;
}

export interface CheckboxState {
  checked?: boolean;
  focused?: boolean;
  indeterminate?: boolean;
}

let id = 0;

export class Checkbox extends React.Component<CheckboxProps, CheckboxState> {
  private readonly checkboxId = 'emulator-checkbox-' + id++;
  private inputRef: HTMLInputElement;

  public static getDerivedStateFromProps(newProps: CheckboxProps, prevState: CheckboxState = {}): CheckboxState {
    const { checked = false, indeterminate = false } = newProps;
    const { checked: prevChecked, indeterminate: prevIndeterminate } = prevState;
    if (prevChecked !== checked || prevIndeterminate !== indeterminate) {
      return { checked, indeterminate };
    }
    return prevState;
  }

  constructor(props: CheckboxProps) {
    super(props);
    const { checked } = props;
    this.state = { focused: false, checked };
  }

  public render(): React.ReactNode {
    // Trim off what we don't want to send to the input tag
    const { className, label = '', id, ...inputProps } = this.props;
    const { checked = false, indeterminate = false, focused } = this.state;
    const { disabled } = inputProps;
    const disabledClass = disabled ? styles.disabled : '';
    let checkMarkStyles = '';
    if (indeterminate) {
      checkMarkStyles = styles.indeterminate;
    } else if (checked) {
      checkMarkStyles = styles.checked;
    }
    if (focused) {
      checkMarkStyles += ` ${styles.focused}`;
    }
    return (
      <div className={`${styles.label} ${disabledClass} ${className}`} data-checked={checked} role="presentation">
        <span className={`${styles.checkMark} ${checkMarkStyles}`} />
        <input
          className={styles.checkbox}
          id={id || this.checkboxId}
          ref={this.checkboxRef}
          readOnly={true}
          type="checkbox"
          {...inputProps}
        />
        <label htmlFor={id || this.checkboxId}>{label}</label>
        {this.props.children}
      </div>
    );
  }

  private checkboxRef = (ref: HTMLInputElement): void => {
    const { inputRef, checkboxEventHandler } = this;
    if (inputRef) {
      inputRef.removeEventListener('focus', checkboxEventHandler);
      inputRef.removeEventListener('blur', checkboxEventHandler);
    }
    this.inputRef = ref;
    if (ref) {
      ref.addEventListener('focus', checkboxEventHandler);
      ref.addEventListener('blur', checkboxEventHandler);
    }
  };

  private checkboxEventHandler = (event: Event): void => {
    switch (event.type) {
      case 'focus':
        return this.setState({ focused: true });

      case 'blur':
        return this.setState({ focused: false });

      default:
        return null;
    }
  };
}
