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
import { Dialog, DialogFooter, PrimaryButton } from '@bfemulator/ui-react';
import * as React from 'react';
import { Component } from 'react';

import * as dialogStyles from '../dialogStyles.scss';

import * as styles from './progressIndicator.scss';

export interface ProgressIndicatorProps extends ProgressIndicatorState {
  cancel: () => void;
  close: () => void;
}

export interface ProgressIndicatorState {
  label: string;
  progress: number;
}

export class ProgressIndicator extends Component<ProgressIndicatorProps, ProgressIndicatorState> {
  private hr: HTMLElement;

  public render() {
    if (this.hr) {
      this.hr.style.setProperty('--progress-percentage', `${this.props.progress}%`);
    }
    return (
      <Dialog cancel={this.props.close} className={dialogStyles.dialogMedium}>
        <p>{this.props.label}</p>
        <hr className={styles.progressIndicator} ref={this.hrRef} />
        <DialogFooter>
          <PrimaryButton text="Dismiss" onClick={this.props.cancel} />
        </DialogFooter>
      </Dialog>
    );
  }

  private hrRef = (hr: HTMLElement): void => {
    this.hr = hr;
  };
}
