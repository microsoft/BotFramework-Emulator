import * as React from 'react';
import { IButtonProps, PrimaryButton as FabricPrimaryButton } from 'office-ui-fabric-react';
import { primaryButtonStyles } from './primaryButton.styles';

export function PrimaryButton<P extends IButtonProps, C>(props: P): JSX.Element {
  let { styles = {} } = props;
  styles = { ...primaryButtonStyles, ...styles };
  const theseProps = Object.assign({}, props, { styles });

  return <FabricPrimaryButton { ...theseProps }/>;
}
