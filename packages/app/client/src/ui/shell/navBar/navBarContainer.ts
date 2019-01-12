import { connect } from "react-redux";

import * as Constants from "../../../constants";
import * as EditorActions from "../../../data/action/editorActions";
import * as ExplorerActions from "../../../data/action/explorerActions";
import * as NavBarActions from "../../../data/action/navBarActions";
import { RootState } from "../../../data/store";

import { NavBarComponent, NavBarProps } from "./navBar";

const mapStateToProps = (state: RootState): NavBarProps => ({
  notifications: state.notification.allIds,
  botIsOpen: !!state.bot.activeBot
});

const mapDispatchToProps = (dispatch): NavBarProps => ({
  showExplorer: show => dispatch(ExplorerActions.showExplorer(show)),
  navBarSelectionChanged: newSelection =>
    dispatch(NavBarActions.select(newSelection)),
  openEmulatorSettings: () => {
    const { CONTENT_TYPE_APP_SETTINGS, DOCUMENT_ID_APP_SETTINGS } = Constants;
    dispatch(
      EditorActions.open({
        contentType: CONTENT_TYPE_APP_SETTINGS,
        documentId: DOCUMENT_ID_APP_SETTINGS,
        isGlobal: true,
        meta: null
      })
    );
  }
});

export const NavBar = connect(
  mapStateToProps,
  mapDispatchToProps
)(NavBarComponent);
