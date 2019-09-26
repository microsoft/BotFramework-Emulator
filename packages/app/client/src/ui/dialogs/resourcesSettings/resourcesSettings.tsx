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
import { BotInfo } from '@bfemulator/app-shared';
import { DefaultButton, Dialog, DialogFooter, LinkButton, PrimaryButton, TextField } from '@bfemulator/ui-react';
import * as React from 'react';
import { ChangeEvent, Component, MouseEvent } from 'react';

import * as dialogStyles from '../dialogStyles.scss';

import * as styles from './resourcesSettings.scss';

export interface ResourcesSettingsState {
  transcriptsPath?: string;
  chatsPath?: string;
  transcriptsInputError?: string;
  saveDisabled?: boolean;
  dirty?: boolean;
  path?: string;
}

export interface ResourcesSettingsProps extends ResourcesSettingsState {
  cancel: () => void;
  save: (settings: BotInfo) => void;
  showOpenDialog: () => Promise<string>;
}

export class ResourcesSettings extends Component<ResourcesSettingsProps, ResourcesSettingsState> {
  constructor(props: ResourcesSettingsProps, context: ResourcesSettingsState) {
    super(props, context);
    const { transcriptsPath, chatsPath } = props;
    this.state = { transcriptsPath, chatsPath };
  }

  public render(): JSX.Element {
    const { transcriptsInputError, dirty, transcriptsPath, chatsPath } = this.state;
    const saveDisabled = !dirty || !transcriptsPath;
    return (
      <Dialog title="Resource settings for this bot" cancel={this.props.cancel} className={dialogStyles.dialogLarge}>
        <div className={styles.container}>
          <TextField
            inputContainerClassName={styles.inputContainer}
            label="Locations for scripts"
            value={chatsPath}
            data-prop="chatsPath"
            onChange={this.onInputChange}
          />
          <LinkButton
            className={styles.browseButton + ' ' + dialogStyles.dialogLink}
            data-prop="chatsPath"
            onClick={this.onBrowseClick}
          >
            Browse
          </LinkButton>
        </div>
        <div className={styles.container}>
          <TextField
            inputContainerClassName={styles.inputContainer}
            label="Locations for transcripts"
            value={transcriptsPath}
            data-prop="transcriptsPath"
            required={true}
            onChange={this.onInputChange}
            errorMessage={transcriptsInputError}
          />
          <LinkButton
            className={styles.browseButton + ' ' + dialogStyles.dialogLink}
            data-prop="transcriptsPath"
            onClick={this.onBrowseClick}
          >
            Browse
          </LinkButton>
        </div>

        <DialogFooter>
          <DefaultButton onClick={this.props.cancel}>Cancel</DefaultButton>
          <PrimaryButton disabled={saveDisabled} onClick={this.onSaveClick}>
            Save Changes
          </PrimaryButton>
        </DialogFooter>
      </Dialog>
    );
  }

  private onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    const { prop } = event.target.dataset;
    this.setState({ [prop]: value, dirty: true });
  };

  private onSaveClick = () => {
    const { chatsPath, transcriptsPath } = this.state;
    const { path } = this.props;
    this.props.save({ chatsPath, transcriptsPath, path });
  };

  private onBrowseClick = async (event: MouseEvent<HTMLButtonElement>) => {
    const prop = event.currentTarget.getAttribute('data-prop');
    const result = await this.props.showOpenDialog();
    if (result) {
      this.setState({ [prop]: result, dirty: true });
    }
  };
}
