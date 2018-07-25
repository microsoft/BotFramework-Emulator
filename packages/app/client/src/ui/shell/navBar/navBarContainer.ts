import { connect } from 'react-redux';
import { NavBarComponent, NavBarProps } from './navBar';
import * as Constants from '../../../constants';
import { CommandServiceImpl } from '../../../platform/commands/commandServiceImpl';
import * as NavBarActions from '../../../data/action/navBarActions';
import { RootState } from '../../../data/store';
import * as ExplorerActions from '../../../data/action/explorerActions';
import * as EditorActions from '../../../data/action/editorActions';
import { SharedConstants } from '@bfemulator/app-shared';

const mapStateToProps = (state: RootState): NavBarProps => ({
  activeBot: state.bot.activeBot,
  notifications: state.notification.byId
});

const mapDispatchToProps = (dispatch, ownProps: NavBarProps): NavBarProps => ({
  showExplorer: show => dispatch(ExplorerActions.show(show)),
  navBarSelectionChanged: newSelection => dispatch(NavBarActions.select(newSelection)),
  openBotSettings: () => {
    const { Commands } = SharedConstants;
    CommandServiceImpl.call(Commands.Bot.OpenSettings, ownProps.activeBot);
  },
  openEmulatorSettings: () => {
    const { CONTENT_TYPE_APP_SETTINGS, DOCUMENT_ID_APP_SETTINGS } = Constants;
    dispatch(EditorActions.open(CONTENT_TYPE_APP_SETTINGS, DOCUMENT_ID_APP_SETTINGS, true, null));
  }
});

export const NavBar = connect(mapStateToProps, mapDispatchToProps)(NavBarComponent);
