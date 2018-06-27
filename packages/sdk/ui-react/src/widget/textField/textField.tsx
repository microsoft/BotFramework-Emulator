import * as React from 'react';
import { ITextFieldProps, TextField as FabricTextField } from 'office-ui-fabric-react';
import { textFieldStyles } from './textField.styles';

export function TextField<P extends ITextFieldProps>(props: P): JSX.Element {
  const p = Object.assign({}, textFieldStyles, props);
  return <FabricTextField { ...p }/>;
}
