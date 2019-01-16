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

// import { BotInfo } from '@bfemulator/app-shared';
import { DefaultButton, Dialog, DialogFooter, PrimaryButton, TextField } from '@bfemulator/ui-react';
import * as React from 'react';
import { ChangeEvent, FocusEvent, ReactNode } from 'react';
// import { RecentBotsListContainer } from '../../editor/recentBotsList/recentBotsListContainer';
import * as styles from '../dialogStyles.scss';
import * as openBotStyles from './openBotDialog.scss';

export interface OpenBotDialogProps {
  onDialogCancel?: () => void;
  openBot?: (urlOrPath: string) => Promise<void>;
  sendNotification?: (error: Error) => void;
  switchToBot?: (path: string) => void;
}

export interface OpenBotDialogState {
  botUrl?: string;
}

export class OpenBotDialog extends React.Component<OpenBotDialogProps, OpenBotDialogState> {
  public state = { botUrl: '' };

  private static validateEndpoint(endpoint: string): string {
    if (!endpoint) {
      return ''; // Allow empty endpoints
    }
    if (/(http)(s)?(:\/\/)/.test(endpoint)) {
      return endpoint.endsWith('/api/messages') ? '' : `Please include route if necessary: "/api/messages"`;
    }
    return endpoint.endsWith('.bot') ? '' : 'Please choose a valid bot file or endpoint URL';
  }

  public render(): ReactNode {
    const { botUrl } = this.state;
    const errorMessage = OpenBotDialog.validateEndpoint(botUrl);
    return (
      <Dialog
        cancel={ this.props.onDialogCancel }
        className={ `${ styles.dialogMedium } ${ openBotStyles.themeOverrides }` }
        title="Open a bot">
        <form onSubmit={ this.onSubmit }>
          <TextField
            errorMessage={ errorMessage }
            inputContainerClassName={ openBotStyles.inputContainer }
            label="Bot URL or file location"
            onChange={ this.onInputChange }
            onFocus={ this.onFocus }
            value={ botUrl }>

            <PrimaryButton
              className={ openBotStyles.browseButton }>
              Browse
              <input
                className={ openBotStyles.fileInput }
                onChange={ this.onInputChange }
                accept=".bot"
                type="file"/>
            </PrimaryButton>

          </TextField>
          <DialogFooter>
            <DefaultButton
              text="Cancel"
              onClick={ this.props.onDialogCancel }
            />
            <PrimaryButton
              type="submit"
              disabled={ !!errorMessage || !botUrl }
              text="Connect"
            />
          </DialogFooter>
        </form>
      </Dialog>
    );
  }

  private onFocus = (event: FocusEvent<HTMLInputElement>) => {
    const input = event.target as HTMLInputElement;
    input.setSelectionRange(0, (input.value || '').length);
  }

  private onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { type, files, value } = event.target;
    const botUrl = type === 'file' ? files.item(0).path : value;
    this.setState({ botUrl });
  }

  private onSubmit = async () => {
    try {
      await this.props.openBot(this.state.botUrl);
    } catch (e) {
      this.props.sendNotification(e);
    }
  }
}
