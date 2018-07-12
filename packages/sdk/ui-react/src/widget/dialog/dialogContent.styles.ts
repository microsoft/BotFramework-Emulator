import { IDialogContentStyles } from 'office-ui-fabric-react';
import { initializeIcons } from 'office-ui-fabric-react/lib/Icons';
initializeIcons();
export const dialogContentStyles: IDialogContentStyles = {
  content: {},
  subText: {},
  header: {},
  button: {},
  inner: {},
  innerContent: {},
  title: {
    selectors: {
      ':empty': {
        display: 'none'
      }
    }
  },
  topButton: {},
};
