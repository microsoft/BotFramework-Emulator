import * as React from 'react';
import { ComponentClass, StatelessComponent } from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import * as DialogActions from '../../../data/action/dialogActions';

import store from '../../../data/store';
import { IDialogService } from './IDialogService';

export const DialogService = new class implements IDialogService {
  private _hostElement: HTMLElement;
  private _dialogReturnValue: Promise<any>;
  private _resolve: (value?: any) => void;

  /** Returns a thenable that can return a value using hideDialog(value)
   *
   * Ex. DialogService.showDialog(PasswordPromptDialog).then(pw => // do something with password from dialog)
  */
  showDialog<T extends ComponentClass | StatelessComponent>(dialog: T, props: { [propName: string]: any} = {}): Promise<any> {
    if (!this._hostElement) {
      return new Promise((resolve, reject) => resolve(null));
    }
    const reactElement = React.createElement(Provider, { store }, React.createElement(dialog, props));
    ReactDOM.render(reactElement, this._hostElement);
    store.dispatch(DialogActions.setShowing(true));

    // set up the dialog to return a value from the dialog
    this._dialogReturnValue = new Promise((resolve, reject) => {
      this._resolve = resolve;
    });
    return this._dialogReturnValue;
  }

  hideDialog(dialogReturnValue?: any): void {
    if (!this._hostElement) {
      return;
    }

    ReactDOM.render(null, this._hostElement);
    store.dispatch(DialogActions.setShowing(false));

    this._resolve(dialogReturnValue);
  }

  setHost(hostElement: HTMLElement): void {
    this._hostElement = hostElement;
  }
};
