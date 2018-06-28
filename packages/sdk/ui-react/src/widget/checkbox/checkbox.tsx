import * as React from 'react';
import { Checkbox as FabricCheckbox, ICheckboxProps } from 'office-ui-fabric-react';

export function Checkbox<P extends ICheckboxProps>(props: P): JSX.Element {
  const { styles = {}, ...p } = props as any;
  return <FabricCheckbox { ...p }/>;
}
