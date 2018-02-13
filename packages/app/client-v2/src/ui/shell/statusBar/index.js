import { css } from 'glamor';
import React from 'react';

import * as Colors from '../../styles/colors';

const CSS = css({
  backgroundColor: Colors.NAVBAR_BACKGROUND_DARK,
  color: Colors.NAVBAR_FOREGROUND_DARK,
  lineHeight: '22px',
  minHeight: '22px',
  width: '100%',
  alignSelf: 'flex-end',
  flex: 1
});

export default props =>
  <div className={ CSS }></div>
