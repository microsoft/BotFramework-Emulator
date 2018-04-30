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
    transition: 'border .2s, ease-out',
    height: '22px',
    padding: '4px 8px',
    boxSizing: 'border-box',
    border: '1px solid transparent',
    width: '100%',
    
    '&[aria-invalid="true"]': {
      border: `1px solid ${Colors.C15}`
    }
  },

  '& > .text-input-label': {
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
    const { label, required, error } = this.props;
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
