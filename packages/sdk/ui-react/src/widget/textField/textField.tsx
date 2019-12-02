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
import { Component, InputHTMLAttributes, ReactNode } from 'react';

import * as styles from './textField.scss';

let id = 0;

export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  required?: boolean;
  label?: string;
  errorMessage?: string;
  inputContainerClassName?: string;
  inputRef?: (ref: HTMLInputElement) => void;
}

export class TextField extends Component<TextFieldProps, {}> {
  private readonly inputId: string;

  constructor(props: TextFieldProps) {
    super(props);
    this.inputId = 'emulator-input-' + id++;
  }

  public render(): ReactNode {
    // Trim off what we don't want to send to the input tag
    const {
      inputContainerClassName = '',
      className = '',
      errorMessage,
      children,
      inputRef,
      ...inputProps
    } = this.props;
    let inputClassName = `${styles.input} ${className} `;
    if (errorMessage) {
      inputClassName += styles.invalid;
    }
    return (
      <div className={`${styles.inputContainer} ${inputContainerClassName}`} role="presentation">
        {this.labelNode}
        <input
          aria-label={errorMessage ? this.props.label + ', ' + errorMessage : undefined}
          className={inputClassName}
          id={this.inputId}
          ref={this.setInputRef}
          {...inputProps}
        />
        {children}
        {this.errorNode}
      </div>
    );
  }

  private setInputRef = (ref: HTMLInputElement): void => {
    const { inputRef } = this.props;
    if (inputRef) {
      inputRef(ref);
    }
  };

  protected get labelNode(): ReactNode {
    const { label, required, disabled } = this.props;
    const className = required ? styles.requiredIndicator : '';
    return label ? (
      <label aria-disabled={disabled} htmlFor={this.inputId} className={`${className} ${styles.label}`}>
        {label}
      </label>
    ) : null;
  }

  protected get errorNode(): React.ReactNode {
    const { errorMessage } = this.props;
    return errorMessage ? (
      <sub id="errormessagesub" className={styles.sub} aria-live={'polite'}>
        {errorMessage}
      </sub>
    ) : null;
  }
}
