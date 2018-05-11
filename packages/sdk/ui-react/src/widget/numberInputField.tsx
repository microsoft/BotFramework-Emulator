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
  paddingBottom: '22px',
  fontFamily: Fonts.FONT_FAMILY_DEFAULT,

  '& > *': {
    flexShrink: 0
  },

  '& > input': {
    height: '22px',
    padding: '4px 8px',
    boxSizing: 'border-box',
    width: '100%',

    '&[aria-invalid="true"]': {
      border: `1px solid ${Colors.C15}`
    }
  },

  '& > .number-input-label': {
    fontSize: '12px',
    height: '16px',
    lineHeight: '16px',
    marginBottom: '6px'
  },

  '& .error': {
    color: Colors.C15,
  },

  '& > .required::after': {
    content: '*',
    color: Colors.C15,
    paddingLeft: '3px'
  },

  '> sub': {
    transition: 'opacity .2s, ease-out',
    opacity: '0',
    position: 'absolute',
    bottom: '6px'
  }
});

export interface NumberInputFieldProps {
  className?: string;
  error?: string;
  inputClass?: string;
  label?: string;
  max?: number;
  min?: number;
  onChange?: (e: any, ...args: any[]) => any;
  placeholder?: string;
  readOnly?: boolean;
  required?: boolean;
  tabIndex?: number;
  value?: number;
}

export class NumberInputField extends React.Component<NumberInputFieldProps, {}> {
  public static defaultProps: Partial<NumberInputFieldProps> = {
    tabIndex: 0
  }

  constructor(props: NumberInputFieldProps, context: any) {
    super(props, context);
  }

  protected get labelElement(): JSX.Element {
    const { label, required, error } = this.props;
    if (!label) {
      return null;
    }
    let className = 'number-input-label';
    if (required) {
      className += ' required';
    }
    if (error) {
      className += ' error';
    }
    return ( <TruncateText className={ className }>{ label }</TruncateText> );
  }

  render(): JSX.Element {
    return (
      <div className={'number-input-comp ' + (this.props.className || '')} {...CSS}>
        { this.labelElement }
        <input type="number" className={ this.props.inputClass || '' } value={ this.props.value }
               tabIndex={ this.props.tabIndex }
               aria-invalid={ !!this.props.error }
               onChange={ this.props.onChange }
               placeholder={ this.props.placeholder } readOnly={ this.props.readOnly } required={ this.props.required }
               max={ this.props.max } min={ this.props.min }/>
        <sub style={ { opacity: +( !!this.props.error ) } } className="error">{ this.props.error }</sub>
      </div>
    );
  }
}
