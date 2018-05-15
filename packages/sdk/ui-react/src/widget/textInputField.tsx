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
  position: 'relative',
  display: 'flex',
  flexFlow: 'column nowrap',
  width: '100%',
  paddingBottom: '21px', // capable of containing 11px high error text with 10px padding
  fontFamily: Fonts.FONT_FAMILY_DEFAULT,

  '& > *': {
    flexShrink: 0
  },

  '& > input': {
    transition: 'border .2s, ease-out',
    height: '24px', // 22px input height + 1px border on top and bottom
    padding: '5px 8px',
    boxSizing: 'border-box',
    border: `1px solid ${Colors.INPUT_BORDER_DARK}`,
    backgroundColor: Colors.INPUT_BACKGROUND_DARK,
    width: '100%',
    fontSize: '12px',
    lineHeight: 1,
    outline: 0,

    '&[aria-invalid="true"]': {
      border: `1px solid ${Colors.INPUT_ERR_DARK}`,

      '&:focus': {
        border: `1px solid ${Colors.INPUT_ERR_DARK}`
      }
    },

    '&:focus': {
      border: `1px solid ${Colors.INPUT_BORDER_FOCUS_DARK}`,
      outline: 0
    },

    '&::placeholder': {
      color: Colors.INPUT_TEXT_PLACEHOLDER_DARK
    },

    '&:disabled': {
      color: Colors.INPUT_TEXT_DISABLED_DARK,
      backgroundColor: Colors.INPUT_BACKGROUND_DARK
    }
  },

  '& > .text-input-label': {
    fontSize: '11px',
    height: '11px',
    lineHeight: 1,
    marginBottom: '4px',

    '&.disabled': {
      color: Colors.INPUT_TEXT_DISABLED_DARK,

      '&.required::after': {
        color: Colors.INPUT_TEXT_DISABLED_DARK
      }
    },

    '&.required::after': {
      content: '*',
      color: Colors.INPUT_ERR_DARK,
      paddingLeft: '2px'
    }
  },

  '& .error': {
    color: Colors.INPUT_ERR_DARK,
  },

  '> sub': {
    transition: 'opacity .2s, ease-out',
    opacity: '0',
    position: 'absolute',
    bottom: '6px',
    lineHeight: 1,
    fontSize: '11px',
    height: '11px'
  }
});

export type TextInputType = 'text' | 'password';

export interface TextInputFieldProps {
  disabled?: boolean;
  className?: string;
  error?: string;
  inputClass?: string;
  label?: string;
  onChange?: (e: any, ...args: any[]) => any;
  placeholder?: string;
  readOnly?: boolean;
  required?: boolean;
  type?: TextInputType;
  value?: string;
  inputAttributes?: {}
}

export class TextInputField extends React.Component<TextInputFieldProps, {}> {
  constructor(props: TextInputFieldProps, context: any) {
    super(props, context);
  }

  protected get labelElement(): JSX.Element {
    const { label, required, error, disabled } = this.props;
    if (!label) {
      return null;
    }
    let className = 'text-input-label';
    if (required) {
      className += ' required';
    }
    if (error) {
      className += ' error';
    }
    if (disabled) {
      className += ' disabled';
    }
    return ( <TruncateText className={ className }>{ label }</TruncateText> );
  }

  public render(): JSX.Element {
    const {
      inputClass = '',
      className = '',
      required = false,
      disabled = false,
      type = 'text',
      value = '',
      readOnly = false,
      error = '',
      inputAttributes = {},
      placeholder = '',
      onChange
    } = this.props;

    return (
      <div className={ 'text-input-comp ' + className } { ...CSS }>
        { this.labelElement }
        <input aria-invalid={ !!error }
               type={ type }
               className={ inputClass }
               value={ value }
               onChange={ onChange }
               disabled={ disabled }
               placeholder={ placeholder }
               readOnly={ readOnly }
               required={ required } { ...inputAttributes }/>
        <sub style={ { opacity: +( !!error ) } } className="error">{ error }</sub>
      </div>
    );
  }
}
