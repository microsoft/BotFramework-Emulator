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

    '[data-checked="true"]::after': {
      backgroundColor: Colors.C10,
      backgroundImage: `url('data:image/svg+xml;utf8,<svg width="12px" height="12px" viewBox="0 0 16 16" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g><polygon fill="#ffffff" id="path-1" points="13.6484375 3.6484375 14.3515625 4.3515625 6 12.7109375 1.6484375 8.3515625 2.3515625 7.6484375 6 11.2890625"/></g></svg>')`,
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

// TODO: add these to a /media/ folder as .svg files and add a build step to /ui-react/ that copies that folder into /ui-react/built/
// https://github.com/Microsoft/BotFramework-Emulator/issues/495
const CHECKED_BOX_URI = `data:image/svg+xml;utf8,<svg width="16px" height="16px" viewBox="0 0 16 16" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><defs><polygon id="path-1" points="13.6484375 3.6484375 14.3515625 4.3515625 6 12.7109375 1.6484375 8.3515625 2.3515625 7.6484375 6 11.2890625"></polygon></defs><g id="Symbols" stroke="none" stroke-width="1" fill="${Colors.CHECKBOX_CHECKED_BG_DARK}" fill-rule="evenodd"><g id="Titles" transform="translate(-452.000000, -1266.000000)"></g><g id="Icons/General/check"><rect id="BG" x="0" y="0" width="16" height="16"></rect><mask id="mask-2" fill="white"><use xlink:href="#path-1"></use></mask><use id="check" fill="${Colors.CHECKBOX_CHECKED_FG_DARK}" xlink:href="#path-1"></use><g id="_color/Neutral-13-(333333)" mask="url(#mask-2)" fill="${Colors.CHECKBOX_CHECKED_FG_DARK}"><rect id="Rectangle-9" x="0" y="0" width="16" height="16"></rect></g></g></g></svg>`;
const CHECKED_BOX_DISABLED_URI = `data:image/svg+xml;utf8,<svg width="16px" height="16px" viewBox="0 0 16 16" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><defs><polygon id="path-1" points="13.6484375 3.6484375 14.3515625 4.3515625 6 12.7109375 1.6484375 8.3515625 2.3515625 7.6484375 6 11.2890625"></polygon></defs><g id="Symbols" stroke="none" stroke-width="1" fill="${Colors.CHECKBOX_CHECKED_DISABLED_BG_DARK}" fill-rule="evenodd"><g id="Titles" transform="translate(-452.000000, -1266.000000)"></g><g id="Icons/General/check"><rect id="BG" x="0" y="0" width="16" height="16"></rect><mask id="mask-2" fill="white"><use xlink:href="#path-1"></use></mask><use id="check" fill="${Colors.CHECKBOX_CHECKED_DISABLED_FG_DARK}" xlink:href="#path-1"></use><g id="_color/Neutral-13-(333333)" mask="url(#mask-2)" fill="${Colors.CHECKBOX_CHECKED_DISABLED_FG_DARK}"><rect id="Rectangle-9" x="0" y="0" width="16" height="16"></rect></g></g></g></svg>`;

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
        <img className="img-checked" src={ CHECKED_BOX_URI }/>
        <img className="img-checked-disabled" src={ CHECKED_BOX_DISABLED_URI }/>
        <label htmlFor={ id } data-checked={ checked }>{ label }</label>
      </div>
    );
  }
}
