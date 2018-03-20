import * as React from 'react';
import { css } from 'glamor';

import * as Fonts from '../styles/fonts';

const CSS = css({
  display: 'flex',
  paddingBottom: '16px',

  '& > input[type="checkbox"]': {
    cursor: 'pointer',
    marginLeft: 0
  },

  '& > label': {
    fontFamily: Fonts.FONT_FAMILY_DEFAULT,
    cursor: 'pointer'
  }
});

interface ICheckboxProps {
  checked?: boolean;
  id?: string;
  label?: string;
  onChange?: (...args: any[]) => any;
}

export default class Checkbox extends React.Component<ICheckboxProps, {}> {
  constructor(props: ICheckboxProps, context) {
    super(props, context);
  }

  render(): JSX.Element {
    return (
      <div className="checkbox-comp" { ...CSS }>
        <input type="checkbox" checked={ this.props.checked } onChange={ this.props.onChange } id={ this.props.id } />
        { this.props.label ? <label htmlFor={ this.props.id }>{ this.props.label }</label> : null }
      </div>
    );
  }
}
