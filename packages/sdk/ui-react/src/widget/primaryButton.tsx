import { css } from 'glamor';
import * as React from 'react';
import { TruncateText } from '../layout';
import { Colors, Fonts } from '../styles';

const CSS = css({
  fontFamily: Fonts.FONT_FAMILY_DEFAULT,
  border: 0,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  overflow: 'hidden',
  display: 'inline-block',
  width: 'auto',
  minWidth: '80px',
  height: '22px',
  boxSizing: 'border-box',
  fontSize: '11px',

  '&:disabled': {
    cursor: 'default'
  },

  '& > .primary-button-text': {
    lineHeight: '22px'
  }
});

const PRIMARY_CSS = css({
  backgroundColor: Colors.BUTTON_PRIMARY_BACKGROUND_DARK,
  color: Colors.BUTTON_PRIMARY_FOREGROUND_DARK,

  '&:hover': {
    backgroundColor: Colors.BUTTON_PRIMARY_HOVER_DARK
  },

  '&:focus': {
    backgroundColor: Colors.BUTTON_PRIMARY_FOCUS_DARK
  },

  '&:active': {
    backgroundColor: Colors.BUTTON_PRIMARY_ACTIVE_DARK
  },

  '&:disabled': {
    backgroundColor: Colors.BUTTON_PRIMARY_DISABLED_BACKGROUND_DARK,
    color: Colors.BUTTON_PRIMARY_DISABLED_FOREGROUND_DARK,
    cursor: 'default'
  }
});

const SECONDARY_CSS = css({
  backgroundColor: Colors.BUTTON_SECONDARY_BACKGROUND_DARK,
  color: Colors.BUTTON_SECONDARY_FOREGROUND_DARK,

  '&:hover': {
    backgroundColor: Colors.BUTTON_SECONDARY_HOVER_DARK
  },

  '&:focus': {
    backgroundColor: Colors.BUTTON_SECONDARY_FOCUS_DARK
  },

  '&:active': {
    backgroundColor: Colors.BUTTON_SECONDARY_ACTIVE_DARK
  },

  '&:disabled': {
    backgroundColor: Colors.BUTTON_SECONDARY_DISABLED_BACKGROUND_DARK,
    color: Colors.BUTTON_SECONDARY_DISABLED_FOREGROUND_DARK,
    cursor: 'default'
  }
});

export interface PrimaryButtonProps {
  className?: string;
  disabled?: boolean;
  onClick?: (...args: any[]) => any;
  text?: string;
  secondary?: boolean;
}

export class PrimaryButton extends React.Component<PrimaryButtonProps, {}> {
  constructor(props: any, context: any) {
    super(props, context);
  }

  render(): JSX.Element {
    const colorClass = this.props.secondary ? SECONDARY_CSS : PRIMARY_CSS;
    return (
      <button className={ [CSS, colorClass, this.props.className].filter(name => !!name).join(' ') } onClick={ this.props.onClick } disabled={ this.props.disabled }>
        <TruncateText className="primary-button-text">{ this.props.text }</TruncateText>
      </button>
    );
  }
}
