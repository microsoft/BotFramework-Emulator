import * as React from 'react';
import { css } from 'glamor';

export interface TruncateTextProps {
  className?: string;
  children?: any;
  title?: string;
}

const CSS = css({
  display: 'inline-block',
  maxWidth: '100%',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap'
});

// TODO: Instead of passing children here, we should consider passing a "text" props
//       This is because this component is named "truncateText", it should not accept
//       something that is not a text. It also help with eliminating the "title" props.
export const TruncateText = (props: TruncateTextProps): JSX.Element =>
  <span className={ 'truncate-text ' + (props.className || '') } title={ props.title } { ...CSS }>
    { props.children }
  </span>;
