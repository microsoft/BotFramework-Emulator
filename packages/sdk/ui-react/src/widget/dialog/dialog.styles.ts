import { IDialogStyles } from 'office-ui-fabric-react';

export const dialogStyles: IDialogStyles = {
  root: {},
  main: {
    backgroundColor: 'var(--dialog-bg) !important',
    selectors: {
      '@media(min-width: 768px)': {
        minWidth: '500px'
      }
    }
  },
};
