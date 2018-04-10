import * as React from 'react';
import { ComponentClass, StatelessComponent } from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import * as DialogActions from '../../../data/action/dialogActions';

import store from '../../../data/store';
import { IDialogService } from './IDialogService';

export const DialogService = new class implements IDialogService {
  private _hostElement: HTMLElement;

  showDialog(dialog: ComponentClass<any> | StatelessComponent<any>): void {
    if (!this._hostElement) {
      return;
    }
    const reactElement = React.createElement(Provider, { store }, React.createElement(dialog));
    ReactDOM.render(reactElement, this._hostElement);
    store.dispatch(DialogActions.setShowing(true));
  }

  hideDialog(): void {
    if (!this._hostElement) {
      return;
    }

    ReactDOM.render(null, this._hostElement);
    store.dispatch(DialogActions.setShowing(false));
  }

  setHost(hostElement: HTMLElement): void {
    this._hostElement = hostElement;
  }
};
