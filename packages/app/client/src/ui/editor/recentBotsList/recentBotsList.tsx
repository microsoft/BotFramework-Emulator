import { BotInfo } from '@bfemulator/app-shared';
import { SmallHeader, TruncateText } from '@bfemulator/ui-react';
import * as React from 'react';
import { Component, ReactNode } from 'react';
import * as styles from './recentBotsList.scss';

export interface RecentBotsListProps {
  onBotSelected?: (bot: BotInfo) => void;
  onDeleteBotClick?: (path: string) => Promise<any>;
  recentBots?: BotInfo[];
  sendNotification?: (error: Error) => void;
  showContextMenuForBot?: (bot: BotInfo) => void;
}

export class RecentBotsList extends Component<RecentBotsListProps, {}> {

  public render(): ReactNode {
    return (
      <div className={ styles.section }>
        <SmallHeader className={ styles.marginFix }>
          My Bots
        </SmallHeader>
        <ul className={ `${ styles.recentBotsList } ${ styles.well }` }>
          {
            this.props.recentBots && this.props.recentBots.length ?
              this.props.recentBots.slice(0, 10).map((bot, index) => bot &&
                <li
                  className={ styles.recentBot }
                  data-index={ index }
                  key={ bot.path }
                  onContextMenu={ this.onBotContextMenu }>
                  <button
                    data-index={ index }
                    onClick={ this.onBotClick }
                    title={ bot.path }>
                    <TruncateText>{ bot.displayName }</TruncateText>
                  </button>
                  <TruncateText
                    className={ styles.recentBotPath }
                    title={ bot.path }>
                    { bot.path }
                  </TruncateText>
                  <div className={ styles.recentBotActionBar }>
                    <button data-index={ index } onClick={ this.onDeleteBotClick }/>
                  </div>
                </li>)
              :
              <li>
                <span className={ styles.noBots }><TruncateText>You have not opened any bots</TruncateText></span>
              </li>
          }
        </ul>
      </div>
    );
  }

  private onBotClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const { index } = event.currentTarget.dataset;
    const bot = this.props.recentBots[index] as BotInfo;
    this.props.onBotSelected(bot);
  }

  private onBotContextMenu = (event: React.MouseEvent<HTMLLIElement>): void => {
    const { index } = event.currentTarget.dataset;
    const bot: BotInfo = this.props.recentBots[index];
    this.props.showContextMenuForBot(bot);
  }

  private onDeleteBotClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    const { index } = event.currentTarget.dataset;
    const bot = this.props.recentBots[index];
    try {
      await this.props.onDeleteBotClick(bot.path);
    } catch (e) {
      this.props.sendNotification(e);
    }
  }
}
