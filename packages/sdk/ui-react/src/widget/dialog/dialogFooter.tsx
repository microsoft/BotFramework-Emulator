import * as React from 'react';
import { Component } from 'react';
import * as styles from './dialog.scss';

export interface DialogFooterProps {
  className?: string;
}

export class DialogFooter extends Component<DialogFooterProps, {}> {
  public render(): JSX.Element {
    const { className = '' } = this.props;
    return (
      <div className={ `${styles.footer} ${className}` }>
        { this.props.children }
      </div>
    );
  }
}
