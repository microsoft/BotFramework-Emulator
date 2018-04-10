import { css } from 'glamor';
import * as React from 'react';
import { TruncateText } from '../layout';
import { Colors, Fonts } from '../styles';

const CSS = css({
  backgroundColor: Colors.C10,
  color: Colors.C4,
  fontFamily: Fonts.FONT_FAMILY_DEFAULT,
  border: 0,
  padding: '8px 12px',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  overflow: 'hidden',
  display: 'inline-block',
  width: 'auto',
  minWidth: '120px',
  height: '32px',

  '&:hover': {
    backgroundColor: Colors.C11
  },

  '&:focus': {
    backgroundColor: Colors.C11
  },

  '&:active': {
    backgroundColor: Colors.C12
  },

  '&:disabled': {
    backgroundColor: Colors.C2,
    color: Colors.C22,
    cursor: 'default'
  }
});

export interface PrimaryButtonProps {
  className?: string;
  disabled?: boolean;
  onClick?: (...args: any[]) => any;
  text?: string;
}

// TODO: Move to packages/ui-react unless we start using Fabric
export class PrimaryButton extends React.Component<PrimaryButtonProps, {}> {
  constructor(props: any, context: any) {
    super(props, context);
  }

  render(): JSX.Element {
    const buttonClass = this.props.className ? ` ${this.props.className}` : '';
    return (
      <button className={CSS + buttonClass} onClick={this.props.onClick} disabled={this.props.disabled}>
        <TruncateText>{this.props.text}</TruncateText>
      </button>
    );
  }
}
