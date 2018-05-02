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

export enum ColumnAlignment {
  Left,
  Center,
  Right
}

export enum ColumnJustification {
  Top,
  Center,
  Bottom
}

const BASE_CSS = css({
  boxSizing: 'border-box',
  display: 'flex',
  flexFlow: 'column nowrap',
  maxWidth: '100%',
  width: '100%',
  overflow: 'hidden'
});

export interface ColumnProps {
  align?: ColumnAlignment;
  className?: string;
  justify?: ColumnJustification;
}

export class Column extends React.Component<ColumnProps, {}> {
  constructor(props, context) {
    super(props, context);
  }

  render(): JSX.Element {
    const ALIGNMENT_CSS = css({
      alignItems: getColumnAlignment(this.props.align),
      justifyContent: getColumnJustification(this.props.justify)
    });
    const CSS = css(BASE_CSS, ALIGNMENT_CSS);

    return (
      <div className={ 'column-comp ' + (this.props.className || '') } { ...CSS }>
        { this.props.children }
      </div>
    );
  }
}

/** Converts a column alignment (horizontal axis) type to its flexbox style value */
function getColumnAlignment(a: ColumnAlignment): string {
  switch (a) {
    case ColumnAlignment.Center:
      return 'center';

    case ColumnAlignment.Right:
      return 'flex-end';

    case ColumnAlignment.Left:
    default:
      return 'flex-start';
  }
}

/** Converts a column justification (vertical axis) type to its flexbox style value */
function getColumnJustification(j: ColumnJustification): string {
  switch (j) {
    case ColumnJustification.Center:
      return 'center';

    case ColumnJustification.Bottom:
      return 'flex-end';

    case ColumnJustification.Top:
    default:
      return 'flex-start';
  }
}
