//
// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license.
//
// Microsoft Bot Framework: http://botframework.com
//
// Bot Framework Emulator Github:
// https://github.com/Microsoft/BotFramwork-Emulator
//
// Copyright (c) Microsoft Corporation
// All rights reserved.
//
// MIT License:
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//

import * as React from 'react';
import { ComponentClass, StatelessComponent } from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { setShowing as setDialogShowing } from '@bfemulator/app-shared';

import { store } from '../../../state/store';

export interface DialogService {
  showDialog(dialog: ComponentClass<any> | StatelessComponent<any>, props: { [propName: string]: any }): any;

  hideDialog(): any;

  setHost(hostElement: HTMLElement): void;
}

class DialogServiceImpl implements DialogService {
  private _hostElement: HTMLElement;
  private _resolve: (value?: any) => void;

  /** Returns a thenable that can return a value using hideDialog(value)
   *
   * Ex. DialogService.showDialog(PasswordPromptDialog).then(pw => // do something with password from dialog)
   */
  showDialog<T extends ComponentClass | StatelessComponent, R = any>(dialog: T, props: {} = {}): Promise<R> {
    if (!this._hostElement) {
      return new Promise(resolve => resolve(null));
    }
    const reactElement = React.createElement(Provider, { store }, React.createElement(dialog, props));
    ReactDOM.render(reactElement, this._hostElement, this.notifyHostOfRender);
    store.dispatch(setDialogShowing(true));

    // set up the dialog to return a value from the dialog
    return new Promise(resolve => {
      this._resolve = resolve;
    });
  }

  hideDialog(dialogReturnValue?: any): void {
    if (!this._hostElement || !this._resolve) {
      return;
    }

    ReactDOM.render(null, this._hostElement);
    store.dispatch(setDialogShowing(false));

    this._resolve(dialogReturnValue);
    this._resolve = null;
  }

  setHost(hostElement: HTMLElement): void {
    this._hostElement = hostElement;
  }

  /** Notifies the dialog host that the shown dialog has finished rendering */
  private notifyHostOfRender = (): void => {
    if (this._hostElement) {
      this._hostElement.dispatchEvent(new Event('dialogRendered'));
    }
  };
}

export const DialogService = new DialogServiceImpl();
