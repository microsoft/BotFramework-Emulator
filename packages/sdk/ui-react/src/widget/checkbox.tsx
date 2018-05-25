/* tslint:disable:max-line-length */
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

import { Colors, Fonts } from '../styles';

const CSS = css({
  display: 'flex',
  position: 'relative',

  '& > input[type="checkbox"]': {
    cursor: 'pointer',
    width: '16px',
    height: '16px',
    margin: 0,
    opacity: 0,

    '&:focus ~ label': {
      outline: `1px solid ${Colors.CHECKBOX_BORDER_FOCUS_DARK}`
    },

    '&:checked + span.img-unchecked': {
      display: 'none'
    },

    '&:checked ~ img.img-checked': {
      display: 'inline-block'
    },

    '&:checked:disabled ~ img.img-checked-disabled': {
      display: 'inline-block'
    },

    '&:disabled ~ label': {
      color: Colors.CHECKBOX_TEXT_DISABLED_DARK
    },

    '&:disabled + span.img-unchecked': {
      border: `solid 1px ${Colors.CHECKBOX_UNCHECKED_DISABLED_BORDER_DARK}`
    }
  },

  '& > label': {
    cursor: 'pointer',
    display: 'inline-block',
    marginLeft: '8px',
    fontFamily: Fonts.FONT_FAMILY_DEFAULT,
    fontSize: '13px',
    lineHeight: '1.23',
    color: Colors.CHECKBOX_TEXT_DARK
  },

  // float the checkbox images over the "real" checkbox input
  '& > img, & > span.img-unchecked': {
    position: 'absolute',
    display: 'none',
    left: 0,
    top: 0,
    height: '16px',
    width: '16px',
    objectFit: 'contain',
    pointerEvents: 'none'
  },

  '& > span.img-unchecked': {
    display: 'inline-block',
    backgroundColor: Colors.CHECKBOX_UNCHECKED_BG_DARK,
    border: `solid 1px ${Colors.CHECKBOX_UNCHECKED_BORDER_DARK}`,
    boxSizing: 'border-box'
  }
});

export interface CheckboxProps {
  checked?: boolean;
  className?: string;
  id?: string;
  inputClass?: string;
  label?: string;
  onChange?: (...args: any[]) => any;
  tabIndex?: number;
}

export class Checkbox extends React.Component<CheckboxProps, {}> {
  public static defaultProps: Partial<CheckboxProps> = {
    checked: false,
    label: '',
    id: '_' + Math.floor(Math.random() * 99999),
    className: '',
    inputClass: '',
    tabIndex: 0
  };

  render(): JSX.Element {
    const { checked, label, id, onChange, className, inputClass, tabIndex } = this.props;
    return (
      <div className={ `${className} checkbox-comp` } { ...CSS }>
        <input className={ className } type="checkbox" checked={ checked } onChange={ onChange } id={ id }
               tabIndex={ tabIndex }/>
        <span className="img-unchecked"></span>
        <img className="img-checked" src={ require('../media/ic_checkbox_checked.svg') }/>
        <img className="img-checked-disabled" src={ require('../media/ic_checkbox_checked_disabled.svg') }/>
        <label htmlFor={ id } data-checked={ checked }>{ label }</label>
      </div>
    );
  }
}
