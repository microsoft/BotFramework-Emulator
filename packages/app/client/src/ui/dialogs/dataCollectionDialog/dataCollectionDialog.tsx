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

import { DefaultButton, Dialog, DialogFooter, LinkButton, PrimaryButton } from '@bfemulator/ui-react';
import * as React from 'react';
import { Component, ReactNode } from 'react';

import * as styles from '../dialogStyles.scss';

export interface DataCollectionDialogProps {
  hideDialog: (dataCollectionEnabled: boolean) => void;
  onAnchorClick: (url: string) => void;
}

export class DataCollectionDialog extends Component<DataCollectionDialogProps, {}> {
  private onPrivacyLinkClick = () => {
    this.props.onAnchorClick('https://privacy.microsoft.com/privacystatement');
  };

  public render(): ReactNode {
    return (
      <Dialog className={styles.dialogMedium} cancel={this.onConfirmOrCancel} title="Help us improve?">
        <p>
          The Emulator includes a telemetry feature that collects usage information. It is important that the Emulator
          team understands how the tool is being used so that it can be improved.
        </p>
        <p>You can turn data collection on or off at any time in your Emulator Settings.</p>
        <p>
          <LinkButton className={styles.dialogLink} linkRole={true} onClick={this.onPrivacyLinkClick}>
            Privacy statement
          </LinkButton>
        </p>
        <DialogFooter>
          <DefaultButton text="Not now" onClick={this.onConfirmOrCancel} />
          <PrimaryButton text="Yes, collect data" name="yes" onClick={this.onConfirmOrCancel} />
        </DialogFooter>
      </Dialog>
    );
  }

  private onConfirmOrCancel = (ev: React.MouseEvent<HTMLButtonElement>): void => {
    const collectData = !!(ev.target as HTMLButtonElement).name;
    this.props.hideDialog(collectData);
  };
}
