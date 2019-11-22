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

import * as styles from './button.scss';

export interface LinkButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  ariaLabel?: string;
  buttonRef?: (ref: HTMLButtonElement) => void;
  linkRole?: boolean;
  text?: string;
}

// This UI component is intended to function as a button but has the appearance of a link.
// Since we want Emulator to open links the user's default browser, all anchors in this app
// should be a <LinkButton>, which will maintain the desired UX. Otherwise, CTRL + Click
// or middle-mouse button click will open a new instance of Emulator.
// Instead of <a href="...">Link name</a>, please use:
// <LinkButton linkRole={true} onClick={...}>Link name</LinkButton>

export class LinkButton extends React.Component<LinkButtonProps, {}> {
  public render(): React.ReactNode {
    const { className: propsClassName = '', ariaLabel, buttonRef, linkRole = false, text, ...buttonProps } = this.props;
    const className = `${propsClassName} ${styles.linkButton}`;

    const ariaLabelText = ariaLabel || text || (typeof this.props.children === 'string' && this.props.children);

    if (!ariaLabelText) throw new Error('<LinkButton must have aria-label');

    return (
      <button
        {...buttonProps}
        aria-label={ariaLabelText}
        className={className}
        ref={this.setButtonRef}
        role={linkRole ? 'link' : 'button'}
        aria-hidden={this.props.disabled ? 'true' : undefined}
      >
        {text}
        {this.props.children}
      </button>
    );
  }

  private setButtonRef = (ref: HTMLButtonElement): void => {
    const { buttonRef } = this.props;
    buttonRef && buttonRef(ref);
  };
}
