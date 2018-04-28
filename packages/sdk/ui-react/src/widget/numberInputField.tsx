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
  value?: number;
}

export class NumberInputField extends React.Component<NumberInputFieldProps, {}> {
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
               aria-invalid={ !!this.props.error }
               onChange={ this.props.onChange }
               placeholder={ this.props.placeholder } readOnly={ this.props.readOnly } required={ this.props.required }
               max={ this.props.max } min={ this.props.min }/>
        <sub style={ { opacity: +( !!this.props.error ) } } className="error">{ this.props.error }</sub>
      </div>
    );
  }
}
