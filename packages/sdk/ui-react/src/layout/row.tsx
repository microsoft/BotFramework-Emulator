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
import { css } from 'glamor';

export enum RowJustification {
  Left,
  Center,
  Right
}

export enum RowAlignment {
  Top,
  Center,
  Bottom
}

const BASE_CSS = css({
  boxSizing: 'border-box',
  display: 'flex',
  flexFlow: 'row nowrap',
  flexShrink: 0,
  overflow: 'hidden',
  width: '100%'
});

export interface RowProps {
  align?: RowAlignment;
  className?: string;
  justify?: RowJustification;
}

export class Row extends React.Component<RowProps, {}> {

  render(): JSX.Element {
    const ALIGNMENT_CSS = css({
      alignItems: getRowAlignment(this.props.align),
      justifyContent: getRowJustification(this.props.justify)
    });
    const CSS = css(BASE_CSS, ALIGNMENT_CSS);

    return (
      <div className={ 'row-comp ' + (this.props.className || '') } { ...CSS }>
        { this.props.children }
      </div>
    );
  }
}

/** Converts a row alignment (vertical axis) type to its flexbox style value */
function getRowAlignment(a: RowAlignment): string {
  switch (a) {
    case RowAlignment.Center:
      return 'center';

    case RowAlignment.Bottom:
      return 'flex-end';

    case RowAlignment.Top:
    default:
      return 'flex-start';
  }
}

/** Converts a row justification (horizontal axis) type to its flexbox style value */
function getRowJustification(j: RowJustification): string {
  switch (j) {
    case RowJustification.Center:
      return 'center';

    case RowJustification.Right:
      return 'flex-end';

    case RowJustification.Left:
    default:
      return 'flex-start';
  }
}
