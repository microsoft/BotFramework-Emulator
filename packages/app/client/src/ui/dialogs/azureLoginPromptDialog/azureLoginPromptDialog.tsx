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
import { Component } from 'react';

import * as styles from '../dialogStyles.scss';

export interface AzureLoginPromptDialogProps {
  cancel: () => void;
  confirm: () => void;
  onAnchorClick: (url: string) => void;
}

export class AzureLoginPromptDialog extends Component<AzureLoginPromptDialogProps, {}> {
  public render() {
    return (
      <Dialog cancel={this.props.cancel} title="Sign in with an Azure account" className={styles.dialogMedium}>
        <p role="presentation">
          {'Use your Azure account to sign in to all your Azure services, ' +
            'such as Azure Bot Service, Dispatch, LUIS, and QnA Maker. '}
          <LinkButton className={styles.dialogLink} linkRole={true} onClick={this.onSignUpLinkClick}>
            {"Don't have an Azure Account? Sign up."}
          </LinkButton>
        </p>
        <p>
          {'By signing in to your services, you can register any app in that ' +
            'service with your bot without having to enter in credentials manually.'}
        </p>
        <p role="presentation">
          <LinkButton className={styles.dialogLink} linkRole={true} onClick={this.onRegisterServicesLinkClick}>
            Learn more about registering services
          </LinkButton>
        </p>
        <DialogFooter>
          <DefaultButton text="Cancel" onClick={this.props.cancel} />
          <PrimaryButton text="Sign in with Azure" onClick={this.props.confirm} />
        </DialogFooter>
      </Dialog>
    );
  }

  private onRegisterServicesLinkClick = (): void => {
    this.props.onAnchorClick('https://aka.ms/about-bot-file');
  };

  private onSignUpLinkClick = (): void => {
    this.props.onAnchorClick('https://azure.microsoft.com/en-us/services/bot-service');
  };
}
