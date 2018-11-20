import * as React from 'react';
import { Component, InputHTMLAttributes, ReactNode } from 'react';
import * as styles from './textField.scss';

let id = 0;

export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  required?: boolean;
  label?: string;
  errorMessage?: string;
  inputContainerClassName?: string;
}

export class TextField extends Component<TextFieldProps, {}> {
  private readonly inputId: string;

  constructor(props: TextFieldProps) {
    super(props);
    this.inputId = 'emulator-input-' + id++;
  }

  public render(): ReactNode {
    // Trim off what we don't want to send to the input tag
    const { inputContainerClassName = '', className = '', label, errorMessage, ...inputProps } = this.props;
    let inputClassName = `${styles.input} ${className} `;
    if (errorMessage) {
      inputClassName += styles.invalid;
    }
    return <div className={ `${styles.inputContainer} ${inputContainerClassName}` }>
      { this.labelNode }
      <input { ...inputProps } id={ this.inputId } className={ inputClassName }/>
      { this.props.children }
      { this.errorNode }
    </div>;
  }

  protected get labelNode(): ReactNode {
    const { label, required, disabled } = this.props;
    const className = required ? styles.requiredIndicator : '';
    return label ?
      <label
        aria-disabled={ disabled }
        htmlFor={ this.inputId }
        className={ `${className} ${styles.label}` }>{ label }</label> : null;
  }

  protected get errorNode(): ReactNode {
    const { errorMessage } = this.props;
    return errorMessage ? <sub className={ styles.sub }>{ errorMessage }</sub> : null;
  }
}
