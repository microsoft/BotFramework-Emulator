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

import { css } from 'glamor';
import * as React from 'react';

import { Colors, Decorators, filterChildren, hmrSafeNameComparison } from '@bfemulator/ui-react';

const CSS = css({
  height: '40px',
  backgroundColor: Colors.TOOLBAR_BACKGROUND_DARK,
  lineHeight: '40px',

  '& > ul': {
    display: 'flex',
    listStyleType: 'none',
    margin: 0,
    padding: 0,

    '& > li': {
      padding: '0 8px 0 8px',
    },

    '& > .button > button': {
      cursor: 'pointer',
      margin: 0,
      border: 'none',
      height: '30px',
      backgroundColor: Colors.TOOLBAR_BUTTON_BACKGROUND_DARK,
      color: Colors.TOOLBAR_BUTTON_FOREGROUND_DARK,
      whiteSpace: 'nowrap',

      ':hover': {
        backgroundColor: Colors.TOOLBAR_BUTTON_HOVER_BACKGROUND_DARK,
        color: Colors.TOOLBAR_BUTTON_HOVER_FOREGROUND_DARK,
        textDecoration: Decorators.TOOLBAR_BUTTON_HOVER_TEXTDECORATION,
      }
    },

    '& > .separator': {
      backgroundColor: Colors.TOOLBAR_BUTTON_BACKGROUND_DARK,
      color: Colors.TOOLBAR_BUTTON_FOREGROUND_DARK,
    }
  }
});

export default class ToolBar extends React.Component<{}, {}> {
  render() {
    return (
      <div { ...CSS }>
        <ul>
          { filterChildren(this.props.children,
            child => child && child.props.visible).map((child, i) => this.createClass(child, i)) }
        </ul>
      </div>
    );
  }

  createClass(child: any, i: number) {
    if (hmrSafeNameComparison(child.type, Button)) {
      return (
        <li key={ i } className="button">
          <button onClick={ () => child.props.onClick() }>{ child.props.title }</button>
        </li>
      );
    } else if (hmrSafeNameComparison(child.type, Separator)) {
      return (
        <li key={ i } className="separator">|</li>
      );
    } else {
      return false;
    }
  }
}

export const Button = props => props.children;
export const Separator = props => props.children;
