import * as React from 'react';
import { IButtonProps, DefaultButton as FabricDefaultButton } from 'office-ui-fabric-react';
import { defaultButtonStyles } from './defaultButton.styles';

export function DefaultButton<P extends IButtonProps>(props: P): JSX.Element {
  let { styles = {}, ...p } = props as any;
  p.styles = { ...defaultButtonStyles, ...styles };

  return <FabricDefaultButton {...p}/>;
}
