import * as React from 'react';
import { ButtonHTMLAttributes, Component, ReactNode } from 'react';
import * as styles from './button.scss';

export interface DefaultButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
}

export class DefaultButton extends Component<DefaultButtonProps, {}> {
  public render(): ReactNode {
    const { className: propsClassName = '', text, ...buttonProps } = this.props;
    const className = `${propsClassName} ${styles.button} ${styles.defaultButton}`;
    return (
      <button { ...buttonProps } className={ className }>
        { text }
        { this.props.children }
      </button>
    );
  }
}
