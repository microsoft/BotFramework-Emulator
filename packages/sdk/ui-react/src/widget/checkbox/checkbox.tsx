import * as React from 'react';
import { Component, FormEvent, HTMLAttributes } from 'react';
import * as styles from './checkbox.scss';

export interface CheckboxProps extends HTMLAttributes<HTMLInputElement> {
  label?: string;
  checkboxContainerClassName?: string;
  checked?: boolean;
  onChange?: (event: FormEvent<HTMLInputElement>) => void;
}

export interface CheckboxState {
  checked?: boolean;
  focused?: boolean;
}

let id = 0;

export class Checkbox extends Component<CheckboxProps, CheckboxState> {
  private readonly checkboxId = 'emulator-checkbox-' + id++;

  constructor(props: CheckboxProps) {
    super(props);
    this.state = { checked: props.checked, focused: false };
  }

  public render(): JSX.Element {
    // Trim off what we don't want to send to the input tag
    const { checked: _, className, label = '', ...ownProps } = this.props;
    const { checked, focused } = this.state;
    let checkMarkStyles = checked ? styles.checked : '';
    if (focused) {
      checkMarkStyles += ` ${styles.focused}`;
    }
    console.log(checkMarkStyles);
    return (
      <label
        id={ this.checkboxId }
        className={ `${styles.label} ${className}` }
        data-checked={ checked }>
        <span className={ `${styles.checkMark} ${checkMarkStyles}` }/>
        <input type="checkbox" { ...ownProps } className={ styles.checkbox } ref={ this.checkboxRef }/>
        { label }
      </label>
    );
  }

  private checkboxRef = (ref: HTMLInputElement): void => {
    if (ref) {
      ref.addEventListener('change', this.checkboxEventHandler);
      ref.addEventListener('focus', this.checkboxEventHandler);
      ref.addEventListener('blur', this.checkboxEventHandler);
    } else {
      ref.addEventListener('change', this.checkboxEventHandler);
      ref.removeEventListener('focus', this.checkboxEventHandler);
      ref.addEventListener('blur', this.checkboxEventHandler);
    }
  }

  private checkboxEventHandler = (event: Event): void => {
    switch (event.type) {
      case 'change':
        return this.setState({ checked: (event.target as HTMLInputElement).checked });

      case 'focus':
        return this.setState({ focused: true });

      case 'blur':
        return this.setState({ focused: false });

      default:
        return null;
    }

  }
}
