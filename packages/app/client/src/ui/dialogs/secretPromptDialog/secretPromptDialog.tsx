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

import { DefaultButton, Dialog, LinkButton, PrimaryButton, TextField } from '@bfemulator/ui-react';
import { ChangeEvent } from 'react';
import * as React from 'react';

import * as dialogStyles from '../dialogStyles.scss';

import * as styles from './secretPromptDialog.scss';

interface SecretPromptDialogState {
  secret: string;
  revealSecret: boolean;
}

export interface SecretPromptDialogProps {
  onAnchorClick: (url: string) => void;
  onCancelClick: () => void;
  onSaveClick: (newSecret: string) => void;
}

export class SecretPromptDialog extends React.Component<SecretPromptDialogProps, SecretPromptDialogState> {
  constructor(props: SecretPromptDialogProps, context: SecretPromptDialogState) {
    super(props, context);

    this.state = { secret: '', revealSecret: false };
  }

  public render(): JSX.Element {
    return (
      <Dialog title="Your bot file is encrypted" className={dialogStyles.dialogMedium} cancel={this.onDismissClick}>
        <p>
          {' If you created your bot through the Azure Bot Service, you can find your bot file secret in the Azure ' +
            'portal under Application settings.'}
        </p>
        <p>
          {'If you encrypted your bot file with the MsBot command-line tool, your bot file secret was displayed ' +
            'when you ran MsBot. '}
          <LinkButton className={dialogStyles.dialogLink} linkRole={true} onClick={this.onMSBotDocsClick}>
            Learn more about MsBot.
          </LinkButton>
        </p>
        <div className={styles.keyContainer}>
          <TextField
            required={true}
            inputContainerClassName={styles.key}
            value={this.state.secret}
            placeholder="Enter your bot file's secret"
            onChange={this.onChangeSecret}
            label={'Bot file secret'}
            type={this.state.revealSecret ? 'text' : 'password'}
          />
          <LinkButton
            className={styles.show + ' ' + dialogStyles.dialogLink}
            aria-disabled={!this.state.secret}
            onClick={this.onRevealSecretClick}
          >
            {this.state.revealSecret ? 'Hide' : 'Show'}
          </LinkButton>
        </div>

        <div className={styles.buttonRow}>
          <DefaultButton text={'Cancel'} onClick={this.onDismissClick} />
          <PrimaryButton
            disabled={!this.state.secret}
            className={styles.saveButton}
            text={'Submit'}
            onClick={this.onSaveClick}
          />
        </div>
      </Dialog>
    );
  }

  private createAnchorClickHandler = url => () => this.props.onAnchorClick(url);

  private onChangeSecret = (event: ChangeEvent<HTMLInputElement>) => {
    const { value: secret } = event.target;
    this.setState({ secret });
  };

  private onDismissClick = () => {
    this.props.onCancelClick();
  };

  private onMSBotDocsClick = this.createAnchorClickHandler(
    'https://github.com/Microsoft/botbuilder-tools/tree/master/packages/MSBot'
  );

  private onRevealSecretClick = () => {
    this.setState({ revealSecret: !this.state.revealSecret });
  };

  private onSaveClick = () => {
    this.props.onSaveClick(this.state.secret);
  };
}
