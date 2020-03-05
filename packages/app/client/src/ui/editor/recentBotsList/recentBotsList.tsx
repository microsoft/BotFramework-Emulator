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
import { SmallHeader, TruncateText } from '@bfemulator/ui-react';
import * as React from 'react';
import { Component, ReactNode } from 'react';

import * as styles from './recentBotsList.scss';

export interface RecentBotsListProps {
  onBotSelected?: (bot: BotInfo) => void;
  onDeleteBotClick?: (path: string) => void;
  recentBots?: BotInfo[];
  showContextMenuForBot?: (bot: BotInfo) => void;
}

export class RecentBotsList extends Component<RecentBotsListProps, {}> {
  public render(): ReactNode {
    return (
      <div className={styles.section}>
        <SmallHeader className={styles.marginFix}>My Bots</SmallHeader>
        <ul className={`${styles.recentBotsList} ${styles.well}`}>
          {this.props.recentBots && this.props.recentBots.length ? (
            this.props.recentBots.slice(0, 10).map(
              (bot, index) =>
                bot && (
                  <li
                    className={styles.recentBot}
                    data-index={index}
                    key={bot.path}
                    onContextMenu={this.onBotContextMenu}
                  >
                    <button data-index={index} onClick={this.onBotClick} title={bot.path}>
                      <TruncateText>{bot.displayName}</TruncateText>
                    </button>
                    <TruncateText className={styles.recentBotPath} title={bot.path}>
                      {bot.path}
                    </TruncateText>
                    <div className={styles.recentBotActionBar}>
                      <button data-index={index} onClick={this.onDeleteBotClick} aria-label={'Remove bot'}>
                        <span />
                      </button>
                    </div>
                  </li>
                )
            )
          ) : (
            <li>
              <span className={styles.noBots}>
                <TruncateText>You have not opened any bots</TruncateText>
              </span>
            </li>
          )}
        </ul>
      </div>
    );
  }

  private onBotClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const { index } = event.currentTarget.dataset;
    const bot = this.props.recentBots[index] as BotInfo;
    this.props.onBotSelected(bot);
  };

  private onBotContextMenu = (event: React.MouseEvent<HTMLLIElement>): void => {
    const { index } = event.currentTarget.dataset;
    const bot: BotInfo = this.props.recentBots[index];
    this.props.showContextMenuForBot(bot);
  };

  private onDeleteBotClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    const { index } = event.currentTarget.dataset;
    const bot = this.props.recentBots[index];
    this.props.onDeleteBotClick(bot.path);
  };
}
