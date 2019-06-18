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
import { Component, MouseEventHandler } from 'react';

import * as styles from './ControlBar.scss';

export enum ButtonSelected {
  RecognizerResult,
  RawResponse,
}

interface ControlBarProps {
  setButtonSelected: (buttonSelected: ButtonSelected) => void;
  buttonSelected: ButtonSelected;
}

export class ControlBar extends Component<ControlBarProps, {}> {
  public clickHandler: MouseEventHandler<HTMLAnchorElement> = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    this.props.setButtonSelected(ButtonSelected[e.currentTarget.id]);
  };

  public render() {
    return (
      <div className={styles.controlBar}>
        <span id="recognizerResultButton">
          <a
            className={this.props.buttonSelected === ButtonSelected.RecognizerResult ? styles.selected : ''}
            id={ButtonSelected[ButtonSelected.RecognizerResult]}
            href="#"
            onClick={this.clickHandler}
          >
            Recognizer Result
          </a>
        </span>
        <span id="rawResponseButton">
          <a
            className={this.props.buttonSelected === ButtonSelected.RawResponse ? styles.selected : ''}
            id={ButtonSelected[ButtonSelected.RawResponse]}
            href="#"
            onClick={this.clickHandler}
          >
            Raw Response
          </a>
        </span>
      </div>
    );
  }
}
