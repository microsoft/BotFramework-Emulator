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
import { Dialog, DialogFooter, PrimaryButton } from '@bfemulator/ui-react';
import * as React from 'react';
import { Component } from 'react';

import * as styles from '../dialogStyles.scss';

export interface AzureLoginSuccessDialogState {
  rememberMeChecked: boolean;
}

export interface AzureLoginSuccessDialogProps {
  cancel: (persistLogin: boolean) => void;
  persistLogin: boolean;
}

export class AzureLoginFailedDialog extends Component<AzureLoginSuccessDialogProps, AzureLoginSuccessDialogState> {
  constructor(props: AzureLoginSuccessDialogProps = {} as any, state: AzureLoginSuccessDialogState) {
    super(props, state);
    this.state = { rememberMeChecked: !!props.persistLogin };
  }

  public render() {
    return (
      <Dialog title="Something went wrong!" cancel={this.onDialogCancel} className={styles.dialogMedium}>
        <p>
          {'Your authentication attempt was canceled or was not completed successfully. ' +
            'You will need to authenticate with Azure before some services can be added to the emulator.'}
        </p>
        <DialogFooter>
          <PrimaryButton text="Close" onClick={this.onDialogCancel} />
        </DialogFooter>
      </Dialog>
    );
  }

  private onDialogCancel = () => {
    this.props.cancel(this.state.rememberMeChecked);
  };
}
