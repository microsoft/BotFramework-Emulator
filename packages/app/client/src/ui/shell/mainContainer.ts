import { connect } from "react-redux";

import * as Constants from "../../constants";
import * as PresentationActions from "../../data/action/presentationActions";
import { RootState } from "../../data/store";

import { Main, MainProps } from "./main";

const mapStateToProps = (state: RootState): MainProps => ({
  presentationModeEnabled: state.presentation.enabled,
  primaryEditor: state.editor.editors[Constants.EDITOR_KEY_PRIMARY],
  secondaryEditor: state.editor.editors[Constants.EDITOR_KEY_SECONDARY],
  explorerIsVisible: state.explorer.showing,
  navBarSelection: state.navBar.selection
});

const mapDispatchToProps = (dispatch): MainProps => ({
  exitPresentationMode: (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      dispatch(PresentationActions.disable());
    }
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Main);
