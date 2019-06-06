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

import { DefaultButton, Dialog, DialogFooter, PrimaryButton } from '@bfemulator/ui-react';
import * as React from 'react';

import * as styles from './updateAvailableDialog.scss';

export enum Options {
  ManuallyInstall,
  InstallAndRestart,
  AutoUpdate,
}

export interface UpdateAvailableDialogProps {
  autoInstallUpdates?: boolean;
  onCloseClick?: () => any;
  onUpdateClick?: (updateOption: number) => any;
  version?: string;
}

export interface UpdateAvailableDialogState {
  selectedOption: Options;
}

export class UpdateAvailableDialog extends React.Component<UpdateAvailableDialogProps, UpdateAvailableDialogState> {
  constructor(props: UpdateAvailableDialogProps) {
    super(props);

    this.state = {
      selectedOption: Options.InstallAndRestart,
    };
  }

  public render(): JSX.Element {
    const { onCloseClick, onUpdateClick, version } = this.props;
    const { selectedOption } = this.state;

    return (
      <Dialog cancel={onCloseClick} title="Update available">
        <p>Bot Framework Emulator {version} is available. Would you like to download the new version?</p>
        <div className={styles.inputContainer}>
          <span>
            <input
              name="update-choice"
              type="radio"
              id="choice1"
              value={Options[Options.ManuallyInstall]}
              onChange={this.onChange}
              checked={selectedOption === Options.ManuallyInstall}
            />
            <label htmlFor="choice1">Download and manually install this update.</label>
          </span>
          <span>
            <input
              name="update-choice"
              type="radio"
              id="choice2"
              value={Options[Options.InstallAndRestart]}
              onChange={this.onChange}
              checked={selectedOption === Options.InstallAndRestart}
            />
            <label htmlFor="choice2">Install this update and restart Emulator.</label>
          </span>
          <span>
            <input
              name="update-choice"
              type="radio"
              id="choice3"
              value={Options[Options.AutoUpdate]}
              onChange={this.onChange}
              checked={selectedOption === Options.AutoUpdate}
            />
            <label htmlFor="choice3">Automatically download and install all updates.</label>
          </span>
        </div>
        <DialogFooter>
          <DefaultButton text="Cancel" onClick={onCloseClick} />
          <PrimaryButton text="Update" onClick={() => onUpdateClick(this.state.selectedOption)} />
        </DialogFooter>
      </Dialog>
    );
  }

  private onChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const {
      target: { value },
    } = ev;
    this.setState({ selectedOption: Options[value] });
  };
}
