import { Colors } from '@bfemulator/ui-react';
import { css } from 'glamor';
import * as React from 'react';

const CSS = css({
  position: 'relative',
  height: '50px',
  width: '50px',

  '&.justify-end': {
    marginTop: 'auto'
  },

  '& > a.nav-link': {
    display: 'inline-block',
    width: '50px',
    height: '50px',
    boxSizing: 'border-box',
    backgroundSize: '25px',
    backgroundPosition: '50% 50%',
    backgroundRepeat: 'no-repeat',
    opacity: 0.6,

    '&:hover, &.selected': {
      opacity: 1
    },
    
    '&:focus': {
      outline: 0,

      '& + span': {
        opacity: 1
      }
    },

    '&.disabled': {
      opacity: 0.6
    }
  },

  '& > span': {
    position: 'absolute',
    display: 'inline-block',
    width: '2px',
    height: '50px',
    top: 0,
    left: 0,
    opacity: 0,
    backgroundColor: Colors.C40
  }
});

export interface NavLinkProps {
  className?: string;
  justifyEnd?: boolean;
  onClick?: (evt) => void;
  title?: string;
}

export class NavLink extends React.Component<NavLinkProps> {
  constructor(props: NavLinkProps) {
    super(props);
  }

  render(): JSX.Element {
    const className = this.props.justifyEnd ? 'justify-end' : '';
    return (
      <div className={ className } { ...CSS }>
        <a className={ this.props.className } onClick={ this.props.onClick } href="javascript:void(0);" title={ this.props.title }></a>
        <span></span>
      </div>
    );
  }
}