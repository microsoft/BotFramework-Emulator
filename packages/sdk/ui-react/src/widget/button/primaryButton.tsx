import * as React from "react";

import * as styles from "./button.scss";

export interface PrimaryButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
}

export class PrimaryButton extends React.Component<PrimaryButtonProps, {}> {
  public render(): React.ReactNode {
    const { className: propsClassName = "", text, ...buttonProps } = this.props;
    const className = `${propsClassName} ${styles.button} ${
      styles.primaryButton
    }`;
    return (
      <button {...buttonProps} className={className}>
        {text}
        {this.props.children}
      </button>
    );
  }
}
