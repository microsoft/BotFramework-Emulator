import * as React from 'react';
import { css } from 'glamor';

interface ITruncateTextProps {
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

export default (props: ITruncateTextProps): JSX.Element =>
  <span className={ 'truncate-text ' + (props.className || '') }  { ...CSS }>
    { props.children }
  </span>;
