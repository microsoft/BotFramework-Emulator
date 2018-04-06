import * as React from 'react';
import { css } from 'glamor';

import { TruncateText } from '../layout';
import { Fonts } from '../styles/fonts';

const CSS = css({
  fontFamily: Fonts.FONT_FAMILY_DEFAULT,
  fontSize: '26px',
  fontWeight: 'normal',
  margin: 0,
  padding: 0
});

interface IHeaderProps {
  className?: string;
  children?: any;
}

export const MediumHeader = (props: IHeaderProps): JSX.Element =>
   <h2 className={ 'medium-header-comp ' + (props.className || '') } { ...CSS }><TruncateText>{ props.children }</TruncateText></h2>
