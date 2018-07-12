import { ICheckboxStyles } from 'office-ui-fabric-react';

export const checkboxStyles: ICheckboxStyles = {
  /**
   * Style for the root element (a button) of the checkbox component in the default enabled/unchecked state.
   */
  root: {},
  /**
   * Style for the label part (contains the customized checkbox + text) when enabled.
   */
  label: {
    color: 'var(--input-label-color)'
  },
  /**
   * Style for checkbox in its default unchecked/enabled state.
   */
  checkbox: {
    color: 'var(--input-label-color)'
  },
  /**
   * Style for the checkmark in the default enabled/unchecked state.
   */
  checkmark: {},
  /**
   * Style for text appearing with the checkbox in its default enabled state.
   */
  text: {
    color: 'var(--input-label-color)'
  },
};
