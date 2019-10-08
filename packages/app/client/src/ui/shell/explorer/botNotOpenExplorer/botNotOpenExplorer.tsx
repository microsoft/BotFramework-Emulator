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

import { ExpandCollapse, ExpandCollapseContent, LinkButton } from '@bfemulator/ui-react';
import * as React from 'react';

import * as styles from './botNotOpenExplorer.scss';

export interface BotNotOpenExplorerProps {
  hasChat?: boolean;
  openBotFile?: () => Promise<any>;
  showCreateNewBotDialog?: () => void;
}

export class BotNotOpenExplorer extends React.Component<BotNotOpenExplorerProps, {}> {
  private createNewBotButtonRef: HTMLButtonElement;

  public render() {
    const label = 'Services Not Available';
    return (
      <ul className={styles.botNotOpenExplorer}>
        <li>
          <ExpandCollapse expanded={true} ariaLabel={label} title={label}>
            <ExpandCollapseContent>
              <div className={styles.explorerEmptyState}>
                {`To connect the Emulator services, `}
                <LinkButton className={styles.explorerLink} onClick={this.onOpenBotFileClick}>
                  open a .bot file
                </LinkButton>
                {` or `}
                <LinkButton
                  buttonRef={this.setCreateNewBotButtonRef}
                  className={styles.explorerLink}
                  onClick={this.onCreateNewBotClick}
                >
                  create a new bot configuration
                </LinkButton>
                .
              </div>
            </ExpandCollapseContent>
          </ExpandCollapse>
        </li>
      </ul>
    );
  }

  private onCreateNewBotClick = async () => {
    await this.props.showCreateNewBotDialog();

    this.createNewBotButtonRef.focus();
  };

  private onOpenBotFileClick = async () => {
    await this.props.openBotFile();
  };

  private setCreateNewBotButtonRef = (ref: HTMLButtonElement): void => {
    this.createNewBotButtonRef = ref;
  };
}
