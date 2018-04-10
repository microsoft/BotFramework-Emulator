import * as React from 'react';
import { css } from 'glamor';

import { TruncateText } from '../layout';
import { Fonts } from '../styles';

const CSS = css({
  fontFamily: Fonts.FONT_FAMILY_DEFAULT,
  fontSize: '19px',
  fontWeight: 200,
  margin: 0,
  marginBottom: '4px',
  marginTop: '16px',
  padding: 0
});

export interface SmallIHeaderProps {
  className?: string;
  children?: any;
}

export const SmallHeader = (props: SmallIHeaderProps): JSX.Element =>
   <h3 className={ 'small-header-comp ' + (props.className || '') } { ...CSS }><TruncateText>{ props.children }</TruncateText></h3>;
