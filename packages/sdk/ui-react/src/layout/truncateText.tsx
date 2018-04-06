import * as React from 'react';
import { css } from 'glamor';

export interface TruncateTextProps {
  className?: string;
  children?: any;
}

const CSS = css({
  display: 'inline-block',
  maxWidth: '100%',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap'
});

export const TruncateText = (props: TruncateTextProps): JSX.Element =>
  <span className={ 'truncate-text ' + (props.className || '') }  { ...CSS }>
    { props.children }
  </span>
