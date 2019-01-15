import { BotInfo, newNotification, SharedConstants } from '@bfemulator/app-shared';
import { connect } from 'react-redux';
import { Action } from 'redux';
import { beginAdd } from '../../../data/action/notificationActions';
import { openContextMenuForBot } from '../../../data/action/welcomePageActions';
import { RootState } from '../../../data/store';
import { CommandServiceImpl } from '../../../platform/commands/commandServiceImpl';
import { RecentBotsList, RecentBotsListProps } from './recentBotsList';

const mapStateToProps = (state: RootState, ownProps: { [propName: string]: any }): RecentBotsListProps => {
  return {
    recentBots: state.bot.botFiles,
    ...ownProps
  };
};

const mapDispatchToProps = (dispatch: (action: Action) => void): RecentBotsListProps => {
  return {
    onDeleteBotClick: (path: string): Promise<any> =>
      CommandServiceImpl.remoteCall(SharedConstants.Commands.Bot.RemoveFromBotList, path),
    sendNotification: (error: Error) =>
      dispatch(beginAdd(newNotification(`An Error occurred on the Recent Bots List: ${ error }`))),
    showContextMenuForBot: (bot: BotInfo): void => dispatch(openContextMenuForBot(bot)),
  };
};

export const RecentBotsListContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(RecentBotsList);
