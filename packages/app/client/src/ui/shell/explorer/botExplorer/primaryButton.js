import React from 'react';
import { css } from 'glamor';

import * as Colors from '../../../styles/colors';
import * as Fonts from '../../../styles/fonts';

const CSS = css({
  backgroundColor: Colors.C10,
  color: Colors.C4,
  fontFamily: Fonts.FONT_FAMILY_DEFAULT,
  border: 0,
  padding: '8px 12px',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  overflow: 'hidden',

  '&:hover': {
    backgroundColor: Colors.C11
  },

  '&:focus': {
    backgroundColor: Colors.C11
  },

  '&:active': {
    backgroundColor: Colors.C12
  }
});

// TODO: Move to packages/ui-react unless we start using Fabric
export default props => 
  <button className={ CSS } onClick={ props.onClick }>{ props.text }</button>;