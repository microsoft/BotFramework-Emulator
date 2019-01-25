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

import * as styles from './column.scss';

export enum ColumnAlignment {
  Left,
  Center,
  Right,
}

export enum ColumnJustification {
  Top,
  Center,
  Bottom,
}

export interface ColumnProps {
  align?: ColumnAlignment;
  className?: string;
  justify?: ColumnJustification;
}

export class Column extends React.Component<ColumnProps, {}> {
  public render(): JSX.Element {
    const { className = '' } = this.props;
    return (
      <div className={`${styles.column} ${this.getColumnAlignment()} ${this.getColumnJustification()} ${className}`}>
        {this.props.children}
      </div>
    );
  }

  /** Converts a column alignment (horizontal axis) type to its flexbox style value */
  private getColumnAlignment(): string {
    switch (this.props.align) {
      case ColumnAlignment.Center:
        return styles.alignCenter;

      case ColumnAlignment.Right:
        return styles.alignRight;

      case ColumnAlignment.Left:
      default:
        return styles.alignLeft;
    }
  }

  /** Converts a column justification (vertical axis) type to its flexbox style value */
  private getColumnJustification(): string {
    switch (this.props.justify) {
      case ColumnJustification.Center:
        return styles.justifyCenter;

      case ColumnJustification.Bottom:
        return styles.justifyBottom;

      case ColumnJustification.Top:
      default:
        return styles.justifyTop;
    }
  }
}
