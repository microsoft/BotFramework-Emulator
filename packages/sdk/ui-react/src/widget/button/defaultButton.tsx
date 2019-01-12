import * as React from "react";

import * as styles from "./button.scss";

export interface DefaultButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
}

export class DefaultButton extends React.Component<DefaultButtonProps, {}> {
  public render(): React.ReactNode {
    const { className: propsClassName = "", text, ...buttonProps } = this.props;
    const className = `${propsClassName} ${styles.button} ${
      styles.defaultButton
    }`;
    return (
      <button {...buttonProps} className={className}>
        {text}
        {this.props.children}
      </button>
    );
  }
}
