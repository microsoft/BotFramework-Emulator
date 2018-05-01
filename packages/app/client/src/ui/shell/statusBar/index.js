import { css } from 'glamor';
import React from 'react';

import { Colors } from '@bfemulator/ui-react';

const CSS = css({
  backgroundColor: Colors.STATUS_BAR_BACKGROUND_DARK,
  color: Colors.STATUS_BAR_FOREGROUND_DARK,
  lineHeight: '22px',
  minHeight: '22px',
  width: '100%',
  alignSelf: 'flex-end',
  flex: 1
});

export default props =>
  <div className={ CSS }></div>
