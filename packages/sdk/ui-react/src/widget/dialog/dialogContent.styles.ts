import { IDialogContentStyles } from 'office-ui-fabric-react';

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
