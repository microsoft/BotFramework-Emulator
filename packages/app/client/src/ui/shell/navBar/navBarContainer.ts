import { connect } from 'react-redux';
import { NavBarComponent, NavBarProps } from './navBar';
import * as Constants from '../../../constants';
import { MouseEvent } from 'react';
import { CommandServiceImpl } from '../../../platform/commands/commandServiceImpl';
import * as NavBarActions from '../../../data/action/navBarActions';
import { RootState } from '../../../data/store';
import * as ExplorerActions from '../../../data/action/explorerActions';
import * as EditorActions from '../../../data/action/editorActions';

const selectionMap = [
  Constants.NAVBAR_BOT_EXPLORER,
  Constants.NAVBAR_SERVICES
];
const mapStateToProps = (state: RootState): NavBarProps => ({
  activeBot: state.bot.activeBot
});

const mapDispatchToProps = (dispatch, ownProps: NavBarProps): NavBarProps => ({
  handleClick: (event: MouseEvent<HTMLAnchorElement>) => {
    const { selection: currentSelection } = ownProps;
    const { currentTarget: anchor } = event;
    const previousSelection = anchor.parentElement.querySelector('[aria-selected]');
    if (previousSelection) {
      previousSelection.removeAttribute('aria-selected');
    }

    const index = Array.prototype.indexOf.call(anchor.parentElement.children, anchor);
    switch (index) {
      // Bot Explorer
      case 0:
      // Services
      case 1:
        if (currentSelection === selectionMap[index]) {
          // toggle explorer when clicking the same navbar icon
          dispatch(ExplorerActions.show(!ownProps.showingExplorer));
        } else {
          // switch tabs and show explorer when clicking different navbar icon
          dispatch(() => {
            dispatch(NavBarActions.select(selectionMap[index]));
            dispatch(ExplorerActions.show(true));
          });
          anchor.setAttributeNode(document.createAttribute('aria-selected')); // boolean attr
        }
        break;

      // Bot Settings
      case 3:
        if (ownProps.activeBot) {
          CommandServiceImpl.call('bot-settings:open', ownProps.activeBot).catch();
        }
        break;

      // Settings
      default:
        const { CONTENT_TYPE_APP_SETTINGS, DOCUMENT_ID_APP_SETTINGS } = Constants;
        dispatch(EditorActions.open(CONTENT_TYPE_APP_SETTINGS, DOCUMENT_ID_APP_SETTINGS, true, null));
        break;
    }
  }
});

export const NavBar = connect(mapStateToProps, mapDispatchToProps)(NavBarComponent);
