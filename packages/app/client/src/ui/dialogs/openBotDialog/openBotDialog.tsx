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

import { DefaultButton, Dialog, DialogFooter, PrimaryButton, Row, TextField } from '@bfemulator/ui-react';
import * as React from 'react';
import { ChangeEvent, Component, FocusEvent, ReactNode } from 'react';

import * as openBotStyles from './openBotDialog.scss';

export interface OpenBotDialogProps {
  onDialogCancel?: () => void;
  openBot?: (state: OpenBotDialogState) => void;
  sendNotification?: (error: Error) => void;
  switchToBot?: (path: string) => void;
}

export interface OpenBotDialogState {
  botUrl?: string;
  appId?: string;
  appPassword?: string;
}

enum ValidationResult {
  Invalid,
  RouteMissing,
  Valid,
  Empty,
}

export class OpenBotDialog extends Component<OpenBotDialogProps, OpenBotDialogState> {
  public state = { botUrl: '', appId: '', appPassword: '' };

  private static getErrorMessage(result: ValidationResult): string {
    if (result === ValidationResult.Empty || result === ValidationResult.Valid) {
      return ''; // Allow empty endpoints
    }

    return result === ValidationResult.Invalid
      ? 'Please choose a valid bot file or endpoint URL'
      : `Please include route if necessary: "/api/messages"`;
  }

  private static validateEndpoint(endpoint: string): ValidationResult {
    if (!endpoint) {
      return ValidationResult.Empty;
    }

    if (/(http)(s)?(:\/\/)[\w+]/.test(endpoint)) {
      return endpoint.endsWith('/api/messages') ? ValidationResult.Valid : ValidationResult.RouteMissing;
    }

    return endpoint.endsWith('.bot') ? ValidationResult.Valid : ValidationResult.Invalid;
  }

  public render(): ReactNode {
    const { botUrl, appId, appPassword } = this.state;
    const validationResult = OpenBotDialog.validateEndpoint(botUrl);
    const errorMessage = OpenBotDialog.getErrorMessage(validationResult);
    const shouldBeDisabled =
      validationResult === ValidationResult.Invalid || validationResult === ValidationResult.Empty;
    return (
      <Dialog cancel={this.props.onDialogCancel} className={openBotStyles.themeOverrides} title="Open a bot">
        <form onSubmit={this.onSubmit}>
          <TextField
            autoFocus={true}
            name="botUrl"
            errorMessage={errorMessage}
            inputContainerClassName={openBotStyles.inputContainer}
            label="Bot URL or .bot file location"
            onChange={this.onInputChange}
            onFocus={this.onFocus}
            placeholder="Bot URL or .bot file location"
            value={botUrl}
          >
            <PrimaryButton className={openBotStyles.browseButton}>
              Browse
              <input
                accept=".bot"
                className={openBotStyles.fileInput}
                name="botUrl"
                onChange={this.onInputChange}
                type="file"
              />
            </PrimaryButton>
          </TextField>
          <Row className={openBotStyles.multiInputRow}>
            <TextField
              inputContainerClassName={openBotStyles.inputContainerRow}
              name="appId"
              label="Microsoft App ID"
              onChange={this.onInputChange}
              placeholder="Optional"
              value={appId}
            />
            <TextField
              inputContainerClassName={openBotStyles.inputContainerRow}
              label="Microsoft App password"
              name="appPassword"
              onChange={this.onInputChange}
              placeholder="Optional"
              type="password"
              value={appPassword}
            />
          </Row>
          <DialogFooter>
            <DefaultButton onClick={this.props.onDialogCancel}>Cancel</DefaultButton>
            <PrimaryButton type="submit" disabled={shouldBeDisabled}>
              Connect
            </PrimaryButton>
          </DialogFooter>
        </form>
      </Dialog>
    );
  }

  private onFocus = (event: FocusEvent<HTMLInputElement>) => {
    const input = event.target as HTMLInputElement;
    input.setSelectionRange(0, (input.value || '').length);
  };

  private onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { type, files, value, name } = event.target;
    let newValue = value;
    if (name === 'botUrl') {
      newValue = type === 'file' ? files.item(0).path : value;
    }
    this.setState({ [name]: newValue });
  };

  private onSubmit = () => {
    this.props.openBot(this.state);
  };
}
