import { css } from 'glamor';

import * as Colors from '../../styles/colors';

export const EXPLORER_CSS = css({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  backgroundColor: Colors.EXPLORER_BACKGROUND_DARK,
  color: Colors.EXPLORER_FOREGROUND_DARK,
  overflow: 'hidden',

  '& .empty-list': {
    padding: '4px 4px 0px 16px',
    whiteSpace: 'nowrap',
    height: '30px',
  }
});
