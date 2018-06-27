import * as React from 'react';
import { IButtonProps, DefaultButton as FabricDefaultButton } from 'office-ui-fabric-react';
import { defaultButtonStyles } from './defaultButton.styles';

export function DefaultButton<P extends IButtonProps, C>(props: P): JSX.Element {
  let { styles = {} } = props;
  styles = { ...defaultButtonStyles, ...styles };
  const theseProps = Object.assign({}, props, { styles });

  return <FabricDefaultButton {...theseProps}/>;
}
