import * as React from 'react';
import { DialogFooter as FabricDialogFooter } from 'office-ui-fabric-react';
import { dialogFooterStyles } from './dialogFooter.styles';

export const DialogFooter = props => {
  const { styles = {}, ...p } = props;
  p.styles = Object.assign(dialogFooterStyles, styles);

  return <FabricDialogFooter { ...p } />;
};
