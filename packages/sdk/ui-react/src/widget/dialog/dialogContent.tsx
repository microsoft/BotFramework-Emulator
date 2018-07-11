import * as React from 'react';
import { DialogContent as FabricDialogContent } from 'office-ui-fabric-react';
import { dialogContentStyles } from './dialogContent.styles';

export const DialogContent = props => {
  const { styles = {}, ...p } = props;
  p.styles = Object.assign({}, dialogContentStyles, styles);

  return <FabricDialogContent { ...p }/>;
};
