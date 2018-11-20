import * as React from 'react';
import { Component, FormEvent, HTMLAttributes, ReactNode } from 'react';
import * as styles from './checkbox.scss';

export interface CheckboxProps extends HTMLAttributes<HTMLInputElement> {
  label?: string;
  checkboxContainerClassName?: string;
  checked?: boolean;
  onChange?: (event: FormEvent<HTMLInputElement>) => void;
}

export interface CheckboxState {
  focused?: boolean;
}

let id = 0;

export class Checkbox extends Component<CheckboxProps, CheckboxState> {
  private readonly checkboxId = 'emulator-checkbox-' + id++;
  private inputRef: HTMLInputElement;

  constructor(props: CheckboxProps) {
    super(props);
    const { checked } = props;
    if (checked === undefined) {
      console.error(
        '<Checkbox> requires a "checked" property to be passed in and managed by the parent component.' +
        '\n\nEx:\n<Checkbox checked={ true | false } ... />'
      );
    }
    this.state = { focused: false };
  }

  public render(): ReactNode {
    // Trim off what we don't want to send to the input tag
    const { checked, className, label = '', ...inputProps } = this.props;
    const { focused } = this.state;
    if (checked === undefined) {
      return null;
    }

    let checkMarkStyles = checked ? styles.checked : '';
    if (focused) {
      checkMarkStyles += ` ${styles.focused}`;
    }
    return (
      <label
        id={ this.checkboxId }
        className={ `${styles.label} ${className}` }
        data-checked={ checked }>
        <span className={ `${styles.checkMark} ${checkMarkStyles}` }/>
        <input type="checkbox" { ...inputProps } className={ styles.checkbox } ref={ this.checkboxRef }/>
        { label }
        { this.props.children }
      </label>
    );
  }

  private checkboxRef = (ref: HTMLInputElement): void => {
    const { inputRef, checkboxEventHandler } = this;
    if (inputRef) {
      inputRef.removeEventListener('focus', checkboxEventHandler);
      inputRef.removeEventListener('blur', checkboxEventHandler);
    }
    this.inputRef = ref;
    if (ref) {
      ref.addEventListener('focus', checkboxEventHandler);
      ref.addEventListener('blur', checkboxEventHandler);
    }
  }

  private checkboxEventHandler = (event: Event): void => {
    switch (event.type) {
      case 'focus':
        return this.setState({ focused: true });

      case 'blur':
        return this.setState({ focused: false });

      default:
        return null;
    }

  }
}
