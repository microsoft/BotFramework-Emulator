import * as ReactDOM from 'react-dom';

import store from '../../../data/store';
import * as DialogActions from '../../../data/action/dialogActions';
import { IDialogService } from './IDialogService';

export const DialogService = new class implements IDialogService {
  private _hostElement: HTMLElement;

  constructor() { }

  showDialog(dialog: JSX.Element): void {
    if (!this._hostElement) {
      return;
    }

    ReactDOM.render(dialog, this._hostElement);
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
}
