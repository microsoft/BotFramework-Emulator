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
import { Dialog, DialogFooter, PrimaryButton } from '@bfemulator/ui-react';

export interface PostMigrationDialogProps {
  close: () => void;
  onAnchorClick: (url: string) => void;
}

export class PostMigrationDialog extends React.Component<PostMigrationDialogProps> {
  constructor(props: PostMigrationDialogProps) {
    super(props);
  }

  public render(): JSX.Element {
    return (
      <Dialog cancel={ this.onClose } title="Migration complete!">
        <p>
          { 'We’ve copied your bot endpoints from Emulator v3 and saved them as <strong>.bot files</strong>. ' +
          'A <strong>.bot file</strong> stores metadata about different services your bot consumes and enables you ' +
          'to edit these services directly from the Emulator v4. ' }
          <a
            href="javascript:void(0);"
            onClick={ this.onLearnMoreConfigAnchor }>
            Learn more about bot configuration files.
          </a>
        </p>
        <p>You can move a bot to any location by right-clicking the bot's name under My Bots.</p>
        <p>
          <a href="javascript:void(0);" onClick={ this.onLearnMoreNewFeaturesAnchor }>
            Learn more about new features in Bot Framework Emulator v4
          </a>
        </p>
        <DialogFooter>
          <PrimaryButton text="Close" onClick={ this.onClose }/>
        </DialogFooter>
      </Dialog>
    );
  }

  private onClose = () => {
    this.props.close();
  }

  private onLearnMoreConfigAnchor = () => {
    this.props.onAnchorClick('https://aka.ms/about-bot-file');
  }

  private onLearnMoreNewFeaturesAnchor = () => {
    this.props.onAnchorClick('https://aka.ms/bot-framework-emulator-v4-overview');
  }
}
