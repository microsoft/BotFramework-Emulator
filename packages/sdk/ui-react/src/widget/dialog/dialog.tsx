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
import { Component } from 'react';

import { filterChildren, hmrSafeNameComparison } from '../../utils';

import * as styles from './dialog.scss';
import { DialogFooter } from './dialogFooter';

export interface ModalProps extends JSX.ElementChildrenAttribute {
  cancel: (event: any) => void;
  title?: string;
  detailedDescription?: string;
  className?: string;
  titleClassName?: string;
  modalStyle?: string;
}

export class Dialog extends Component<ModalProps, {}> {
  public render() {
    const { className = '', titleClassName = '', title = '', children, modalStyle = '' } = this.props;
    return (
      <>
        <div className={`${styles.modal} ${modalStyle}`}>&nbsp;</div>
        <div
          aria-labelledby="dialog-heading"
          aria-modal="true"
          className={`${className} ${styles.dialog} dialog`}
          onKeyDown={this.bodyKeyDownHandler}
          role="dialog"
        >
          <h1 id="dialog-heading" className={`${titleClassName} ${styles.dialogHeader}`}>
            {title}
          </h1>
          <button className={styles.cancelButton} aria-label="Close" onClick={this.props.cancel} />
          <div className={styles.cancelButtonOutline} role="presentation"></div>
          {filterChildren(children, child => hmrSafeNameComparison(child.type, DialogFooter, true))}
          {filterChildren(children, child => hmrSafeNameComparison(child.type, DialogFooter))}
        </div>
      </>
    );
  }

  private bodyKeyDownHandler = (event: React.KeyboardEvent<HTMLDivElement>): void => {
    if (event.key !== 'Escape') {
      return;
    }

    this.props.cancel(event);
  };
}
