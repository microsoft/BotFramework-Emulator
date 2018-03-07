import * as React from 'react';
import { css } from 'glamor';

import * as Shadows from '../styles/shadows';

const BASE_CSS = css({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  pointerEvents: 'none'
});

export interface Props {
  top?: boolean;
  left?: boolean;
  bottom?: boolean;
  right?: boolean;
}

export class InsetShadow extends React.Component<Props> {
  constructor(props, context) {
    super(props, context);
  }

  render() {
    const shadowStyles = [];
    this.props.top ? shadowStyles.push(Shadows.INSET_TOP) : null;
    this.props.left ? shadowStyles.push(Shadows.INSET_LEFT) : null;
    this.props.bottom ? shadowStyles.push(Shadows.INSET_BOTTOM) : null;
    this.props.right ? shadowStyles.push(Shadows.INSET_RIGHT) : null;

    // combine multiple shadows into one boxShadow property (ex. boxShadow: shadowTop, shadowBottom, shadowRight, etc.)
    const shadowRule = shadowStyles.reduce((rule, currentStyle) =>
      rule ? `${rule}, ${currentStyle}` : currentStyle
    , '');

    const SHADOW_CSS = css({ boxShadow: shadowRule || null });
    const CSS = css(BASE_CSS, SHADOW_CSS);

    return (
      <div className={ CSS as any + ' inset-shadow-component' } aria-hidden="true" />
    );
  }
}
