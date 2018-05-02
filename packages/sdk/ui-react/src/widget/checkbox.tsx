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
    display: 'none'
  },

  '& > label': {
    fontFamily: Fonts.FONT_FAMILY_DEFAULT,
    cursor: 'pointer',
    lineHeight: '1.5',
    marginLeft: '23px',

    '&::after': {
      content: '""',
      position: 'absolute',
      display: 'inline-block',
      boxSizing: 'border-box',
      border: '1px solid #666666',
      width: '16px',
      height: '16px',
      left: 0,
      top: '50%',
      transform: 'translateY(calc(-50% - 1px))',
      backgroundPosition: '1px 1px',
    },

    '&:hover::after': {
      border: `1px solid ${Colors.C10}`
    },

    '[data-checked="true"]::after': {
      backgroundColor: Colors.C10,
      backgroundImage: `url('data:image/svg+xml;utf8,<svg width="12px" height="12px" viewBox="0 0 16 16" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g><polygon fill="#ffffff" id="path-1" points="13.6484375 3.6484375 14.3515625 4.3515625 6 12.7109375 1.6484375 8.3515625 2.3515625 7.6484375 6 11.2890625"/></g></svg>')`,
    },
  }
});

export interface CheckboxProps {
  checked?: boolean;
  className?: string;
  id?: string;
  inputClass?: string;
  label?: string;
  onChange?: (...args: any[]) => any;
}

export class Checkbox extends React.Component<CheckboxProps, {}> {
  constructor(props: CheckboxProps, context) {
    super(props, context);
  }

  render(): JSX.Element {
    const { checked = false, label = '', id = '_' + Math.floor(Math.random() * 99999), onChange, className='', inputClass='' } = this.props;
    return (
      <div className={ `${className} checkbox-comp` } { ...CSS }>
        <input type="checkbox" checked={ checked } onChange={ onChange } id={ id } className={className}/>
        <label htmlFor={ id } data-checked={ checked }>{ label }</label>
      </div>
    );
  }
}
