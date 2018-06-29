import * as React from 'react';
import { Checkbox as FabricCheckbox, ICheckboxProps } from 'office-ui-fabric-react';
import { checkboxStyles } from './checkbox.styles';

export function Checkbox<P extends ICheckboxProps>(props: P): JSX.Element {
  const { styles = {}, ...p } = props as any;
  p.styles = { ...checkboxStyles, ...styles };
  return <FabricCheckbox { ...p }/>;
}
