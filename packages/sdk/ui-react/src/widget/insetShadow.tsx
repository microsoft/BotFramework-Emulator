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

import { Shadows } from '../styles';

const BASE_CSS = css({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  pointerEvents: 'none'
});

export interface Props {
  top?: boolean;
  left?: boolean;
  bottom?: boolean;
  right?: boolean;
}

export class InsetShadow extends React.Component<Props> {

  render() {
    const shadowStyles = [];
    if (this.props.top) {
      shadowStyles.push(Shadows.INSET_TOP);
    }
    if (this.props.left) {
      shadowStyles.push(Shadows.INSET_LEFT);
    }
    if (this.props.bottom) {
      shadowStyles.push(Shadows.INSET_BOTTOM);
    }
    if (this.props.right) {
      shadowStyles.push(Shadows.INSET_RIGHT);
    }

    // combine multiple shadows into one boxShadow property (ex. boxShadow: shadowTop, shadowBottom, shadowRight, etc.)
    const shadowRule = shadowStyles.reduce((rule, currentStyle) =>
        rule ? `${rule}, ${currentStyle}` : currentStyle
      , '');

    const SHADOW_CSS = css({ boxShadow: shadowRule || null });
    const CSS = css(BASE_CSS, SHADOW_CSS);

    return (
      <div className="inset-shadow-component" { ...CSS } aria-hidden="true"/>
    );
  }
}
