import * as React from 'react';
import { ButtonHTMLAttributes, Component, ReactNode } from 'react';
import * as styles from './button.scss';

export interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
}

export class PrimaryButton extends Component<PrimaryButtonProps, {}> {
  public render(): ReactNode {
    const { className: propsClassName = '', text, ...buttonProps } = this.props;
    const className = `${propsClassName} ${styles.button} ${styles.primaryButton}`;
    return (
      <button { ...buttonProps } className={ className }>
        { text }
      </button>
    );
  }
}
