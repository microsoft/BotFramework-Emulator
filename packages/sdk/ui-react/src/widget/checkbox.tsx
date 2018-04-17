import * as React from 'react';
import { css } from 'glamor';

import { Fonts } from '../styles';

const CSS = css({
  display: 'flex',
  paddingBottom: '16px',

  '& > input[type="checkbox"]': {
    cursor: 'pointer',
    marginLeft: 0
  },

  '& > label': {
    fontSize: '12px',
    height: '16px',
    lineHeight: '16px',
    fontFamily: Fonts.FONT_FAMILY_DEFAULT,
    cursor: 'pointer'
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
    return (
      <div className={ 'checkbox-comp ' + (this.props.className || '') } { ...CSS }>
        <input className={ this.props.inputClass || '' } type="checkbox" checked={ this.props.checked } onChange={ this.props.onChange } id={ this.props.id } />
        { this.props.label ? <label htmlFor={ this.props.id }>{ this.props.label }</label> : null }
      </div>
    );
  }
}
