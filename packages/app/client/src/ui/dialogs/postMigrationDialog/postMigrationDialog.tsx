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

import { Dialog, DialogFooter, LinkButton, PrimaryButton } from '@bfemulator/ui-react';
import * as React from 'react';

import * as dialogStyles from '../dialogStyles.scss';

import * as styles from './postMigrationDialog.scss';

export interface PostMigrationDialogProps {
  close: () => void;
  onAnchorClick: (url: string) => void;
}

export class PostMigrationDialog extends React.Component<PostMigrationDialogProps> {
  public constructor(props: PostMigrationDialogProps) {
    super(props);
  }

  public render(): JSX.Element {
    return (
      <Dialog cancel={this.onClose} className={dialogStyles.dialogLarge} title="Migration complete!">
        <p className={styles.dialogText}>
          We’ve copied your bot endpoints from Emulator v3 and saved them as
          <strong className={styles.boldText}> .bot files</strong>. A
          <strong className={styles.boldText}> .bot file </strong>
          stores metadata about different services your bot consumes and enables you to edit these services directly
          from the Emulator v4.
          <LinkButton className={dialogStyles.dialogLink} linkRole={true} onClick={this.onBotFileDocsClick}>
            Learn more about bot configuration files.
          </LinkButton>
        </p>
        <p>
          {/* eslint-disable-next-line react/no-unescaped-entities */}
          You can move a bot to any location by right-clicking the bot's name under My Bots.
        </p>
        <p>
          <LinkButton className={dialogStyles.dialogLink} linkRole={true} onClick={this.onEmulatorv4OverviewDocsClick}>
            Learn more about new features in Bot Framework Emulator v4
          </LinkButton>
        </p>
        <DialogFooter>
          <PrimaryButton text="Close" onClick={this.onClose} />
        </DialogFooter>
      </Dialog>
    );
  }

  private createAnchorClickHandler = url => () => this.props.onAnchorClick(url);

  private onBotFileDocsClick = this.createAnchorClickHandler('https://aka.ms/about-bot-file');

  private onClose = () => {
    this.props.close();
  };

  private onEmulatorv4OverviewDocsClick = this.createAnchorClickHandler(
    'https://aka.ms/bot-framework-emulator-v4-overview'
  );
}
