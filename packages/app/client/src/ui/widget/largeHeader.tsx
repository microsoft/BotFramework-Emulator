import * as React from 'react';
import { css } from 'glamor';

import { TruncateText } from '../layout';
import * as Fonts from '../styles/fonts';

const CSS = css({
  fontFamily: Fonts.FONT_FAMILY_DEFAULT,
  fontSize: '36px',
  fontWeight: 400,
  margin: 0,
  padding: 0
});

interface IHeaderProps {
  className?: string;
  children?: any;
}

export default (props: IHeaderProps): JSX.Element =>
   <h1 className={ 'large-header-comp ' + (props.className || '') } { ...CSS }><TruncateText>{ props.children }</TruncateText></h1>
