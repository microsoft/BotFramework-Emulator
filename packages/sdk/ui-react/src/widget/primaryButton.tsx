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
import { TruncateText } from '../layout';
import { Colors, Fonts } from '../styles';

const CSS = css({
  fontFamily: Fonts.FONT_FAMILY_DEFAULT,
  border: 0,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  overflow: 'hidden',
  display: 'inline-block',
  width: 'auto',
  minWidth: '80px',
  height: '22px',
  boxSizing: 'border-box',
  fontSize: '11px',

  '&:disabled': {
    cursor: 'default'
  },

  '& > .primary-button-text': {
    lineHeight: '22px'
  }
});

const PRIMARY_CSS = css({
  backgroundColor: Colors.BUTTON_PRIMARY_BACKGROUND_DARK,
  color: Colors.BUTTON_PRIMARY_FOREGROUND_DARK,

  '&:hover': {
    backgroundColor: Colors.BUTTON_PRIMARY_HOVER_DARK
  },

  '&:focus': {
    backgroundColor: Colors.BUTTON_PRIMARY_FOCUS_DARK
  },

  '&:active': {
    backgroundColor: Colors.BUTTON_PRIMARY_ACTIVE_DARK
  },

  '&:disabled': {
    backgroundColor: Colors.BUTTON_PRIMARY_DISABLED_BACKGROUND_DARK,
    color: Colors.BUTTON_PRIMARY_DISABLED_FOREGROUND_DARK,
    cursor: 'default'
  }
});

const SECONDARY_CSS = css({
  backgroundColor: Colors.BUTTON_SECONDARY_BACKGROUND_DARK,
  color: Colors.BUTTON_SECONDARY_FOREGROUND_DARK,

  '&:hover': {
    backgroundColor: Colors.BUTTON_SECONDARY_HOVER_DARK
  },

  '&:focus': {
    backgroundColor: Colors.BUTTON_SECONDARY_FOCUS_DARK
  },

  '&:active': {
    backgroundColor: Colors.BUTTON_SECONDARY_ACTIVE_DARK
  },

  '&:disabled': {
    backgroundColor: Colors.BUTTON_SECONDARY_DISABLED_BACKGROUND_DARK,
    color: Colors.BUTTON_SECONDARY_DISABLED_FOREGROUND_DARK,
    cursor: 'default'
  }
});

export interface PrimaryButtonProps {
  className?: string;
  disabled?: boolean;
  onClick?: (...args: any[]) => any;
  tabIndex?: number;
  text?: string;
  secondary?: boolean;
}

export class PrimaryButton extends React.Component<PrimaryButtonProps, {}> {
  public static defaultProps: Partial<PrimaryButtonProps> = {
    tabIndex: 0
  };

  constructor(props: any, context: any) {
    super(props, context);
  }

  render(): JSX.Element {
    const colorClass = this.props.secondary ? SECONDARY_CSS : PRIMARY_CSS;
    return (
      <button className={ [CSS, colorClass, this.props.className].filter(name => !!name).join(' ') }
              onClick={ this.props.onClick } disabled={ this.props.disabled } tabIndex={ this.props.tabIndex }>
        <TruncateText className="primary-button-text">{ this.props.text }</TruncateText>
      </button>
    );
  }
}
