import { Colors } from '@bfemulator/ui-react';
import { css } from 'glamor';
import * as React from 'react';
import { MouseEvent } from 'react';

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
    backgroundColor: Colors.NAVBAR_FOCUS_DARK
  },

  '& .badge': {
    position: 'absolute',

    /* 12.5px would align the top-right corner of the badge with the top-right
     * corner of the link icon. So then we need to subtract 1/2 of the badge's
     * height & length (0.5 * 16px = 8px) from that to center the badge on the top-right corner
     * of the link icon. 12.5px - 8px = 4.5px
     */
    top: '4.5px',
    right: '4.5px',
    width: '16px',
    height: '16px',
    borderRadius: '16px',
    lineHeight: '16px',
    textAlign: 'center',
    color: 'white',
    backgroundColor: 'red'
  }
});

interface NavLinkProps {
  className?: string;
  justifyEnd?: boolean;
  onClick?: (evt: MouseEvent<HTMLAnchorElement>) => void;
  title?: string;
  badgeText?: number | string;
}

export class NavLink extends React.Component<NavLinkProps> {
  constructor(props: NavLinkProps) {
    super(props);
  }

  render(): JSX.Element {
    const className = this.props.justifyEnd ? 'justify-end' : '';

    const badge = this.renderBadge();

    return (
      <div className={ className } { ...CSS }>
        <a className={ this.props.className } onClick={ this.props.onClick } href="javascript:void(0);"
           title={ this.props.title }></a>
        <span></span>
        { badge }
      </div>
    );
  }

  /** Renders a circular badge over the top-right corner of the nav link (notification indicator) */
  private renderBadge(): JSX.Element {
    const { badgeText } = this.props;
    if (badgeText) {
      const badgeCss = css({ '&:after': { content: badgeText.toString() }});
      return <div className="badge" { ...badgeCss }></div>;
    }
    return null;
  }
}
